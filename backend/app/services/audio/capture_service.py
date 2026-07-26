import sounddevice as sd
import numpy as np
import threading
import queue
import logging
from typing import Optional, Generator

logger = logging.getLogger(__name__)

TARGET_SAMPLE_RATE = 16000
TARGET_CHANNELS = 1
CHUNK_SECONDS = 3
CHUNK_SAMPLES = TARGET_SAMPLE_RATE * CHUNK_SECONDS


class AudioCaptureService:
    """Captures system audio from a virtual audio device (e.g. BlackHole).

    The idea: Zoom/Teams/Meet sends the other person's voice to the system
    audio output. By routing that output through BlackHole, we can capture it
    with sounddevice — without ever touching the user's microphone.
    """

    def __init__(self, device_name: Optional[str] = None):
        self.device_name = device_name
        self.device_index: Optional[int] = None
        self._stream: Optional[sd.InputStream] = None
        self._audio_queue: queue.Queue[np.ndarray] = queue.Queue()
        self._running = False
        self._thread: Optional[threading.Thread] = None

    def find_device(self) -> Optional[int]:
        """Find the input device matching device_name."""
        devices = sd.query_devices()
        keywords = ["blackhole", "black hole", "virtual", "loopback"]

        # Try exact name match first
        if self.device_name:
            for i, dev in enumerate(devices):
                if dev["name"].lower() == self.device_name.lower() and dev["max_input_channels"] > 0:
                    logger.info(f"Found audio device by name: {dev['name']} (index={i})")
                    self.device_index = i
                    return i

        # Try keyword match
        for i, dev in enumerate(devices):
            if dev["max_input_channels"] > 0:
                dev_lower = dev["name"].lower()
                if any(kw in dev_lower for kw in keywords):
                    logger.info(f"Found audio device by keyword: {dev['name']} (index={i})")
                    self.device_index = i
                    return i

        # Fallback: any multi-channel input device (likely virtual)
        for i, dev in enumerate(devices):
            if dev["max_input_channels"] >= 2 and dev["name"] != "MacBook Pro Microphone":
                logger.info(f"Using multi-channel input device: {dev['name']} (index={i})")
                self.device_index = i
                return i

        logger.warning("No virtual audio device found. Listing available input devices:")
        for i, dev in enumerate(devices):
            if dev["max_input_channels"] > 0:
                logger.warning(f"  [{i}] {dev['name']} (channels={dev['max_input_channels']})")

        return None

    def _audio_callback(self, indata: np.ndarray, frames: int, time_info, status):
        """Called by sounddevice for each audio block."""
        if status:
            logger.warning(f"Audio status: {status}")
        # Copy data (indata is reused by sounddevice)
        self._audio_queue.put(indata[:, 0].copy())

    def start(self) -> bool:
        """Start capturing audio from the virtual device."""
        if self._running:
            return True

        if self.device_index is None:
            if self.find_device() is None:
                logger.error(
                    "Cannot start capture: no virtual audio device found. "
                    "Install BlackHole: brew install blackhole-2ch"
                )
                return False

        try:
            dev_info = sd.query_devices(self.device_index)
            max_channels = min(dev_info["max_input_channels"], 2)
            device_sample_rate = int(dev_info["default_samplerate"])

            logger.info(
                f"Starting capture: device={dev_info['name']}, "
                f"channels={max_channels}, device_rate={device_sample_rate}"
            )

            self._stream = sd.InputStream(
                device=self.device_index,
                channels=max_channels,
                samplerate=device_sample_rate,
                dtype="float32",
                callback=self._audio_callback,
                blocksize=int(device_sample_rate * 0.1),  # 100ms blocks
            )
            self._stream.start()
            self._running = True

            logger.info("Audio capture started successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to start audio capture: {e}")
            return False

    def stop(self):
        """Stop capturing audio."""
        self._running = False
        if self._stream:
            try:
                self._stream.stop()
                self._stream.close()
            except Exception:
                pass
            self._stream = None
        # Drain the queue
        while not self._audio_queue.empty():
            try:
                self._audio_queue.get_nowait()
            except queue.Empty:
                break
        logger.info("Audio capture stopped")

    def chunks(self, target_rate: int = TARGET_SAMPLE_RATE) -> Generator[np.ndarray, None, None]:
        """Yield audio chunks of CHUNK_SAMPLES samples at the target sample rate.

        Resamples from the device's native rate if needed.
        """
        buffer: list[np.ndarray] = []
        total_samples = 0

        while self._running:
            try:
                chunk = self._audio_queue.get(timeout=0.5)
            except queue.Empty:
                continue

            # Resample if device rate differs from target
            device_rate = int(sd.query_devices(self.device_index)["default_samplerate"])
            if device_rate != target_rate:
                # Simple linear interpolation resampling
                ratio = target_rate / device_rate
                new_length = int(len(chunk) * ratio)
                indices = np.linspace(0, len(chunk) - 1, new_length)
                chunk = np.interp(indices, np.arange(len(chunk)), chunk).astype(np.float32)

            buffer.append(chunk)
            total_samples += len(chunk)

            if total_samples >= CHUNK_SAMPLES:
                audio = np.concatenate(buffer)
                # Trim to exact chunk size
                yield audio[:CHUNK_SAMPLES]
                # Keep remainder
                remainder = audio[CHUNK_SAMPLES:]
                if len(remainder) > 0:
                    buffer = [remainder]
                    total_samples = len(remainder)
                else:
                    buffer = []
                    total_samples = 0

        # Flush remaining audio
        if buffer:
            audio = np.concatenate(buffer)
            if len(audio) > TARGET_SAMPLE_RATE:  # At least 1 second
                yield audio

    def get_audio_level(self) -> float:
        """Return the current RMS audio level (0.0 to 1.0)."""
        try:
            chunk = self._audio_queue.get_nowait()
            rms = float(np.sqrt(np.mean(chunk ** 2)))
            return min(rms * 10, 1.0)  # Scale up for visibility
        except queue.Empty:
            return 0.0

    @staticmethod
    def list_audio_devices() -> list[dict]:
        """List all available input audio devices."""
        devices = sd.query_devices()
        result = []
        for i, dev in enumerate(devices):
            if dev["max_input_channels"] > 0:
                result.append({
                    "index": i,
                    "name": dev["name"],
                    "channels": dev["max_input_channels"],
                    "sample_rate": dev["default_samplerate"],
                })
        return result
