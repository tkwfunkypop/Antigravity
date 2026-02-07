import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

const problems = [
    { icon: "📚", text: "学習に数週間〜数ヶ月", delay: 0 },
    { icon: "💰", text: "高価な専門ソフト", delay: 20 },
    { icon: "⏱️", text: "複雑なタイムライン操作", delay: 40 },
    { icon: "🔧", text: "キーフレーム設定が大変", delay: 60 },
];

export const ProblemScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Title animation
    const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: "clamp",
    });

    const titleY = interpolate(frame, [0, 20], [-30, 0], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #1a0a0a 0%, #2d1a1a 50%, #1a0f1f 100%)",
                justifyContent: "center",
                alignItems: "center",
                padding: 80,
            }}
        >
            {/* Warning glow */}
            <div
                style={{
                    position: "absolute",
                    width: 500,
                    height: 500,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 70%)",
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
                    maxWidth: 1200,
                }}
            >
                {/* Title */}
                <div
                    style={{
                        opacity: titleOpacity,
                        transform: `translateY(${titleY}px)`,
                    }}
                >
                    <div
                        style={{
                            fontSize: 60,
                            fontWeight: 800,
                            color: "white",
                            fontFamily: "'Noto Sans JP', sans-serif",
                            textAlign: "center",
                        }}
                    >
                        従来のモーショングラフィックス作成は…
                    </div>
                </div>

                {/* Problem cards */}
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 30,
                        justifyContent: "center",
                    }}
                >
                    {problems.map((problem, index) => {
                        const cardProgress = spring({
                            frame: frame - problem.delay - 30,
                            fps,
                            config: { damping: 15, stiffness: 100 },
                        });

                        const cardOpacity = interpolate(
                            frame,
                            [problem.delay + 30, problem.delay + 50],
                            [0, 1],
                            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                        );

                        return (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 20,
                                    padding: "30px 40px",
                                    background: "rgba(239, 68, 68, 0.15)",
                                    borderRadius: 20,
                                    border: "2px solid rgba(239, 68, 68, 0.3)",
                                    opacity: cardOpacity,
                                    transform: `scale(${cardProgress}) translateY(${(1 - cardProgress) * 20}px)`,
                                }}
                            >
                                <span style={{ fontSize: 48 }}>{problem.icon}</span>
                                <span
                                    style={{
                                        fontSize: 32,
                                        color: "white",
                                        fontFamily: "'Noto Sans JP', sans-serif",
                                        fontWeight: 600,
                                    }}
                                >
                                    {problem.text}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Frustrated emoji */}
                <div
                    style={{
                        fontSize: 80,
                        opacity: interpolate(frame, [120, 140], [0, 1], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        }),
                        transform: `scale(${spring({
                            frame: frame - 120,
                            fps,
                            config: { damping: 10, stiffness: 150 },
                        })})`,
                    }}
                >
                    😫
                </div>
            </div>
        </AbsoluteFill>
    );
};
