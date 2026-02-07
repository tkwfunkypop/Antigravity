import React from "react";
import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { LyricLine } from "../../data/lyrics";

export const ScalePopText: React.FC<{ line: LyricLine }> = ({ line }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const chars = line.text.split("");

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                ...line.style,
            }}
        >
            {chars.map((char: string, i: number) => {
                const delay = i * 3;

                // スプリングでバウンド付きスケール
                const scale = spring({
                    frame: frame - delay,
                    fps,
                    config: {
                        damping: 8,
                        stiffness: 150,
                        mass: 0.8,
                    },
                });

                // オーバーシュート効果（一度大きくなってから戻る）
                const overshootScale = interpolate(
                    scale,
                    [0, 0.5, 1],
                    [0, 1.3, 1],
                    { extrapolateRight: "clamp" }
                );

                // フェードイン
                const opacity = interpolate(
                    frame - delay,
                    [0, 5],
                    [0, 1],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );

                return (
                    <span
                        key={i}
                        style={{
                            display: "inline-block",
                            transform: `scale(${overshootScale})`,
                            opacity,
                            fontSize: line.style?.fontSize ?? 90,
                            color: line.style?.color ?? "#FFD700",
                            textShadow: "0 0 30px rgba(255, 215, 0, 0.8), 4px 4px 0px rgba(0,0,0,0.5)",
                            fontWeight: "bold",
                            margin: "0 3px",
                        }}
                    >
                        {char === " " ? "\u00A0" : char}
                    </span>
                );
            })}
        </div>
    );
};
