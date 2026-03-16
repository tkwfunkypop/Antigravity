import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { LyricLine } from "../../data/lyrics";
import { loadFont as loadZenDots } from "@remotion/google-fonts/ZenDots";
import { loadFont as loadDotGothic16 } from "@remotion/google-fonts/DotGothic16";

loadZenDots();
loadDotGothic16();

const CYBER_FONT = "'Zen Dots', 'DotGothic16', sans-serif";

export const NeonText: React.FC<{ line: LyricLine }> = ({ line }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Flicker effect
    const flicker = Math.sin(frame * 0.8) > 0.5 ? 1 : 0.7;
    // Occasional dropout
    const dropout = frame % 60 > 58 ? 0.2 : 1;

    const opacity = flicker * dropout;

    const glowColor = "#B026FF"; // Neon Purple

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: CYBER_FONT,
                fontSize: 100,
                color: "#fff",
                opacity: opacity,
                textShadow: `
          0 0 7px #fff,
          0 0 10px #fff,
          0 0 21px #fff,
          0 0 42px ${glowColor},
          0 0 82px ${glowColor},
          0 0 92px ${glowColor},
          0 0 102px ${glowColor},
          0 0 151px ${glowColor}
        `,
                ...line.style,
            }}
        >
            {line.text}
        </div>
    );
};
