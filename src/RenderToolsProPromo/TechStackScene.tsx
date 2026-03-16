import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
} from "remotion";

const TECH_ITEMS = [
    { icon: "⚛️", name: "Electron + React", desc: "モダンなデスクトップUI" },
    { icon: "🎨", name: "After Effects", desc: "aerender CLI で直接制御" },
    { icon: "🎥", name: "Media Encoder", desc: "Premiere Pro プロジェクト対応" },
    { icon: "💻", name: "クロスプラットフォーム", desc: "Mac (Intel & Apple Silicon) / Windows" },
];

export const TechStackScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const headerOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
    const headerScale = spring({ frame, fps, config: { damping: 12 } });

    // Orbiting ring
    const orbitAngle = frame * 0.3;

    return (
        <AbsoluteFill
            style={{
                background: "radial-gradient(ellipse at 50% 50%, #0a1a2a 0%, #050d1a 50%, #020508 100%)",
                perspective: 1000,
                overflow: "hidden",
            }}
        >
            {/* Orbiting ring decoration */}
            {[...Array(3)].map((_, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: 700 + i * 100,
                        height: 700 + i * 100,
                        borderRadius: "50%",
                        border: `1px solid rgba(255, 165, 0, ${0.08 - i * 0.02})`,
                        transform: `translate(-50%, -50%) rotateX(75deg) rotateZ(${orbitAngle + i * 30}deg)`,
                    }}
                />
            ))}

            {/* Content */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {/* Header */}
                <h2
                    style={{
                        fontSize: 52,
                        fontWeight: 800,
                        background: "linear-gradient(90deg, #ff8c00, #ffd700)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                        marginBottom: 70,
                        opacity: headerOpacity,
                        transform: `scale(${headerScale})`,
                    }}
                >
                    プロ仕様の技術スタック
                </h2>

                {/* Tech items in horizontal layout */}
                <div
                    style={{
                        display: "flex",
                        gap: 40,
                    }}
                >
                    {TECH_ITEMS.map((item, index) => {
                        const delay = 25 + index * 20;
                        const cardProgress = spring({
                            frame: frame - delay,
                            fps,
                            config: { damping: 10, stiffness: 60 },
                        });
                        const cardOpacity = interpolate(frame, [delay, delay + 20], [0, 1], {
                            extrapolateRight: "clamp",
                        });

                        return (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 16,
                                    padding: "40px 30px",
                                    background: "linear-gradient(180deg, rgba(255, 165, 0, 0.1) 0%, rgba(255, 165, 0, 0.03) 100%)",
                                    borderRadius: 24,
                                    border: "1px solid rgba(255, 165, 0, 0.2)",
                                    transform: `scale(${cardProgress})`,
                                    opacity: cardOpacity,
                                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
                                    minWidth: 200,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 56,
                                        filter: "drop-shadow(0 0 15px rgba(255, 165, 0, 0.5))",
                                    }}
                                >
                                    {item.icon}
                                </div>
                                <span
                                    style={{
                                        fontSize: 22,
                                        fontWeight: 700,
                                        color: "#ffd700",
                                        fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                                        textAlign: "center",
                                    }}
                                >
                                    {item.name}
                                </span>
                                <span
                                    style={{
                                        fontSize: 15,
                                        color: "rgba(255, 255, 255, 0.5)",
                                        fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                                        textAlign: "center",
                                    }}
                                >
                                    {item.desc}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AbsoluteFill>
    );
};
