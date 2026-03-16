import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

export const ScriptNameScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const logoScale = spring({
        frame,
        fps,
        config: { damping: 10, stiffness: 120 },
    });

    const titleOpacity = interpolate(frame, [5, 25], [0, 1], {
        extrapolateRight: "clamp",
    });

    const subtitleOpacity = interpolate(frame, [25, 45], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const lineWidth = interpolate(frame, [15, 50], [0, 500], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const glowPulse = 1 + Math.sin(frame * 0.08) * 0.2;

    return (
        <AbsoluteFill
            style={{
                background:
                    "linear-gradient(135deg, #0a0a1a 0%, #0d1025 50%, #0a0a1a 100%)",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* Background glow */}
            <div
                style={{
                    position: "absolute",
                    width: 700,
                    height: 700,
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(0,200,255,0.2) 0%, transparent 60%)",
                    filter: "blur(120px)",
                    transform: `scale(${glowPulse})`,
                }}
            />

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 20,
                    zIndex: 10,
                }}
            >
                {/* Scissors icon */}
                <div
                    style={{
                        fontSize: 100,
                        transform: `scale(${logoScale})`,
                        filter: "drop-shadow(0 4px 30px rgba(0,200,255,0.6))",
                    }}
                >
                    ✂️
                </div>

                {/* Title */}
                <div
                    style={{
                        fontSize: 90,
                        fontWeight: 900,
                        color: "white",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "-0.02em",
                        textShadow:
                            "0 0 80px rgba(0,200,255,0.5), 0 0 160px rgba(0,200,255,0.2)",
                        transform: `scale(${logoScale})`,
                        opacity: titleOpacity,
                    }}
                >
                    SmartAutoCut
                </div>

                {/* Accent line */}
                <div
                    style={{
                        width: lineWidth,
                        height: 3,
                        background:
                            "linear-gradient(90deg, transparent, #00c8ff, transparent)",
                        borderRadius: 2,
                    }}
                />

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: 28,
                        fontWeight: 500,
                        color: "#64ffda",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        opacity: subtitleOpacity,
                    }}
                >
                    AI-Powered Auto Editing for Premiere Pro
                </div>
            </div>
        </AbsoluteFill>
    );
};
