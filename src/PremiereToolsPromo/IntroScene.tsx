import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

export const IntroScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Title animation
    const titleScale = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 100 },
    });

    const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: "clamp",
    });

    const subtitleOpacity = interpolate(frame, [30, 50], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const subtitleY = interpolate(frame, [30, 50], [30, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Icons animation
    const iconsOpacity = interpolate(frame, [60, 80], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const icons = ["🎙️", "✂️", "💬"];

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #1a0533 0%, #2d1b4e 30%, #1e3a5f 70%, #0a1628 100%)",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* Animated background gradient orbs */}
            <div
                style={{
                    position: "absolute",
                    width: 600,
                    height: 600,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(153,51,255,0.4) 0%, transparent 70%)",
                    filter: "blur(100px)",
                    left: "20%",
                    top: "20%",
                    transform: `scale(${1 + Math.sin(frame * 0.05) * 0.2})`,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    width: 500,
                    height: 500,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(0,150,255,0.3) 0%, transparent 70%)",
                    filter: "blur(80px)",
                    right: "15%",
                    bottom: "20%",
                    transform: `scale(${1 + Math.cos(frame * 0.04) * 0.15})`,
                }}
            />

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 30,
                    zIndex: 10,
                }}
            >
                {/* Main Title */}
                <div
                    style={{
                        fontSize: 140,
                        fontWeight: 900,
                        color: "white",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "-0.02em",
                        textShadow: "0 0 80px rgba(153, 51, 255, 0.8)",
                        transform: `scale(${titleScale})`,
                        opacity: titleOpacity,
                    }}
                >
                    PremiereTools
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: 36,
                        fontWeight: 500,
                        color: "#b794f6",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "0.1em",
                        opacity: subtitleOpacity,
                        transform: `translateY(${subtitleY}px)`,
                    }}
                >
                    AI-Powered Premiere Pro Extensions
                </div>

                {/* Three Icons */}
                <div
                    style={{
                        display: "flex",
                        gap: 60,
                        marginTop: 40,
                        opacity: iconsOpacity,
                    }}
                >
                    {icons.map((icon, i) => (
                        <div
                            key={i}
                            style={{
                                fontSize: 72,
                                transform: `translateY(${Math.sin((frame + i * 20) * 0.1) * 10}px)`,
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
