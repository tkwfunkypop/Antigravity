import React from "react";
import { LyricLine } from "../data/lyrics";
import { BounceText } from "./effects/BounceText";
import { GlitchText } from "./effects/GlitchText";
import { NeonText } from "./effects/NeonText";
import { TypewriterText } from "./effects/TypewriterText";
import { DropText } from "./effects/DropText";
import { WaveText } from "./effects/WaveText";
import { ShakeText } from "./effects/ShakeText";
import { ScalePopText } from "./effects/ScalePopText";

// Basic fade fallback
const FadeText: React.FC<{ line: LyricLine }> = ({ line }) => {
    return (
        <div style={{ ...line.style, fontSize: 80, color: "white", textAlign: "center", width: "100%" }}>
            {line.text}
        </div>
    );
};

export const EffectRouter: React.FC<{ line: LyricLine }> = ({ line }) => {
    switch (line.effect) {
        case "bounce":
            return <BounceText line={line} />;
        case "glitch":
            return <GlitchText line={line} />;
        case "neon":
            return <NeonText line={line} />;
        case "typewriter":
            return <TypewriterText line={line} />;
        case "drop":
            return <DropText line={line} />;
        case "wave":
            return <WaveText line={line} />;
        case "shake":
            return <ShakeText line={line} />;
        case "scalePop":
            return <ScalePopText line={line} />;
        case "fade":
        default:
            return <FadeText line={line} />;
    }
};
