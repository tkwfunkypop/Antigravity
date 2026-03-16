import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
} from "remotion";

export const CTAScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Pulsing glow
    const pulseGlow = interpolate(
        Math.sin(frame * 0.12),
        [-1, 1],
        [0.6, 1]
    );

    // Rotating circles
    const circleRotate = frame * 0.5;

    // Content animations
    const logoScale = spring({
        frame,
        fps,
        config: { damping: 8, stiffness: 60 },
    });

    const titleOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" });
    const taglineOpacity = interpolate(frame, [35, 50], [0, 1], { extrapolateRight: "clamp" });
    const ctaScale = spring({
        frame: frame - 55,
        fps,
        config: { damping: 10, stiffness: 80 },
    });

    // Sound wave bars for CTA
    const waveCount = 16;
    const waveBars = Array.from({ length: waveCount }, (_, i) => {
        const phase = i * 0.6 + frame * 0.12;
        return Math.sin(phase) * 0.5 + 0.5;
    });

    return (
        <AbsoluteFill
            style={{
                background: "radial-gradient(ellipse at 50% 50%, #1a0a3e 0%, #0d0520 50%, #050510 100%)",
                perspective: 1200,
                overflow: "hidden",
            }}
        >
            {/* Animated Background Rings */}
            {[...Array(4)].map((_, i) => {
                const size = 400 + i * 200;
                const opacity = 0.1 - i * 0.02;

                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            width: size,
                            height: size,
                            borderRadius: "50%",
                            border: `2px solid rgba(139, 92, 246, ${opacity * pulseGlow})`,
                            transform: `translate(-50%, -50%) rotateX(70deg) rotateZ(${circleRotate + i * 20}deg)`,
                        }}
                    />
                );
            })}

            {/* Central Glow */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 500,
                    height: 500,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, rgba(139, 92, 246, ${0.2 * pulseGlow}) 0%, rgba(6, 182, 212, ${0.1 * pulseGlow}) 40%, transparent 70%)`,
                    transform: "translate(-50%, -50%)",
                    filter: "blur(30px)",
                }}
            />

            {/* Sound wave decoration */}
            <div
                style={{
                    position: "absolute",
                    bottom: "12%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 5,
                    opacity: 0.25,
                }}
            >
                {waveBars.map((h, i) => (
                    <div
                        key={i}
                        style={{
                            width: 5,
                            height: h * 40 + 10,
                            borderRadius: 3,
                            background: "linear-gradient(180deg, #8b5cf6, #06b6d4)",
                        }}
                    />
                ))}
            </div>

            {/* Content Container */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 10,
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        fontSize: 100,
                        transform: `scale(${logoScale})`,
                        textShadow: "0 0 60px rgba(139, 92, 246, 0.8), 0 0 120px rgba(139, 92, 246, 0.4)",
                        marginBottom: 24,
                    }}
                >
                    🔊
                </div>

                {/* Title */}
                <h1
                    style={{
                        fontSize: 80,
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 40%, #a78bfa 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                        opacity: titleOpacity,
                        margin: 0,
                        letterSpacing: -2,
                    }}
                >
                    AudioSync
                </h1>

                {/* Tagline */}
                <p
                    style={{
                        fontSize: 30,
                        color: "rgba(255, 255, 255, 0.7)",
                        marginTop: 16,
                        opacity: taglineOpacity,
                        fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                        fontWeight: 400,
                    }}
                >
                    音声同期を完全自動化
                </p>

                {/* CTA Button */}
                <div
                    style={{
                        marginTop: 50,
                        padding: "20px 60px",
                        background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
                        borderRadius: 50,
                        transform: `scale(${ctaScale})`,
                        boxShadow: `0 0 40px rgba(139, 92, 246, ${0.5 * pulseGlow}), 0 10px 40px rgba(0, 0, 0, 0.3)`,
                    }}
                >
                    <span
                        style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: "#ffffff",
                            fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                        }}
                    >
                        今すぐダウンロード →
                    </span>
                </div>

                {/* Author */}
                <p
                    style={{
                        fontSize: 20,
                        color: "rgba(255, 255, 255, 0.4)",
                        marginTop: 30,
                        opacity: taglineOpacity,
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 300,
                    }}
                >
                    @tkwfunkypop
                </p>
            </div>
        </AbsoluteFill>
    );
};
