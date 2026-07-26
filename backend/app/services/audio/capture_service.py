import numpy as np
import threading
import queue
import logging
import platform
import sys
from typing import Optional, Generator

logger = logging.getLogger(__name__)

TARGET_SAMPLE_RATE = 16000
TARGET_CHANNELS = 1
CHUNK_SECONDS = 3
CHUNK_SAMPLES = TARGET_SAMPLE_RATE * CHUNK_SECONDS

# Platform detection
IS_WINDOWS = sys.platform == "win32"
IS_MACOS = sys.platform == "darwin"

# Lazy imports — soundcard only available on Windows
_sd = None
_soundcard = None


def _get_sounddevice():
    global _sd
    if _sd is None:
        import sounddevice as _s
        _sd = _s
    return _sd


def _get_soundcard():
    global _soundcard
    if _soundcard is None:
        import soundcard as _sc
        _soundcard = _sc
    return _soundcard


def _get_platform_info() -> str:
    """Return platform-specific audio device guidance."""
    if IS_WINDOWS:
        return (
            "System audio loopback should work automatically on Windows via WASAPI. "
            "If no audio is captured, try playing audio in Zoom/Teams/Meet and "
            "make sure your speakers/headphones are the default playback device."
        )
    elif IS_MACOS:
        return (
            "Install BlackHole: brew install blackhole-2ch "
            "then create an Aggregate Device in Audio MIDI Setup."
        )
    return "Install a virtual audio loopback device for your platform."


