import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { LyricLine } from "../../data/lyrics";

// 決定論的な乱数生成（Remotionマルチワーカー対応）
const seededRandom = (seed: number): number => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
};

export const ShakeText: React.FC<{ line: LyricLine; intensity?: number }> = ({
    line,
    intensity = 5
}) => {
    const frame = useCurrentFrame();

    const chars = line.text.split("");

    // フェードインアニメーション
    const opacity = interpolate(frame, [0, 10], [0, 1], {
        extrapolateRight: "clamp",
    });

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                opacity,
                ...line.style,
            }}
        >
            {chars.map((char: string, i: number) => {
                // 各文字のランダムなオフセット（フレームごとに変化）
                const shakeX = (seededRandom(frame * 100 + i) - 0.5) * intensity * 2;
                const shakeY = (seededRandom(frame * 100 + i + 50) - 0.5) * intensity * 2;
                const rotation = (seededRandom(frame * 100 + i + 100) - 0.5) * intensity;

                return (
                    <span
                        key={i}
                        style={{
                            display: "inline-block",
                            transform: `translate(${shakeX}px, ${shakeY}px) rotate(${rotation}deg)`,
                            fontSize: line.style?.fontSize ?? 80,
                            color: line.style?.color ?? "#FF4444",
                            textShadow: "3px 3px 0px #000, -1px -1px 0px #000",
                            fontWeight: "bold",
                            margin: "0 1px",
                        }}
                    >
                        {char === " " ? "\u00A0" : char}
                    </span>
                );
            })}
        </div>
    );
};
