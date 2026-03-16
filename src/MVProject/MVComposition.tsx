import React from "react";
import { AbsoluteFill, Audio, Sequence } from "remotion";
import { lyrics } from "./data/lyrics";
import { EffectRouter } from "./components/EffectRouter";
import { CyberpunkBackground } from "./components/CyberpunkBackground";
import { HUDOverlay } from "./components/HUDOverlay";
// @ts-ignore
import audioSource from "./Music/空蝉A.wav";

export const MVComposition: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: "#000000" }}>
            <Audio src={audioSource} />

            {/* Visuals */}
            <CyberpunkBackground />

            {/* Lyrics Sequence */}
            {lyrics.map((line, index) => {
                // Convert seconds to frames (assuming 30fps)
                const videoFps = 30;
                const startFrame = Math.round(line.time * videoFps);
                const durationFrames = Math.round(line.duration * videoFps);

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

            {/* HUD Overlay (Top Layer) */}
            <HUDOverlay />
        </AbsoluteFill>
    );
};
