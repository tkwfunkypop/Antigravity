import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
    Easing,
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

    const circleRotate = frame * 0.5;

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

    // Animated progress bar
    const progressWidth = interpolate(frame, [60, 150], [0, 100], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
    });

    return (
        <AbsoluteFill
            style={{
                background: "radial-gradient(ellipse at 50% 50%, #2a1a0a 0%, #150d05 50%, #050510 100%)",
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
                            border: `2px solid rgba(255, 165, 0, ${opacity * pulseGlow})`,
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
                    background: `radial-gradient(circle, rgba(255, 165, 0, ${0.2 * pulseGlow}) 0%, rgba(255, 215, 0, ${0.1 * pulseGlow}) 40%, transparent 70%)`,
                    transform: "translate(-50%, -50%)",
                    filter: "blur(30px)",
                }}
            />

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
                        textShadow: "0 0 60px rgba(255, 165, 0, 0.8), 0 0 120px rgba(255, 100, 0, 0.4)",
                        marginBottom: 24,
                    }}
                >
                    🎬
                </div>

                {/* Title */}
                <h1
                    style={{
                        fontSize: 76,
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #ff8c00 0%, #ffd700 40%, #ff6b00 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                        opacity: titleOpacity,
                        margin: 0,
                        letterSpacing: -2,
                    }}
                >
                    RenderTools Pro
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
                    レンダリングをもっとシンプルに
                </p>

                {/* Mini progress bar */}
                <div
                    style={{
                        marginTop: 24,
                        width: 300,
                        height: 4,
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.1)",
                        overflow: "hidden",
                        opacity: taglineOpacity,
                    }}
                >
                    <div
                        style={{
                            width: `${progressWidth}%`,
                            height: "100%",
                            borderRadius: 2,
                            background: "linear-gradient(90deg, #ff8c00, #ffd700)",
                            boxShadow: "0 0 8px rgba(255, 165, 0, 0.5)",
                        }}
                    />
                </div>

                {/* CTA Button */}
                <div
                    style={{
                        marginTop: 45,
                        padding: "20px 60px",
                        background: "linear-gradient(135deg, #ff8c00 0%, #ffd700 100%)",
                        borderRadius: 50,
                        transform: `scale(${ctaScale})`,
                        boxShadow: `0 0 40px rgba(255, 165, 0, ${0.5 * pulseGlow}), 0 10px 40px rgba(0, 0, 0, 0.3)`,
                    }}
                >
                    <span
                        style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: "#1a0d05",
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
