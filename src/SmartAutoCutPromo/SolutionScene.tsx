import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
} from "remotion";

const FEATURES = [
    { icon: "🎙️", title: "Whisper AI", desc: "高精度音声認識", color: "#00d9ff" },
    { icon: "✂️", title: "自動カット", desc: "無音・失敗を検出", color: "#00ff88" },
    { icon: "⚡", title: "ワンクリック", desc: "ボタン1つで完了", color: "#ffd700" },
];

export const SolutionScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Orbit animation
    const orbitAngle = interpolate(frame, [0, 180], [0, 30], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: "radial-gradient(ellipse at 50% 50%, #0a2a3a 0%, #0a1a2a 50%, #050510 100%)",
                perspective: 1200,
                overflow: "hidden",
            }}
        >
            {/* Animated Grid Lines */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `
                        linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: "80px 80px",
                    transform: `perspective(500px) rotateX(60deg) translateY(${frame * 2}px)`,
                    transformOrigin: "center top",
                }}
            />

            {/* Central Glow */}
            <div
                style={{
                    position: "absolute",
                    width: 600,
                    height: 600,
                    background: "radial-gradient(circle, rgba(0, 217, 255, 0.15) 0%, transparent 60%)",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                }}
            />

            {/* Content */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    transform: `rotateY(${orbitAngle - 15}deg)`,
                    transformStyle: "preserve-3d",
                }}
            >
                {/* Header */}
                <h2
                    style={{
                        fontSize: 60,
                        fontWeight: 800,
                        background: "linear-gradient(90deg, #00d9ff, #00ff88)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                        marginBottom: 70,
                        opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
                        transform: `translateZ(80px) scale(${spring({ frame, fps, config: { damping: 12 } })})`,
                        textShadow: "0 0 40px rgba(0, 217, 255, 0.3)",
                    }}
                >
                    Smart Auto-Cut が解決！
                </h2>

                {/* Feature Cards - Circular 3D Layout */}
                <div
                    style={{
                        display: "flex",
                        gap: 60,
                        transformStyle: "preserve-3d",
                    }}
                >
                    {FEATURES.map((feature, index) => {
                        const delay = 40 + index * 25;
                        const cardProgress = spring({
                            frame: frame - delay,
                            fps,
                            config: { damping: 10, stiffness: 60 },
                        });

                        // Card position with 3D arc
                        const angle = (index - 1) * 12;
                        const zOffset = Math.cos((index - 1) * 0.5) * 50;

                        return (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 20,
                                    padding: "50px 45px",
                                    background: `linear-gradient(180deg, ${feature.color}15 0%, ${feature.color}05 100%)`,
                                    borderRadius: 28,
                                    border: `2px solid ${feature.color}40`,
                                    transform: `translateZ(${zOffset}px) rotateY(${angle}deg) scale(${cardProgress})`,
                                    opacity: interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateRight: "clamp" }),
                                    boxShadow: `0 25px 80px rgba(0, 0, 0, 0.5), 0 0 30px ${feature.color}20`,
                                    minWidth: 240,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 70,
                                        filter: `drop-shadow(0 0 20px ${feature.color})`,
                                    }}
                                >
                                    {feature.icon}
                                </div>
                                <span
                                    style={{
                                        fontSize: 30,
                                        fontWeight: 700,
                                        color: feature.color,
                                        fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                                    }}
                                >
                                    {feature.title}
                                </span>
                                <span
                                    style={{
                                        fontSize: 18,
                                        color: "rgba(255, 255, 255, 0.6)",
                                        fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                                    }}
                                >
                                    {feature.desc}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AbsoluteFill>
    );
};
