import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
} from "remotion";

const WORKFLOW_STEPS = [
    { num: 1, text: "サーバー起動", icon: "🚀", detail: "python server.py" },
    { num: 2, text: "パネル展開", icon: "📋", detail: "ウィンドウ → エクステンション" },
    { num: 3, text: "分析実行", icon: "🎙️", detail: "ボタンクリック" },
    { num: 4, text: "完了！", icon: "✅", detail: "マーカー自動配置" },
];

export const DemoScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Camera pan effect
    const cameraX = interpolate(frame, [0, 240], [50, -50], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: "radial-gradient(ellipse at 50% 30%, #1a1a3e 0%, #0a0a1a 60%, #050510 100%)",
                perspective: 1000,
                overflow: "hidden",
            }}
        >
            {/* Floating Particles */}
            {[...Array(20)].map((_, i) => {
                const x = (i * 97) % 100;
                const y = (i * 53) % 100;
                const size = 2 + (i % 4);
                const floatY = Math.sin((frame + i * 20) * 0.03) * 30;

                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            left: `${x}%`,
                            top: `${y}%`,
                            width: size,
                            height: size,
                            borderRadius: "50%",
                            background: "rgba(0, 217, 255, 0.3)",
                            transform: `translateY(${floatY}px)`,
                            boxShadow: "0 0 10px rgba(0, 217, 255, 0.5)",
                        }}
                    />
                );
            })}

            {/* Title */}
            <h2
                style={{
                    position: "absolute",
                    top: 80,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 56,
                    fontWeight: 800,
                    color: "#fff",
                    fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                    opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
                    textShadow: "0 0 30px rgba(0, 217, 255, 0.5)",
                }}
            >
                使い方は超シンプル
            </h2>

            {/* Workflow Steps Container */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: `translate(calc(-50% + ${cameraX}px), -50%)`,
                    display: "flex",
                    gap: 80,
                    transformStyle: "preserve-3d",
                }}
            >
                {WORKFLOW_STEPS.map((step, index) => {
                    const delay = 30 + index * 45;
                    const isActive = frame >= delay;

                    const cardScale = spring({
                        frame: frame - delay,
                        fps,
                        config: { damping: 10, stiffness: 80 },
                    });

                    const glowIntensity = isActive ?
                        interpolate(Math.sin((frame - delay) * 0.1), [-1, 1], [0.3, 0.6]) : 0;

                    return (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 16,
                                transform: `scale(${cardScale}) translateZ(${isActive ? 50 : 0}px)`,
                                opacity: interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: "clamp" }),
                            }}
                        >
                            {/* Step Circle */}
                            <div
                                style={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: "50%",
                                    background: isActive
                                        ? "linear-gradient(135deg, rgba(0, 217, 255, 0.3), rgba(0, 255, 136, 0.3))"
                                        : "rgba(255, 255, 255, 0.05)",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    fontSize: 56,
                                    border: `3px solid ${isActive ? "rgba(0, 217, 255, 0.6)" : "rgba(255, 255, 255, 0.1)"}`,
                                    boxShadow: isActive
                                        ? `0 0 40px rgba(0, 217, 255, ${glowIntensity}), 0 0 80px rgba(0, 217, 255, ${glowIntensity * 0.5})`
                                        : "none",
                                    transition: "all 0.3s ease",
                                }}
                            >
                                {step.icon}
                            </div>

                            {/* Step Number */}
                            <div
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    background: isActive
                                        ? "linear-gradient(135deg, #00d9ff, #00ff88)"
                                        : "rgba(255, 255, 255, 0.2)",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    fontSize: 16,
                                    fontWeight: 700,
                                    color: isActive ? "#0a0a1a" : "#666",
                                    marginTop: -8,
                                }}
                            >
                                {step.num}
                            </div>

                            {/* Step Text */}
                            <span
                                style={{
                                    fontSize: 22,
                                    fontWeight: 600,
                                    color: isActive ? "#fff" : "#666",
                                    fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                                }}
                            >
                                {step.text}
                            </span>

                            {/* Step Detail */}
                            <span
                                style={{
                                    fontSize: 14,
                                    color: isActive ? "rgba(0, 217, 255, 0.8)" : "rgba(255, 255, 255, 0.3)",
                                    fontFamily: "'Inter', monospace",
                                }}
                            >
                                {step.detail}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Progress Connector Line */}
            <div
                style={{
                    position: "absolute",
                    bottom: 220,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 600,
                    height: 4,
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: 2,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${interpolate(frame, [30, 200], [0, 100], { extrapolateRight: "clamp" })}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #00d9ff, #00ff88)",
                        borderRadius: 2,
                        boxShadow: "0 0 20px rgba(0, 217, 255, 0.5)",
                    }}
                />
            </div>
        </AbsoluteFill>
    );
};
