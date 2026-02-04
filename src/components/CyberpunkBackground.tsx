import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export const CyberpunkBackground: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    // Moving Grid
    const gridOffset = (frame * 2) % 100;

    return (
        <AbsoluteFill style={{ backgroundColor: "#050510", overflow: "hidden" }}>
            {/* 1. Retro Grid Floor */}
            <div
                style={{
                    position: "absolute",
                    bottom: -200,
                    left: -width / 2,
                    width: width * 2,
                    height: height,
                    background: `
            linear-gradient(transparent 0%, rgba(0, 255, 255, 0.2) 2px, transparent 3px),
            linear-gradient(90deg, transparent 0%, rgba(0, 255, 255, 0.2) 2px, transparent 3px)
          `,
                    backgroundSize: "100px 100px",
                    transform: `perspective(500px) rotateX(60deg) translateY(${gridOffset}px)`,
                    boxShadow: "0 0 100px rgba(0, 255, 255, 0.3)",
                }}
            />

            {/* 2. Top Ceiling Grid (Mirror) */}
            <div
                style={{
                    position: "absolute",
                    top: -300,
                    left: -width / 2,
                    width: width * 2,
                    height: height,
                    background: `
            linear-gradient(transparent 0%, rgba(255, 0, 255, 0.1) 2px, transparent 3px),
            linear-gradient(90deg, transparent 0%, rgba(255, 0, 255, 0.1) 2px, transparent 3px)
          `,
                    backgroundSize: "100px 100px",
                    transform: `perspective(500px) rotateX(-60deg) translateY(-${gridOffset}px)`,
                }}
            />

            {/* 3. Vignette & Scanlines */}
            <AbsoluteFill
                style={{
                    background: "radial-gradient(circle, transparent 40%, #000 100%)",
                    pointerEvents: "none",
                }}
            />
            <AbsoluteFill
                style={{
                    background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.3) 3px
          )`,
                    pointerEvents: "none",
                    opacity: 0.5,
                }}
            />
        </AbsoluteFill>
    );
};
