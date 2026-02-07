---
title: Lyric & Telop Synchronization
impact: HIGH
impactDescription: enables frame-perfect text synchronization with audio
tags: lyrics, telop, sync, timing, subtitles
---

## LyricLine Data Structure

Define lyrics with precise timing using the `LyricLine` type:

```tsx
// src/data/lyrics.ts
export type EffectType = "bounce" | "fade" | "glitch" | "typewriter" | "neon" | "drop" | "wave" | "shake" | "scalePop";

export type LyricLine = {
    time: number;      // 開始時間（秒）
    text: string;      // 表示テキスト
    duration: number;  // 表示時間（秒）
    type: "lyric" | "title" | "credit" | "section";
    effect: EffectType;
    style?: React.CSSProperties;
};
```

## Smart Sync Timing Calculation

Calculate even intervals between known anchor points:

```tsx
// 2つのアンカーポイント間のギャップを計算
const START_TIME = 5.19;    // 最初の歌詞
const CHORUS_TIME = 40.07;  // サビ開始
const LINES_BETWEEN = 8;

const GAP = (CHORUS_TIME - START_TIME) / LINES_BETWEEN; // 4.36秒/行
```

## EffectRouter Pattern

Use switch-case for clean effect routing:

```tsx
// src/components/EffectRouter.tsx
export const EffectRouter: React.FC<{ line: LyricLine }> = ({ line }) => {
    switch (line.effect) {
        case "bounce": return <BounceText line={line} />;
        case "wave": return <WaveText line={line} />;
        case "shake": return <ShakeText line={line} />;
        case "scalePop": return <ScalePopText line={line} />;
        // ... other effects
        default: return <FadeText line={line} />;
    }
};
```

## Composition Assembly

Map lyrics to Sequences with frame-perfect timing:

```tsx
export const LyricVideo = () => {
    const { fps } = useVideoConfig();
    
    return (
        <AbsoluteFill>
            {lyrics.map((line, index) => {
                const startFrame = Math.round(line.time * fps);
                const durationFrames = Math.round(line.duration * fps);
                
                return (
                    <Sequence 
                        key={index} 
                        from={startFrame} 
                        durationInFrames={durationFrames}
                    >
                        <EffectRouter line={line} />
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};
```

## Whisper Integration (Optional)

Generate timing data from audio using Whisper API:

```bash
# OpenAI Whisper API出力をLyricLine形式に変換
whisper audio.mp3 --model medium --language ja --output_format json
```

## Best Practices

- **Position**: 歌詞は画面下部（bottom: 100px）、タイトルは上部
- **Visibility**: `text-shadow` で背景との視認性を確保
- **Pacing**: 10-15フレームの「余韻」を各セクション後に設ける
