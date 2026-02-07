---
title: Text Animation Effects Library
impact: HIGH
impactDescription: provides reusable text animation components for dynamic typography
tags: text, animation, effects, typography, motion
---

## Available Effects

| Effect | Component | Description |
|--------|-----------|-------------|
| bounce | `<BounceText>` | スプリングバウンド + 波状Y軸動き |
| fade | FadeText (inline) | シンプルなフェードイン |
| glitch | `<GlitchText>` | ランダム位置ずれ + ノイズ |
| typewriter | `<TypewriterText>` | 1文字ずつ表示 + カーソル |
| neon | `<NeonText>` | text-shadow による発光 |
| drop | `<DropText>` | 上から落下 + バウンド着地 |
| wave | `<WaveText>` | 正弦波によるY軸揺れ |
| shake | `<ShakeText>` | ランダム微振動 |
| scalePop | `<ScalePopText>` | オーバーシュート付きスケール |

## Usage Pattern

```tsx
import { LyricLine } from "../data/lyrics";
import { WaveText, ShakeText, ScalePopText } from "./effects";

// エフェクトコンポーネントはすべて同じインターフェース
<WaveText line={lyricLine} />
<ShakeText line={lyricLine} intensity={5} />
<ScalePopText line={lyricLine} />
```

## Spring Animation Best Practices

Use `spring()` for natural motion:

```tsx
const spr = spring({
    frame: frame - delay,
    fps,
    config: {
        damping: 12,     // 減衰（低いほど弾む）
        stiffness: 200,  // 硬さ（高いほど素早い）
        mass: 0.8,       // 質量（高いほどゆっくり）
    },
});
```

## Deterministic Random for Multi-Lambda

Remotionのマルチワーカー環境では `Math.random()` が問題を起こすため、決定論的乱数を使用:

```tsx
const seededRandom = (seed: number): number => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
};

// フレームと文字インデックスをシードに使用
const offset = seededRandom(frame * 100 + charIndex) * 10;
```

## Custom Style Override

各エフェクトは `line.style` でカスタムスタイルを適用可能:

```tsx
const lyricLine: LyricLine = {
    text: "強調テキスト",
    effect: "neon",
    style: {
        fontSize: 120,
        color: "#FF00FF",
    },
};
```

## Per-Character Animation Pattern

文字単位のアニメーションは `string.split("")` + `map()` で実装:

```tsx
const chars = text.split("");

{chars.map((char: string, i: number) => {
    const delay = i * 2; // 文字ごとに2フレーム遅延
    const progress = spring({ frame: frame - delay, fps });
    
    return (
        <span 
            key={i}
            style={{ transform: `scale(${progress})` }}
        >
            {char === " " ? "\u00A0" : char}
        </span>
    );
})}
```

## Import from Barrel

```tsx
import { 
    BounceText,
    DropText,
    GlitchText,
    NeonText,
    TypewriterText,
    WaveText,
    ShakeText,
    ScalePopText,
} from "./components/effects";
```
