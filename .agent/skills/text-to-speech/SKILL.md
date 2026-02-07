---
name: text-to-speech
description: Convert text to lifelike speech using ElevenLabs AI voices. Use when generating voiceovers, narration audio, TTS output, or any text-to-speech conversion. Supports 74+ languages including Japanese, multiple quality/latency models, voice cloning, and streaming.
license: MIT
compatibility: Requires internet access and an ElevenLabs API key (ELEVENLABS_API_KEY).
metadata:
  author: elevenlabs
  version: "1.0"
---

# ElevenLabs Text-to-Speech

Generate natural speech from text - supports 74+ languages, multiple models for quality vs latency tradeoffs.

> **Setup:** See [Installation Guide](references/installation.md). For JavaScript, use `@elevenlabs/*` packages only.

## Quick Start

### Python

```python
from elevenlabs.client import ElevenLabs

client = ElevenLabs()

audio = client.text_to_speech.convert(
    text="Hello, welcome to ElevenLabs!",
    voice_id="JBFqnCBsd6RMkjVDRZzb",  # George
    model_id="eleven_multilingual_v2"
)

with open("output.mp3", "wb") as f:
    for chunk in audio:
        f.write(chunk)
```

### JavaScript

```javascript
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createWriteStream } from "fs";

const client = new ElevenLabsClient();
const audio = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
  text: "Hello, welcome to ElevenLabs!",
  modelId: "eleven_multilingual_v2",
});
audio.pipe(createWriteStream("output.mp3"));
```

### cURL

```bash
curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" \
  -d '{"text": "Hello!", "model_id": "eleven_multilingual_v2"}' --output output.mp3
```

## Models

| Model ID | Languages | Latency | Best For |
|----------|-----------|---------|----------|
| `eleven_v3` | 74 | Standard | Highest quality, emotional range |
| `eleven_multilingual_v2` | 29 | Standard | High quality, most use cases |
| `eleven_flash_v2_5` | 32 | ~75ms | Ultra-low latency, real-time |
| `eleven_flash_v2` | English | ~75ms | English-only, fastest |
| `eleven_turbo_v2_5` | 32 | Low | Balanced quality/speed |

## Voice IDs

Use pre-made voices or create custom voices in the dashboard.

**Popular voices:**
- `JBFqnCBsd6RMkjVDRZzb` - George (male, narrative)
- `EXAVITQu4vr4xnSDxMaL` - Sarah (female, soft)
- `onwK4e9ZLuTAKqWW03F9` - Daniel (male, authoritative)
- `XB0fDUnXU5powFXDhCwa` - Charlotte (female, conversational)

```python
voices = client.voices.get_all()
for voice in voices.voices:
    print(f"{voice.voice_id}: {voice.name}")
```

## Voice Settings

Fine-tune how the voice sounds:

- **Stability**: How consistent the voice stays. Lower = more emotional range, Higher = steady delivery.
- **Similarity boost**: How closely to match the original voice sample. Higher = more like original but may amplify artifacts.
- **Style**: Exaggerates voice's unique style characteristics (v2+ models only).
- **Speaker boost**: Post-processing that enhances clarity and voice similarity.

```python
from elevenlabs import VoiceSettings

audio = client.text_to_speech.convert(
    text="Customize my voice settings.",
    voice_id="JBFqnCBsd6RMkjVDRZzb",
    voice_settings=VoiceSettings(
        stability=0.5,
        similarity_boost=0.75,
        style=0.5,
        use_speaker_boost=True
    )
)
```

## Language Enforcement

Force specific language for pronunciation:

```python
audio = client.text_to_speech.convert(
    text="こんにちは、ElevenLabsへようこそ！",
    voice_id="JBFqnCBsd6RMkjVDRZzb",
    model_id="eleven_multilingual_v2",
    language_code="ja"  # ISO 639-1 code
)
```

## Text Normalization

Controls how numbers, dates, and abbreviations are converted to spoken words:

- `"auto"` (default): Model decides based on context
- `"on"`: Always normalize (natural speech)
- `"off"`: Speak literally

```python
audio = client.text_to_speech.convert(
    text="Call 1-800-555-0123 on 01/15/2026",
    voice_id="JBFqnCBsd6RMkjVDRZzb",
    apply_text_normalization="on"
)
```

## Request Stitching

When generating long audio in multiple requests, use stitching to avoid pops/tone shifts at boundaries:

```python
# First request
audio1 = client.text_to_speech.convert(
    text="This is the first part.",
    voice_id="JBFqnCBsd6RMkjVDRZzb",
    next_text="And this continues the story."
)

# Second request using previous context
audio2 = client.text_to_speech.convert(
    text="And this continues the story.",
    voice_id="JBFqnCBsd6RMkjVDRZzb",
    previous_text="This is the first part."
)
```

## Output Formats

| Format | Description |
|--------|-------------|
| `mp3_44100_128` | MP3 44.1kHz 128kbps (default) |
| `mp3_44100_192` | MP3 44.1kHz 192kbps (Creator+) |
| `pcm_16000` | Raw 16kHz - real-time processing |
| `pcm_24000` | Raw 24kHz - good balance for streaming |
| `pcm_44100` | Raw 44.1kHz (Pro+) - CD quality |
| `ulaw_8000` | μ-law 8kHz - telephony |

## Streaming

For real-time applications:

```python
audio_stream = client.text_to_speech.convert(
    text="This text will be streamed as audio.",
    voice_id="JBFqnCBsd6RMkjVDRZzb",
    model_id="eleven_flash_v2_5"  # Ultra-low latency
)

for chunk in audio_stream:
    play_audio(chunk)
```

## Tracking Costs

Monitor character usage via response headers:

```python
response = client.text_to_speech.convert.with_raw_response(
    text="Hello!", voice_id="JBFqnCBsd6RMkjVDRZzb", model_id="eleven_multilingual_v2"
)
audio = response.parse()
print(f"Characters used: {response.headers.get('x-character-count')}")
```

## Error Handling

```python
try:
    audio = client.text_to_speech.convert(
        text="Generate speech",
        voice_id="invalid-voice-id"
    )
except Exception as e:
    print(f"API error: {e}")
```

Common errors:
- **401**: Invalid API key
- **422**: Invalid parameters (check voice_id, model_id)
- **429**: Rate limit exceeded

## References

- [Installation Guide](references/installation.md)
