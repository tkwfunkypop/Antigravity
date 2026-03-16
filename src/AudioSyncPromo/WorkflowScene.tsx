import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
} from "remotion";

const STEPS = [
    { step: "1", icon: "📂", title: "素材を選択", desc: "動画と音声ファイルを選択" },
    { step: "2", icon: "▶️", title: "同期実行", desc: "ボタンをワンクリック" },
    { step: "3", icon: "✅", title: "自動完了", desc: "ミリ秒精度で同期完了" },
];

export const WorkflowScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const headerOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
    const headerScale = spring({ frame, fps, config: { damping: 12 } });

    return (
        <AbsoluteFill
            style={{
                background: "radial-gradient(ellipse at 50% 40%, #0d1a2e 0%, #070e1a 50%, #030508 100%)",
                perspective: 1000,
                overflow: "hidden",
            }}
        >
            {/* Subtle grid */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `
                        linear-gradient(rgba(139, 92, 246, 0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(6, 182, 212, 0.02) 1px, transparent 1px)
                    `,
                    backgroundSize: "60px 60px",
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
                        marginBottom: 80,
                        opacity: headerOpacity,
                        transform: `scale(${headerScale})`,
                    }}
                >
                    たった3ステップ
                </h2>

                {/* Steps */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 20,
                    }}
                >
                    {STEPS.map((step, index) => {
                        const delay = 25 + index * 30;
                        const cardProgress = spring({
                            frame: frame - delay,
                            fps,
                            config: { damping: 10, stiffness: 70 },
                        });
                        const cardOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
                            extrapolateRight: "clamp",
                        });

                        // Arrow animation
                        const arrowOpacity = interpolate(frame, [delay + 10, delay + 20], [0, 1], {
                            extrapolateRight: "clamp",
                        });

                        return (
                            <React.Fragment key={index}>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 20,
                                        padding: "50px 45px",
                                        background: "linear-gradient(180deg, rgba(139, 92, 246, 0.12) 0%, rgba(6, 182, 212, 0.05) 100%)",
                                        borderRadius: 28,
                                        border: "1px solid rgba(139, 92, 246, 0.25)",
                                        transform: `scale(${cardProgress})`,
                                        opacity: cardOpacity,
                                        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
                                        minWidth: 230,
                                    }}
                                >
                                    {/* Step number badge */}
                                    <div
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: "50%",
                                            background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            fontSize: 24,
                                            fontWeight: 900,
                                            color: "white",
                                            fontFamily: "'Inter', sans-serif",
                                            boxShadow: "0 4px 20px rgba(139, 92, 246, 0.5)",
                                        }}
                                    >
                                        {step.step}
                                    </div>

                                    <span style={{ fontSize: 52 }}>{step.icon}</span>
                                    <span
                                        style={{
                                            fontSize: 28,
                                            fontWeight: 700,
                                            color: "#fff",
                                            fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                                            textAlign: "center",
                                        }}
                                    >
                                        {step.title}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 17,
                                            color: "rgba(255, 255, 255, 0.5)",
                                            fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                                        }}
                                    >
                                        {step.desc}
                                    </span>
                                </div>

                                {/* Arrow between steps */}
                                {index < STEPS.length - 1 && (
                                    <div
                                        style={{
                                            fontSize: 40,
                                            color: "rgba(139, 92, 246, 0.6)",
                                            opacity: arrowOpacity,
                                            transform: `translateX(${interpolate(frame, [delay + 10, delay + 20], [20, 0], { extrapolateRight: "clamp" })}px)`,
                                        }}
                                    >
                                        →
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </AbsoluteFill>
    );
};
