import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

export const CTAScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleScale = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 100 },
    });

    const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: "clamp",
    });

    const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const ctaOpacity = interpolate(frame, [40, 60], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const ctaScale = spring({
        frame: Math.max(0, frame - 40),
        fps,
        config: { damping: 10, stiffness: 120 },
    });

    // Pulsing effect on CTA button
    const pulse = 1 + Math.sin(frame * 0.12) * 0.03;

    const icons = ["✏️", "🏷", "📑", "🔲", "🔤"];

    return (
        <AbsoluteFill
            style={{
                background:
                    "linear-gradient(135deg, #1a0f00 0%, #2d1800 30%, #1e0f00 70%, #0a0500 100%)",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* Radiating glow */}
            <div
                style={{
                    position: "absolute",
                    width: 1000,
                    height: 1000,
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(255,154,0,0.2) 0%, transparent 55%)",
                    filter: "blur(60px)",
                    transform: `scale(${1 + Math.sin(frame * 0.05) * 0.15})`,
                }}
            />

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 28,
                    zIndex: 10,
                }}
            >
                {/* Icons row */}
                <div
                    style={{
                        display: "flex",
                        gap: 40,
                        opacity: titleOpacity,
                    }}
                >
                    {icons.map((icon, i) => {
                        const iconDelay = 5 + i * 6;
                        const iconOpacity = interpolate(
                            frame,
                            [iconDelay, iconDelay + 12],
                            [0, 1],
                            {
                                extrapolateLeft: "clamp",
                                extrapolateRight: "clamp",
                            }
                        );
                        const iconY = interpolate(
                            frame,
                            [iconDelay, iconDelay + 12],
                            [20, 0],
                            {
                                extrapolateLeft: "clamp",
                                extrapolateRight: "clamp",
                            }
                        );

                        return (
                            <div
                                key={i}
                                style={{
                                    fontSize: 56,
                                    opacity: iconOpacity,
                                    transform: `translateY(${iconY}px)`,
                                    filter: "drop-shadow(0 4px 15px rgba(255,154,0,0.3))",
                                }}
                            >
                                {icon}
                            </div>
                        );
                    })}
                </div>

                {/* Title */}
                <div
                    style={{
                        fontSize: 100,
                        fontWeight: 900,
                        color: "white",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "-0.02em",
                        textShadow: "0 0 60px rgba(255, 154, 0, 0.5)",
                        transform: `scale(${titleScale})`,
                        opacity: titleOpacity,
                    }}
                >
                    IlScripts
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: 32,
                        fontWeight: 400,
                        color: "#FFB74D",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "0.05em",
                        opacity: subtitleOpacity,
                    }}
                >
                    5 Tools for Illustrator — Free Download
                </div>

                {/* CTA Button */}
                <div
                    style={{
                        marginTop: 20,
                        padding: "18px 60px",
                        background:
                            "linear-gradient(135deg, #FF9A00 0%, #FF6D00 100%)",
                        borderRadius: 50,
                        fontSize: 28,
                        fontWeight: 700,
                        color: "white",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "0.05em",
                        opacity: ctaOpacity,
                        transform: `scale(${Math.max(0.8, ctaScale) * pulse})`,
                        boxShadow:
                            "0 8px 40px rgba(255, 154, 0, 0.4), 0 0 80px rgba(255, 109, 0, 0.2)",
                    }}
                >
                    ↓ Download Now
                </div>
            </div>
        </AbsoluteFill>
    );
};
