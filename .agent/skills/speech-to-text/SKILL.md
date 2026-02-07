---
name: speech-to-text
description: Transcribe audio files to text using ElevenLabs Scribe. Use when transcribing audio, generating subtitles, extracting text from recordings, performing speaker diarization, or doing real-time speech recognition. Supports 90+ languages with word-level timestamps.
license: MIT
compatibility: Requires internet access and an ElevenLabs API key (ELEVENLABS_API_KEY).
metadata:
  author: elevenlabs
  version: "1.0"
---

# ElevenLabs Speech-to-Text

Transcribe audio to text with Scribe v2 - supports 90+ languages, speaker diarization, and word-level timestamps.

> **Setup:** See [Installation Guide](references/installation.md). For JavaScript, use `@elevenlabs/*` packages only.

## Quick Start

### Python

```python
from elevenlabs.client import ElevenLabs

client = ElevenLabs()

with open("audio.mp3", "rb") as audio_file:
    result = client.speech_to_text.convert(file=audio_file, model_id="scribe_v2")

print(result.text)
```

### JavaScript

```javascript
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createReadStream } from "fs";

const client = new ElevenLabsClient();
const result = await client.speechToText.convert({
  file: createReadStream("audio.mp3"),
  modelId: "scribe_v2",
});
console.log(result.text);
```

### cURL

```bash
curl -X POST "https://api.elevenlabs.io/v1/speech-to-text" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" -F "file=@audio.mp3" -F "model_id=scribe_v2"
```

## Models

| Model ID | Description | Best For |
|----------|-------------|----------|
| `scribe_v2` | State-of-the-art accuracy, 90+ languages | Batch transcription, subtitles, long-form audio |
| `scribe_v2_realtime` | Low latency (~150ms) | Live transcription, voice agents |

## Transcription with Timestamps

Word-level timestamps include type classification and speaker identification:

```python
result = client.speech_to_text.convert(
    file=audio_file, model_id="scribe_v2", timestamps_granularity="word"
)

for word in result.words:
    print(f"{word.text}: {word.start}s - {word.end}s (type: {word.type})")
```

## Speaker Diarization

Identify WHO said WHAT - the model labels each word with a speaker ID:

```python
result = client.speech_to_text.convert(
    file=audio_file,
    model_id="scribe_v2",
    diarize=True
)

for word in result.words:
    print(f"[{word.speaker_id}] {word.text}")
```

## Keyterm Prompting

Help the model recognize specific words (up to 100 terms):

```python
result = client.speech_to_text.convert(
    file=audio_file,
    model_id="scribe_v2",
    keyterms=["ElevenLabs", "Scribe", "API"]
)
```

## Language Detection

Automatic detection with optional language hint:

```python
result = client.speech_to_text.convert(
    file=audio_file,
    model_id="scribe_v2",
    language_code="jpn"  # ISO 639-1 or ISO 639-3 code
)

print(f"Detected: {result.language_code} ({result.language_probability:.0%})")
```

## Supported Formats

**Audio:** MP3, WAV, M4A, FLAC, OGG, WebM, AAC, AIFF, Opus
**Video:** MP4, AVI, MKV, MOV, WMV, FLV, WebM, MPEG, 3GPP

**Limits:** Up to 3GB file size, 10 hours duration

## Response Format

```json
{
  "text": "The full transcription text",
  "language_code": "eng",
  "language_probability": 0.98,
  "words": [
    {"text": "The", "start": 0.0, "end": 0.15, "type": "word", "speaker_id": "speaker_0"},
    {"text": " ", "start": 0.15, "end": 0.16, "type": "spacing", "speaker_id": "speaker_0"}
  ]
}
```

**Word types:**
- `word` - An actual spoken word
- `spacing` - Whitespace between words (useful for precise timing)
- `audio_event` - Non-speech sounds (laughter, applause, music, etc.)

## Real-Time Streaming

For live transcription with ultra-low latency (~150ms):

### Python (Server-Side)

```python
import asyncio
from elevenlabs.client import ElevenLabs

client = ElevenLabs()

async def transcribe_realtime():
    async with client.speech_to_text.realtime.connect(
        model_id="scribe_v2_realtime",
        include_timestamps=True,
    ) as connection:
        await connection.stream_url("https://example.com/audio.mp3")

        async for event in connection:
            if event.type == "partial_transcript":
                print(f"Partial: {event.text}")
            elif event.type == "committed_transcript":
                print(f"Final: {event.text}")

asyncio.run(transcribe_realtime())
```

### JavaScript (Client-Side with React)

```typescript
import { useScribe } from "@elevenlabs/react";

function TranscriptionComponent() {
  const [transcript, setTranscript] = useState("");

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    onPartialTranscript: (data) => console.log("Partial:", data.text),
    onCommittedTranscript: (data) => setTranscript((prev) => prev + data.text),
  });

  const start = async () => {
    const { token } = await fetch("/scribe-token").then((r) => r.json());
    await scribe.connect({
      token,
      microphone: { echoCancellation: true, noiseSuppression: true },
    });
  };

  return <button onClick={start}>Start Recording</button>;
}
```

## Error Handling

```python
try:
    result = client.speech_to_text.convert(file=audio_file, model_id="scribe_v2")
except Exception as e:
    print(f"Transcription failed: {e}")
```

Common errors:
- **401**: Invalid API key
- **422**: Invalid parameters
- **429**: Rate limit exceeded

## References

- [Installation Guide](references/installation.md)
