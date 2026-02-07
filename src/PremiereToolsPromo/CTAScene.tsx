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

    const mainScale = spring({
        frame,
        fps,
        config: { damping: 10, stiffness: 80 },
    });

    const buttonPulse = 1 + Math.sin(frame * 0.15) * 0.03;

    const subtitleOpacity = interpolate(frame, [40, 60], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const iconsOpacity = interpolate(frame, [60, 80], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #1a0533 0%, #2d1b4e 50%, #0f3460 100%)",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* Background glow */}
            <div
                style={{
                    position: "absolute",
                    width: 1000,
                    height: 1000,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(153,51,255,0.4) 0%, transparent 60%)",
                    filter: "blur(100px)",
                    transform: `scale(${1 + Math.sin(frame * 0.08) * 0.1})`,
                }}
            />

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 40,
                    transform: `scale(${mainScale})`,
                    zIndex: 10,
                }}
            >
                {/* Stat highlight */}
                <div
                    style={{
                        fontSize: 120,
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #9966FF 0%, #00D4FF 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "-0.02em",
                    }}
                >
                    編集時間 50% 削減
                </div>

                {/* Button style element */}
                <div
                    style={{
                        background: "linear-gradient(135deg, #9966FF 0%, #7B2FBE 100%)",
                        padding: "30px 100px",
                        borderRadius: 60,
                        fontSize: 48,
                        fontWeight: 700,
                        color: "white",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        transform: `scale(${buttonPulse})`,
                        boxShadow: "0 15px 50px rgba(153, 102, 255, 0.6)",
                    }}
                >
                    PremiereTools
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: 32,
                        color: "#b794f6",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        opacity: subtitleOpacity,
                    }}
                >
                    AI × Premiere Pro で編集を革新
                </div>

                {/* Three icons */}
                <div
                    style={{
                        display: "flex",
                        gap: 40,
                        marginTop: 20,
                        opacity: iconsOpacity,
                    }}
                >
                    {["🎙️", "✂️", "💬"].map((icon, i) => (
                        <div
                            key={i}
                            style={{
                                fontSize: 56,
                                transform: `translateY(${Math.sin((frame + i * 15) * 0.12) * 8}px)`,
                            }}
                        >
                            {icon}
                        </div>
                    ))}
                </div>
            </div>
        </AbsoluteFill>
    );
};
