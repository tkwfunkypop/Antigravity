import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
} from "remotion";

const FEATURES = [
    { icon: "🎙️", title: "Whisper AI", desc: "高精度な音声認識" },
    { icon: "✂️", title: "自動カット", desc: "無音・失敗を検出" },
    { icon: "⚡", title: "ワンクリック", desc: "ボタン1つで完了" },
];

export const SolutionScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const headerOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #0a1a2a 0%, #0a2a3a 50%, #0a1a2a 100%)",
                justifyContent: "center",
                alignItems: "center",
                padding: 80,
            }}
        >
            {/* Glow effect */}
            <div
                style={{
                    position: "absolute",
                    width: 800,
                    height: 800,
                    background: "radial-gradient(circle, rgba(0,217,255,0.1) 0%, transparent 60%)",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                }}
            />

            {/* Header */}
            <h2
                style={{
                    fontSize: 56,
                    fontWeight: 700,
                    background: "linear-gradient(90deg, #00d9ff, #00ff88)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "'Inter', sans-serif",
                    marginBottom: 60,
                    opacity: headerOpacity,
                }}
            >
                Smart Auto-Cut が解決！
            </h2>

            {/* Features */}
            <div style={{ display: "flex", gap: 40 }}>
                {FEATURES.map((feature, index) => {
                    const delay = 30 + index * 20;
                    const scale = spring({
                        frame: frame - delay,
                        fps,
                        config: { damping: 12, stiffness: 100 },
                    });
                    const opacity = interpolate(
                        frame,
                        [delay, delay + 15],
                        [0, 1],
                        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                    );

                    return (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 16,
                                opacity,
                                transform: `scale(${scale})`,
                                background: "rgba(0,217,255,0.05)",
                                padding: "40px 50px",
                                borderRadius: 20,
                                border: "1px solid rgba(0,217,255,0.2)",
                            }}
                        >
                            <span style={{ fontSize: 64 }}>{feature.icon}</span>
                            <span
                                style={{
                                    fontSize: 28,
                                    fontWeight: 700,
                                    color: "#00d9ff",
                                    fontFamily: "'Inter', sans-serif",
                                }}
                            >
                                {feature.title}
                            </span>
                            <span
                                style={{
                                    fontSize: 18,
                                    color: "#888",
                                    fontFamily: "'Inter', sans-serif",
                                }}
                            >
                                {feature.desc}
                            </span>
                        </div>
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};
