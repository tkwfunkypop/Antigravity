---
title: AI Narration Integration
impact: HIGH
impactDescription: enables AI-powered voice narration for automated video production
tags: narration, audio, elevenlabs, ai, voice
---

## ElevenLabs Integration Pattern

Use the `elevenlabs.ts` utility for generating narration audio.

**Recommended Settings (Japanese):**

```tsx
// src/utils/elevenlabs.ts
export const ELEVENLABS_CONFIG = {
    modelId: "eleven_multilingual_v2",
    voiceSettings: {
        stability: 0.5,        // バランスの取れた音声
        similarityBoost: 0.75, // クリアな発声
        styleExaggeration: 0.3 // 適度な感情表現
    }
};
```

## NarrationAudio Component Usage

Use `NarrationAudio` to sequence multiple audio clips:

```tsx
import { NarrationAudio, NarrationTrackData } from "./components/NarrationAudio";

const narrationTracks: NarrationTrackData[] = [
    { filename: "intro.mp3", startFrame: 0, durationInFrames: 90 },
    { filename: "section1.mp3", startFrame: 100, durationInFrames: 150 },
    { filename: "outro.mp3", startFrame: 300, durationInFrames: 120 },
];

export const MyVideo = () => (
    <AbsoluteFill>
        <NarrationAudio tracks={narrationTracks} audioDirectory="audio/narration" />
        {/* Other content */}
    </AbsoluteFill>
);
```

## Timing Calculation

Use helper functions to convert between seconds and frames:

```tsx
import { secondsToFrames, estimateDuration } from "./utils/elevenlabs";

// 日本語テキストから推定再生時間を計算
const duration = estimateDuration("こんにちは、世界！"); // ~2秒

// 秒をフレームに変換
const startFrame = secondsToFrames(5.0, 30); // 150フレーム
```

## Audio File Preparation Workflow

1. **Script Generation**: AIで脚本を生成
2. **Voice Synthesis**: ElevenLabsでMP3生成
3. **Trim Silence**: 前後の無音をカット
4. **Import to public/**: `public/audio/narration/` に配置
5. **Track Definition**: `NarrationTrackData[]` を定義
6. **Composition**: `NarrationAudio` でシーケンス

## Best Practices

- **Filename Convention**: `01_intro.mp3`, `02_section1.mp3` のように番号付け
- **Buffer Frames**: ナレーション間に15-30フレームのギャップを設ける
- **Volume Normalization**: すべてのファイルを-14 LUFSで正規化
