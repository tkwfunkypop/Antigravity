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

    // Sound wave bars animation
    const waveCount = 24;
    const waveBarHeights = Array.from({ length: waveCount }, (_, i) => {
        const phase = i * 0.5 + frame * 0.15;
        const base = Math.sin(phase) * 0.5 + 0.5;
        const pulse = Math.sin(frame * 0.08 + i * 0.3) * 0.3;
        return (base + pulse) * 100 + 20;
    });

    // Title spring entrance
    const titleProgress = spring({
        frame: frame - 15,
        fps,
        config: { damping: 12, stiffness: 80 },
    });

    const titleZ = interpolate(frame, [15, 45], [400, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
    });

    // Icon pulse
    const iconScale = spring({
        frame,
        fps,
        config: { damping: 8, stiffness: 60 },
    });

    const iconPulse = interpolate(
        Math.sin(frame * 0.1),
        [-1, 1],
        [0.95, 1.05]
    );

    // Tagline
    const taglineOpacity = interpolate(frame, [45, 60], [0, 1], { extrapolateRight: "clamp" });
    const taglineY = interpolate(frame, [45, 60], [25, 0], { extrapolateRight: "clamp" });

    // Rotating ring
    const ringRotate = frame * 0.4;

    return (
        <AbsoluteFill
            style={{
                background: "radial-gradient(ellipse at center, #1a0a3e 0%, #0a051a 70%, #050510 100%)",
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
                            border: `2px solid rgba(138, 43, 226, ${opacity})`,
                            transform: `scale(${scale}) rotateX(60deg) rotateZ(${ringRotate + i * 15}deg)`,
                            transformStyle: "preserve-3d",
                        }}
                    />
                );
            })}

            {/* Sound Wave Visualizer - Behind Title */}
            <div
                style={{
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    opacity: interpolate(frame, [5, 25], [0, 0.6], { extrapolateRight: "clamp" }),
                }}
            >
                {waveBarHeights.map((height, i) => (
                    <div
                        key={i}
                        style={{
                            width: 6,
                            height,
                            borderRadius: 3,
                            background: `linear-gradient(180deg, #00d9ff ${30}%, #8b5cf6 ${70}%, #c084fc)`,
                            boxShadow: "0 0 8px rgba(139, 92, 246, 0.5)",
                            transition: "height 0.1s ease",
                        }}
                    />
                ))}
            </div>

            {/* Central Glow */}
            <div
                style={{
                    position: "absolute",
                    width: 350,
                    height: 350,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",
                    transform: `scale(${iconScale})`,
                    boxShadow: "0 0 80px rgba(139, 92, 246, 0.4), 0 0 160px rgba(139, 92, 246, 0.2)",
                }}
            />

            {/* Sound Icon */}
            <div
                style={{
                    fontSize: 100,
                    transform: `translateZ(${titleZ}px) scale(${iconScale * iconPulse})`,
                    textShadow: "0 0 40px rgba(139, 92, 246, 0.8)",
                    marginBottom: 20,
                }}
            >
                🔊
            </div>

            {/* Title */}
            <h1
                style={{
                    fontSize: 92,
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #a78bfa 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                    transform: `translateZ(${titleZ}px) scale(${titleProgress})`,
                    margin: 0,
                    letterSpacing: -3,
                    textShadow: "0 0 30px rgba(139, 92, 246, 0.5)",
                }}
            >
                AudioSync
            </h1>

            {/* Tagline */}
            <p
                style={{
                    fontSize: 32,
                    color: "rgba(255, 255, 255, 0.7)",
                    marginTop: 24,
                    opacity: taglineOpacity,
                    transform: `translateY(${taglineY}px)`,
                    fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                    fontWeight: 300,
                    letterSpacing: 4,
                }}
            >
                ミリ秒精度の音声自動同期
            </p>
        </AbsoluteFill>
    );
};
