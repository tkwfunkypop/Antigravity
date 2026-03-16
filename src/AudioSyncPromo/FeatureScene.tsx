import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
} from "remotion";

const FEATURES = [
    {
        icon: "📊",
        title: "FFT相互相関分析",
        desc: "波形を自動解析して\nミリ秒単位でオフセットを検出",
        color: "#8b5cf6",
    },
    {
        icon: "📁",
        title: "プロジェクトパネル対応",
        desc: "素材を選択するだけで\n新規コンポ自動作成＆同期",
        color: "#06b6d4",
    },
    {
        icon: "🎬",
        title: "タイムライン対応",
        desc: "既存コンポ内のレイヤーを\nその場で自動位置合わせ",
        color: "#10b981",
    },
    {
        icon: "📈",
        title: "信頼度スコア表示",
        desc: "同期結果の正確さを\nパーセンテージで表示",
        color: "#f59e0b",
    },
];

export const FeatureScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Header animation
    const headerScale = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 80 },
    });
    const headerOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill
            style={{
                background: "radial-gradient(ellipse at 50% 50%, #0a1a3a 0%, #050d1a 50%, #020510 100%)",
                perspective: 1200,
                overflow: "hidden",
            }}
        >
            {/* Animated Grid */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `
                        linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: "80px 80px",
                    transform: `perspective(500px) rotateX(60deg) translateY(${frame * 1.5}px)`,
                    transformOrigin: "center top",
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
                }}
            >
                {/* Header */}
                <h2
                    style={{
                        fontSize: 56,
                        fontWeight: 800,
                        background: "linear-gradient(90deg, #8b5cf6, #06b6d4)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                        marginBottom: 70,
                        opacity: headerOpacity,
                        transform: `scale(${headerScale})`,
                        textShadow: "0 0 40px rgba(139, 92, 246, 0.3)",
                    }}
                >
                    主な機能
                </h2>

                {/* Feature Cards - 2x2 Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 40,
                        maxWidth: 1100,
                    }}
                >
                    {FEATURES.map((feature, index) => {
                        const delay = 20 + index * 18;
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
                                    alignItems: "center",
                                    gap: 24,
                                    padding: "32px 36px",
                                    background: `linear-gradient(135deg, ${feature.color}18 0%, ${feature.color}08 100%)`,
                                    borderRadius: 20,
                                    border: `1px solid ${feature.color}40`,
                                    transform: `scale(${cardProgress})`,
                                    opacity: cardOpacity,
                                    boxShadow: `0 15px 50px rgba(0, 0, 0, 0.4), 0 0 20px ${feature.color}15`,
                                }}
                            >
                                {/* Icon */}
                                <div
                                    style={{
                                        fontSize: 56,
                                        flexShrink: 0,
                                        filter: `drop-shadow(0 0 15px ${feature.color})`,
                                    }}
                                >
                                    {feature.icon}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <span
                                        style={{
                                            fontSize: 26,
                                            fontWeight: 700,
                                            color: feature.color,
                                            fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                                        }}
                                    >
                                        {feature.title}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 17,
                                            color: "rgba(255, 255, 255, 0.6)",
                                            fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                                            lineHeight: 1.5,
                                            whiteSpace: "pre-line",
                                        }}
                                    >
                                        {feature.desc}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AbsoluteFill>
    );
};
