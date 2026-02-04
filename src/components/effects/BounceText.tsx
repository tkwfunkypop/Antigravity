import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LyricLine } from "../../data/lyrics";
import { loadFont as loadZenDots } from "@remotion/google-fonts/ZenDots";
import { loadFont as loadDotGothic16 } from "@remotion/google-fonts/DotGothic16";

loadZenDots();
loadDotGothic16();

const CYBER_FONT = "'Zen Dots', 'DotGothic16', sans-serif";


export const BounceText: React.FC<{ line: LyricLine }> = ({ line }) => {
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
                fontFamily: "'Potta One', cursive",
                ...line.style,
            }}
        >
            {chars.map((char, i) => {
                const delay = i * 2;

                const spr = spring({
                    frame: frame - delay,
                    fps,
                    config: {
                        damping: 12,
                        stiffness: 200,
                    },
                });

                return (
                    <span
                        key={i}
                        style={{
                            display: "inline-block",
                            transform: `scale(${spr}) translateY(${Math.sin(frame * 0.1 + i) * 10}px)`,
                            fontSize: 100,
                            color: "#FFD700",
                            textShadow: "4px 4px 0px #000",
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
