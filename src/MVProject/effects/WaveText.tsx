import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { LyricLine } from "../../data/lyrics";

export const WaveText: React.FC<{ line: LyricLine }> = ({ line }) => {
    const frame = useCurrentFrame();

    const chars = line.text.split("");


    // フェードインアニメーション
    const opacity = interpolate(frame, [0, 15], [0, 1], {
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
                // 波状のY軸オフセット（文字ごとに位相をずらす）
                const waveOffset = Math.sin((frame * 0.15) + (i * 0.5)) * 20;

                // 文字の出現ディレイ
                const charOpacity = interpolate(
                    frame,
                    [i * 2, i * 2 + 10],
                    [0, 1],
                    { extrapolateRight: "clamp" }
                );

                return (
                    <span
                        key={i}
                        style={{
                            display: "inline-block",
                            transform: `translateY(${waveOffset}px)`,
                            opacity: charOpacity,
                            fontSize: line.style?.fontSize ?? 80,
                            color: line.style?.color ?? "#00E5FF",
                            textShadow: "0 0 20px rgba(0, 229, 255, 0.8), 0 0 40px rgba(0, 229, 255, 0.4)",
                            fontWeight: "bold",
                            margin: "0 2px",
                        }}
                    >
                        {char === " " ? "\u00A0" : char}
                    </span>
                );
            })}
        </div>
    );
};
