from faster_whisper import WhisperModel
import numpy as np
from typing import AsyncGenerator, Generator
import asyncio


class TranscriptionService:
    """Real-time transcription using Faster-Whisper."""

    def __init__(self, model_size: str = "base.en"):
        self.model_size = model_size
        self.model = None

    def _load_model(self):
        """Lazy load the model."""
        if self.model is None:
            self.model = WhisperModel(
                self.model_size,
                device="cpu",  # Use "cuda" if GPU available
                compute_type="int8"
            )

    def transcribe(self, audio_data: np.ndarray, sample_rate: int = 16000) -> dict:
        """Transcribe audio data."""
        self._load_model()

        segments, info = self.model.transcribe(
            audio_data,
            beam_size=1,
            vad_filter=True,
            word_timestamps=True,
            language="en"
        )

        full_text = ""
        words = []

        for segment in segments:
            full_text += segment.text
            if segment.words:
                words.extend([
                    {"word": w.word, "start": w.start, "end": w.end}
                    for w in segment.words
                ])

        return {
            "text": full_text.strip(),
            "language": info.language,
            "confidence": info.language_probability,
            "timestamps": {"words": words} if words else None
        }

    def transcribe_stream(
        self,
        audio_chunks: Generator[np.ndarray, None, None]
    ) -> Generator[dict, None, None]:
        """Transcribe streaming audio."""
        buffer = []
        chunk_duration = 5  # seconds
        sample_rate = 16000

        for chunk in audio_chunks:
            buffer.append(chunk)

            # Check if we have enough audio
            total_samples = sum(len(c) for c in buffer)
            if total_samples >= chunk_duration * sample_rate:
                audio_data = np.concatenate(buffer)
                result = self.transcribe(audio_data, sample_rate)

                if result["text"].strip():
                    yield {
                        "type": "final",
                        "text": result["text"],
                        "confidence": result["confidence"]
                    }

                buffer = []

        # Process remaining audio
        if buffer:
            audio_data = np.concatenate(buffer)
            result = self.transcribe(audio_data, sample_rate)

            if result["text"].strip():
                yield {
                    "type": "final",
                    "text": result["text"],
                    "confidence": result["confidence"]
                }
