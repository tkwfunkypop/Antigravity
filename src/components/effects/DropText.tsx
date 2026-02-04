import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LyricLine } from "../../data/lyrics";
import { loadFont as loadZenDots } from "@remotion/google-fonts/ZenDots";
import { loadFont as loadDotGothic16 } from "@remotion/google-fonts/DotGothic16";

loadZenDots();
loadDotGothic16();

const CYBER_FONT = "'Zen Dots', 'DotGothic16', sans-serif";

export const DropText: React.FC<{ line: LyricLine }> = ({ line }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Fall from top
    const spr = spring({
        frame,
        fps,
        config: {
            damping: 15,
            mass: 2,
            stiffness: 150,
        },
    });

    // 0 -> 1. 
    // Start at -500px, end at 0.
    // Using interpolate or just math.
    // 1 - spr goes from 1 to 0? No, spring goes 0->1.

    // Let's implement individual char drop for more impact
    const chars = line.text.split("");

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                fontFamily: CYBER_FONT,
                overflow: "hidden", // Prevent seeing them above
                ...line.style,
            }}
        >
            {chars.map((char, i) => {
                const delay = i * 3;
                const charProgress = spring({
                    frame: frame - delay,
                    fps,
                    config: { damping: 15, mass: 1, stiffness: 200 }
                });

                // From -300 to 0
                const translateY = (1 - charProgress) * -300;
                const opacity = charProgress;

                return (
                    <span
                        key={i}
                        style={{
                            display: "inline-block",
                            transform: `translateY(${translateY}px)`,
                            opacity,
                            fontSize: 120,
                            color: "#FF4500", // Impact Orange
                            textShadow: "0px 10px 20px rgba(0,0,0,0.5)",
                        }}
                    >
                        {char === " " ? "\u00A0" : char}
                    </span>
                );
            })}
        </div>
    );
};
