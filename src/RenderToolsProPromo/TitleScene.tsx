import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
    Easing,
} from "remotion";

export const TitleScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Progress bar animation
    const progressWidth = interpolate(frame, [30, 120], [0, 100], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
    });

    // Title spring entrance
    const titleProgress = spring({
        frame: frame - 10,
        fps,
        config: { damping: 12, stiffness: 80 },
    });

    const titleZ = interpolate(frame, [10, 40], [400, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
    });

    // Icon
    const iconScale = spring({
        frame,
        fps,
        config: { damping: 8, stiffness: 60 },
    });

    // Tagline
    const taglineOpacity = interpolate(frame, [45, 60], [0, 1], { extrapolateRight: "clamp" });
    const taglineY = interpolate(frame, [45, 60], [25, 0], { extrapolateRight: "clamp" });

    // Rotating ring
    const ringRotate = frame * 0.3;

    // Flame-like particles
    const particles = Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2 + frame * 0.02;
        const radius = 180 + Math.sin(frame * 0.08 + i) * 30;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const size = 4 + Math.sin(frame * 0.15 + i * 2) * 2;
        const opacity = 0.3 + Math.sin(frame * 0.1 + i) * 0.2;
        return { x, y, size, opacity };
    });

    return (
        <AbsoluteFill
            style={{
                background: "radial-gradient(ellipse at center, #2a1a0a 0%, #1a0d05 70%, #100805 100%)",
                justifyContent: "center",
                alignItems: "center",
                perspective: 1200,
            }}
        >
            {/* Animated Background Rings */}
            {[...Array(5)].map((_, i) => {
                const delay = i * 8;
                const size = 200 + i * 150;
                const opacity = interpolate(
                    frame,
                    [delay, delay + 20],
                    [0, 0.12 - i * 0.02],
                    { extrapolateRight: "clamp" }
                );
                const scale = spring({
                    frame: frame - delay,
                    fps,
                    config: { damping: 15, stiffness: 40 },
                });

                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            width: size,
                            height: size,
                            borderRadius: "50%",
                            border: `2px solid rgba(255, 165, 0, ${opacity})`,
                            transform: `scale(${scale}) rotateX(60deg) rotateZ(${ringRotate + i * 15}deg)`,
                            transformStyle: "preserve-3d",
                        }}
                    />
                );
            })}

            {/* Floating particles */}
            {particles.map((p, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        width: p.size,
                        height: p.size,
                        borderRadius: "50%",
                        background: `radial-gradient(circle, rgba(255, 165, 0, ${p.opacity}), rgba(255, 100, 0, ${p.opacity * 0.5}))`,
                        transform: `translate(${p.x}px, ${p.y}px)`,
                        boxShadow: `0 0 ${p.size * 2}px rgba(255, 165, 0, ${p.opacity * 0.5})`,
                    }}
                />
            ))}

            {/* Central Glow */}
            <div
                style={{
                    position: "absolute",
                    width: 350,
                    height: 350,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(255, 165, 0, 0.25) 0%, transparent 70%)",
                    transform: `scale(${iconScale})`,
                    boxShadow: "0 0 80px rgba(255, 165, 0, 0.3), 0 0 160px rgba(255, 100, 0, 0.15)",
                }}
            />

            {/* Render Icon */}
            <div
                style={{
                    fontSize: 100,
                    transform: `translateZ(${titleZ}px) scale(${iconScale})`,
                    textShadow: "0 0 40px rgba(255, 165, 0, 0.8)",
                    marginBottom: 20,
                }}
            >
                🎬
            </div>

            {/* Title */}
            <h1
                style={{
                    fontSize: 86,
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #ff8c00 0%, #ffd700 50%, #ff6b00 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                    transform: `translateZ(${titleZ}px) scale(${titleProgress})`,
                    margin: 0,
                    letterSpacing: -3,
                }}
            >
                RenderTools Pro
            </h1>

            {/* Tagline */}
            <p
                style={{
                    fontSize: 30,
                    color: "rgba(255, 255, 255, 0.7)",
                    marginTop: 24,
                    opacity: taglineOpacity,
                    transform: `translateY(${taglineY}px)`,
                    fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                    fontWeight: 300,
                    letterSpacing: 4,
                }}
            >
                レンダリングをもっとシンプルに
            </p>

            {/* Animated Progress Bar */}
            <div
                style={{
                    marginTop: 30,
                    width: 400,
                    height: 6,
                    borderRadius: 3,
                    background: "rgba(255, 255, 255, 0.1)",
                    overflow: "hidden",
                    opacity: taglineOpacity,
                }}
            >
                <div
                    style={{
                        width: `${progressWidth}%`,
                        height: "100%",
                        borderRadius: 3,
                        background: "linear-gradient(90deg, #ff8c00, #ffd700)",
                        boxShadow: "0 0 10px rgba(255, 165, 0, 0.5)",
                    }}
                />
            </div>
        </AbsoluteFill>
    );
};
