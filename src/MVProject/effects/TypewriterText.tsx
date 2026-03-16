import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { LyricLine } from "../../data/lyrics";
import { loadFont as loadZenDots } from "@remotion/google-fonts/ZenDots";
import { loadFont as loadDotGothic16 } from "@remotion/google-fonts/DotGothic16";

loadZenDots();
loadDotGothic16();

const CYBER_FONT = "'Zen Dots', 'DotGothic16', sans-serif";

export const TypewriterText: React.FC<{ line: LyricLine }> = ({ line }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Speed: 2 frames per character
    const progress = Math.floor(frame / 2);
    const textToShow = line.text.slice(0, progress);

    // Blinking cursor
    const showCursor = frame % 20 < 10;

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: CYBER_FONT,
                fontSize: 80,
                fontWeight: "bold",
                color: "#333", // Dark text for typewriter look? Or White? Usually generic.
                // Let's assume on dark background, so White.
                ...line.style,
            }}
        >
            <span style={{ color: "white" }}>
                {textToShow}
                <span style={{ opacity: showCursor ? 1 : 0, color: "#00FF00" }}>_</span>
            </span>
        </div>
    );
};
