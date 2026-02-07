import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

const steps = [
    {
        number: "1",
        title: "カテゴリを選ぶ",
        description: "目的に合わせて5つから選択",
        icon: "🎯",
        color: "#3b82f6",
    },
    {
        number: "2",
        title: "プロンプトを入力",
        description: "日本語で作りたいものを説明",
        icon: "💬",
        color: "#8b5cf6",
    },
    {
        number: "3",
        title: "Generate！",
        description: "数秒で動画が完成",
        icon: "✨",
        color: "#22c55e",
    },
];

export const HowItWorksScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Title animation
    const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: "clamp",
    });

    const titleY = interpolate(frame, [0, 20], [-20, 0], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f1a2d 100%)",
                justifyContent: "center",
                alignItems: "center",
                padding: 80,
            }}
        >
            {/* Background decoration */}
            <div
                style={{
                    position: "absolute",
                    width: 800,
                    height: 800,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
                    filter: "blur(80px)",
                }}
            />

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 60,
                    width: "100%",
                    maxWidth: 1400,
                }}
            >
                {/* Title */}
                <div
                    style={{
                        opacity: titleOpacity,
                        transform: `translateY(${titleY}px)`,
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            fontSize: 60,
                            fontWeight: 800,
                            color: "white",
                            fontFamily: "'Noto Sans JP', sans-serif",
                        }}
                    >
                        使い方は超シンプル
                    </div>
                    <div
                        style={{
                            fontSize: 32,
                            fontWeight: 500,
                            color: "#a78bfa",
                            fontFamily: "'Noto Sans JP', sans-serif",
                            marginTop: 10,
                        }}
                    >
                        たった3ステップ
                    </div>
                </div>

                {/* Steps */}
                <div
                    style={{
                        display: "flex",
                        gap: 50,
                        justifyContent: "center",
                        alignItems: "stretch",
                    }}
                >
                    {steps.map((step, index) => {
                        const delay = index * 50 + 40;
                        const cardProgress = spring({
                            frame: frame - delay,
                            fps,
                            config: { damping: 12, stiffness: 100 },
                        });

                        const cardOpacity = interpolate(
                            frame,
                            [delay, delay + 20],
                            [0, 1],
                            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                        );

                        // Arrow animation
                        const arrowOpacity = index < 2 ? interpolate(
                            frame,
                            [delay + 30, delay + 50],
                            [0, 1],
                            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                        ) : 0;

                        return (
                            <React.Fragment key={index}>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 25,
                                        padding: "40px 35px",
                                        background: `linear-gradient(135deg, ${step.color}20 0%, ${step.color}10 100%)`,
                                        borderRadius: 24,
                                        border: `2px solid ${step.color}40`,
                                        opacity: cardOpacity,
                                        transform: `scale(${cardProgress}) translateY(${(1 - cardProgress) * 40}px)`,
                                        minWidth: 300,
                                        position: "relative",
                                    }}
                                >
                                    {/* Step number badge */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: -20,
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            width: 50,
                                            height: 50,
                                            background: step.color,
                                            borderRadius: "50%",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            fontSize: 28,
                                            fontWeight: 900,
                                            color: "white",
                                            boxShadow: `0 4px 20px ${step.color}60`,
                                        }}
                                    >
                                        {step.number}
                                    </div>

                                    <span style={{ fontSize: 70, marginTop: 10 }}>{step.icon}</span>
                                    <span
                                        style={{
                                            fontSize: 32,
                                            color: "white",
                                            fontFamily: "'Noto Sans JP', sans-serif",
                                            fontWeight: 700,
                                            textAlign: "center",
                                        }}
                                    >
                                        {step.title}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 20,
                                            color: "rgba(255,255,255,0.7)",
                                            fontFamily: "'Noto Sans JP', sans-serif",
                                            textAlign: "center",
                                        }}
                                    >
                                        {step.description}
                                    </span>
                                </div>

                                {/* Arrow between steps */}
                                {index < 2 && (
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            opacity: arrowOpacity,
                                            fontSize: 48,
                                            color: "#a78bfa",
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
