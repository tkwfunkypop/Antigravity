import React from "react";
import { useCurrentFrame, useVideoConfig, random } from "remotion";
import { LyricLine } from "../../data/lyrics";
import { loadFont as loadZenDots } from "@remotion/google-fonts/ZenDots";
import { loadFont as loadDotGothic16 } from "@remotion/google-fonts/DotGothic16";

loadZenDots();
loadDotGothic16();

const CYBER_FONT = "'Zen Dots', 'DotGothic16', sans-serif";

export const GlitchText: React.FC<{ line: LyricLine }> = ({ line }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Create jitter
    const jitterX = (random(frame) - 0.5) * 10;
    const jitterY = (random(frame + 1) - 0.5) * 10;

    // Occasional big glitch
    const isGlitchFrame = frame % 15 < 3;
    const skew = isGlitchFrame ? (random(frame + 2) - 0.5) * 40 : 0;

    // Clip path for "slice" effect
    const clipY = random(frame + 3) * 100;
    const clipHeight = 10 + random(frame + 4) * 40;

    return (
        <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
            {/* Main Text */}
            <div
                style={{
                    fontFamily: CYBER_FONT,
                    fontSize: 100,
                    color: "white",
                    transform: `translate(${jitterX}px, ${jitterY}px) skewX(${skew}deg)`,
                    textShadow: "4px 4px 0px #FF0055", // Cyberpunk pink shadow
                    ...line.style,
                }}
            >
                {line.text}
            </div>

            {/* Glitch Overlay (Slice) */}
            {isGlitchFrame && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        display: "flex",
                        justifyContent: "center",
                        fontFamily: CYBER_FONT,
                        fontSize: 100,
                        color: "#00FFFF", // Cyan glitch
                        clipPath: `polygon(0% ${clipY}%, 100% ${clipY}%, 100% ${clipY + clipHeight}%, 0% ${clipY + clipHeight}%)`,
                        transform: `translate(${jitterX * -2}px, ${jitterY}px) scale(1.05)`,
                        ...line.style,
                    }}
                >
                    {line.text}
                </div>
            )}
        </div>
    );
};