class AudioCaptureService:
    """Captures system audio output — the other person's voice.

    macOS: Routes through BlackHole (virtual audio device) via sounddevice.
    Windows: Uses WASAPI loopback via soundcard (built into Windows, zero install).

    The idea: Zoom/Teams/Meet sends the other person's voice to the system
    audio output. By capturing that output (via loopback), we get their voice
    without ever touching the user's microphone.
    """

    def __init__(self, device_name: Optional[str] = None):
        self.device_name = device_name
        self.device_index: Optional[int] = None  # sounddevice index (macOS)
        self._stream = None  # sounddevice.InputStream (macOS)
        self._loopback_mic = None  # speaker name for WASAPI loopback (Windows)
        self._audio_queue: queue.Queue = queue.Queue()
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._device_sample_rate: int = TARGET_SAMPLE_RATE

    # ─────────────────────────────────────────────────────────────
    # DEVICE DISCOVERY
    # ─────────────────────────────────────────────────────────────

    def find_device(self) -> Optional[int]:
        """Find the best audio capture device. Returns a sounddevice index (macOS)
        or a non-None sentinel for Windows WASAPI loopback."""
        if IS_WINDOWS:
            return self._find_windows_loopback()
        else:
            return self._find_macos_device()

    def _find_windows_loopback(self) -> Optional[int]:
        """Find a WASAPI loopback-capable speaker on Windows. No install needed."""
        try:
            sc = _get_soundcard()
            speakers = sc.all_speakers()
            if not speakers:
                logger.warning("No speakers found via soundcard (WASAPI)")
                return None

            # Prefer default speaker
            default_speaker = sc.default_speaker()
            if default_speaker:
                logger.info(f"Using default speaker for WASAPI loopback: {default_speaker.name}")
                self._loopback_mic = default_speaker.name  # store name for start()
                return 0  # sentinel: non-None means "found"

            # Fallback to first speaker
            speaker = speakers[0]
            logger.info(f"Using speaker for WASAPI loopback: {speaker.name}")
            self._loopback_mic = speaker.name
            return 0

        except Exception as e:
            logger.error(f"Failed to find WASAPI loopback device: {e}")
            return None

    def _find_macos_device(self) -> Optional[int]:
        """Find a virtual audio device on macOS (BlackHole, etc.)."""
        sd = _get_sounddevice()
        devices = sd.query_devices()
        keywords = [
            "blackhole", "black hole", "virtual", "loopback",
            "cable", "vb-audio", "virtual cable", "stereo mix",
            "wave link", "voicemeeter", "wave input",
        ]

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

        # Platform-aware fallback: prefer virtual/loopback devices
        for i, dev in enumerate(devices):
            if dev["max_input_channels"] >= 1:
                dev_lower = dev["name"].lower()
                if any(kw in dev_lower for kw in ["stereo mix", "what u hear", "loopback"]):
                    logger.info(f"Using loopback device: {dev['name']} (index={i})")
                    self.device_index = i
                    return i

        # Last resort: multi-channel input (likely virtual)
        for i, dev in enumerate(devices):
            if dev["max_input_channels"] >= 2:
                logger.info(f"Using multi-channel input device: {dev['name']} (index={i})")
                self.device_index = i
                return i

        # Absolute last resort: ANY input device (user's mic)
        # On macOS without BlackHole, this is the only option
        for i, dev in enumerate(devices):
            if dev["max_input_channels"] > 0:
                logger.warning(
                    f"No virtual audio device found. Using built-in mic: {dev['name']}. "
                    f"Note: This captures your voice, not the other person's. "
                    f"{_get_platform_info()}"
                )
                self.device_index = i
                return i

        logger.warning("No audio device found. Available input devices:")
        for i, dev in enumerate(devices):
            if dev["max_input_channels"] > 0:
                logger.warning(f"  [{i}] {dev['name']} (channels={dev['max_input_channels']})")

        return None

    # ─────────────────────────────────────────────────────────────
    # AUDIO CAPTURE
    # ─────────────────────────────────────────────────────────────

    def _audio_callback(self, indata: np.ndarray, frames: int, time_info, status):
        """Called by sounddevice for each audio block (macOS)."""
        if status:
            logger.warning(f"Audio status: {status}")
        self._audio_queue.put(indata[:, 0].copy())

    def _wasapi_loopback_thread(self, speaker_name: str):
        """Background thread for WASAPI loopback capture on Windows."""
        try:
            sc = _get_soundcard()
            speaker = None
            for s in sc.all_speakers():
                if s.name == speaker_name:
                    speaker = s
                    break
            if speaker is None:
                speaker = sc.default_speaker()

            mic = speaker.loopback_recorder()
            # Get sample rate from the loopback recorder's specs
            sample_rate = getattr(mic, 'specs', None)
            if sample_rate and hasattr(sample_rate, 'sample_rate'):
                self._device_sample_rate = int(sample_rate.sample_rate)
            else:
                self._device_sample_rate = 44100  # default WASAPI rate
            channels = getattr(mic, 'specs', None)
            channel_count = channels.channels if channels and hasattr(channels, 'channels') else 2
            logger.info(
                f"WASAPI loopback started: {speaker.name}, "
                f"rate={self._device_sample_rate}, channels={channel_count}"
            )

            with mic:
                while self._running:
                    data = mic.record(numframes=1024)  # ~23ms at 44100Hz
                    if data is None or len(data) == 0:
                        continue
                    # Take first channel (mono)
                    if data.ndim > 1:
                        data = data[:, 0].copy()
                    else:
                        data = data.copy()
                    self._audio_queue.put(data.astype(np.float32))

        except Exception as e:
            logger.error(f"WASAPI loopback thread error: {e}")
            self._running = False

    def start(self) -> bool:
        """Start capturing audio."""
        if self._running:
            return True

        if IS_WINDOWS:
            return self._start_windows()
        else:
            return self._start_macos()

    def _start_windows(self) -> bool:
        """Start WASAPI loopback capture on Windows."""
        if self._loopback_mic is None:
            if self.find_device() is None:
                logger.error(
                    f"Cannot start capture: no WASAPI loopback device found. "
                    f"{_get_platform_info()}"
                )
                return False

        self._running = True
        self._thread = threading.Thread(
            target=self._wasapi_loopback_thread,
            args=(self._loopback_mic,),
            daemon=True,
        )
        self._thread.start()
        logger.info("Windows WASAPI loopback capture started")
        return True

    def _start_macos(self) -> bool:
        """Start sounddevice capture on macOS (BlackHole)."""
        sd = _get_sounddevice()

        if self.device_index is None:
            if self.find_device() is None:
                logger.error(
                    f"Cannot start capture: no audio device found. "
                    f"{_get_platform_info()}"
                )
                return False

        try:
            dev_info = sd.query_devices(self.device_index)
            max_channels = min(dev_info["max_input_channels"], 2)
            self._device_sample_rate = int(dev_info["default_samplerate"])

            logger.info(
                f"Starting capture: device={dev_info['name']}, "
                f"channels={max_channels}, device_rate={self._device_sample_rate}"
            )

            self._stream = sd.InputStream(
                device=self.device_index,
                channels=max_channels,
                samplerate=self._device_sample_rate,
                dtype="float32",
                callback=self._audio_callback,
                blocksize=int(self._device_sample_rate * 0.1),
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

        # macOS: stop sounddevice stream
        if self._stream:
            try:
                self._stream.stop()
                self._stream.close()
            except Exception:
                pass
            self._stream = None

        # Windows: wait for thread to exit
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2.0)
            self._thread = None

        # Drain the queue
        while not self._audio_queue.empty():
            try:
                self._audio_queue.get_nowait()
            except queue.Empty:
                break
        logger.info("Audio capture stopped")

    # ─────────────────────────────────────────────────────────────
    # AUDIO CHUNKS + RESAMPLING
    # ─────────────────────────────────────────────────────────────

    def chunks(self, target_rate: int = TARGET_SAMPLE_RATE) -> Generator[np.ndarray, None, None]:
        """Yield audio chunks of CHUNK_SAMPLES samples at the target sample rate."""
        buffer: list[np.ndarray] = []
        total_samples = 0

        while self._running:
            try:
                chunk = self._audio_queue.get(timeout=0.5)
            except queue.Empty:
                continue

            # Resample if device rate differs from target
            device_rate = self._device_sample_rate
            if device_rate != target_rate:
                ratio = target_rate / device_rate
                new_length = int(len(chunk) * ratio)
                indices = np.linspace(0, len(chunk) - 1, new_length)
                chunk = np.interp(indices, np.arange(len(chunk)), chunk).astype(np.float32)

            buffer.append(chunk)
            total_samples += len(chunk)

            if total_samples >= CHUNK_SAMPLES:
                audio = np.concatenate(buffer)
                yield audio[:CHUNK_SAMPLES]
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
            if len(audio) > TARGET_SAMPLE_RATE:
                yield audio

    def get_audio_level(self) -> float:
        """Return the current RMS audio level (0.0 to 1.0)."""
        try:
            chunk = self._audio_queue.get_nowait()
            rms = float(np.sqrt(np.mean(chunk ** 2)))
            return min(rms * 10, 1.0)
        except queue.Empty:
            return 0.0

    @staticmethod
    def list_audio_devices() -> list[dict]:
        """List all available audio devices."""
        result = []

        if IS_WINDOWS:
            try:
                sc = _get_soundcard()
                for s in sc.all_speakers():
                    result.append({
                        "index": 0,
                        "name": f"[WASAPI Loopback] {s.name}",
                        "channels": s.channels,
                        "sample_rate": 0,  # determined at capture time
                        "type": "speaker_loopback",
                    })
            except Exception as e:
                logger.error(f"Failed to list WASAPI speakers: {e}")
        else:
            sd = _get_sounddevice()
            devices = sd.query_devices()
            for i, dev in enumerate(devices):
                if dev["max_input_channels"] > 0:
                    result.append({
                        "index": i,
                        "name": dev["name"],
                        "channels": dev["max_input_channels"],
                        "sample_rate": dev["default_samplerate"],
                        "type": "input",
                    })

        return result
