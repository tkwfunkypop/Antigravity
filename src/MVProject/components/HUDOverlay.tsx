import React from "react";
import { AbsoluteFill, useCurrentFrame, random } from "remotion";

export const HUDOverlay: React.FC = () => {
    const frame = useCurrentFrame();

    // Random HUD numbers
    const num1 = Math.floor(random(frame) * 1000);
    const num2 = (random(frame + 1) * 100).toFixed(2);

    // Glitch flash
    const isGlitch = random(frame + 10) > 0.95;
    const glitchColor = isGlitch ? "#FF0055" : "transparent";

    return (
        <AbsoluteFill style={{ pointerEvents: "none" }}>

            {/* Top Left: Tech Header */}
            <div style={{ position: "absolute", top: 40, left: 40, fontFamily: "monospace", color: "#00FFFF" }}>
                <div style={{ fontSize: 24, fontWeight: "bold" }}>SYSTEM: ONLINE</div>
                <div style={{ fontSize: 16, opacity: 0.7 }}>MEM: {num1} TB // CPU: {num2}%</div>
            </div>

            {/* Top Right: REC */}
            <div style={{ position: "absolute", top: 40, right: 40, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: frame % 30 < 15 ? "red" : "#500"
                }} />
                <div style={{ fontFamily: "monospace", color: "red", fontSize: 24 }}>REC</div>
            </div>

            {/* Corners */}
            <div style={{
                position: "absolute", bottom: 40, left: 40,
                width: 200, height: 2, background: "#00FFFF"
            }} />
            <div style={{
                position: "absolute", bottom: 40, left: 40,
                width: 2, height: 50, background: "#00FFFF"
            }} />

            <div style={{
                position: "absolute", bottom: 40, right: 40,
                width: 200, height: 2, background: "#FF00FF"
            }} />
            <div style={{
                position: "absolute", bottom: 40, right: 40,
                width: 2, height: 50, background: "#FF00FF"
            }} />

            {/* Screen Glitch Overlay */}
            {isGlitch && (
                <AbsoluteFill style={{
                    backgroundColor: glitchColor,
                    opacity: 0.1,
                    transform: `translateX(${random(frame) * 10}px)`
                }} />
            )}
        </AbsoluteFill>
    );
};
