import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

const features = [
    { icon: "📦", label: "自動収集", desc: "使用フッテージを一括収集" },
    { icon: "📂", label: "整理機能", desc: "フォルダ構造を自動整理" },
    { icon: "📊", label: "レポート", desc: "フォント・欠落ファイル報告" },
];

export const SolutionScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleScale = spring({
        frame,
        fps,
        config: { damping: 15, stiffness: 80 },
    });

    const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #0f3460 0%, #16213e 50%, #1a1a2e 100%)",
                justifyContent: "center",
                alignItems: "center",
                padding: 80,
            }}
        >
            {/* Success glow */}
            <div
                style={{
                    position: "absolute",
                    width: 600,
                    height: 600,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(74,222,128,0.2) 0%, transparent 70%)",
                    filter: "blur(60px)",
                }}
            />

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 60,
                }}
            >
                {/* Title */}
                <div
                    style={{
                        fontSize: 72,
                        fontWeight: 900,
                        color: "#4ade80",
                        fontFamily: "'Noto Sans JP', sans-serif",
                        opacity: titleOpacity,
                        transform: `scale(${titleScale})`,
                        textShadow: "0 4px 30px rgba(74, 222, 128, 0.5)",
                    }}
                >
                    ワンクリックで解決！
                </div>

                {/* Feature cards */}
                <div
                    style={{
                        display: "flex",
                        gap: 40,
                    }}
                >
                    {features.map((feature, index) => {
                        const delay = 25 + index * 15;
                        const cardProgress = spring({
                            frame: frame - delay,
                            fps,
                            config: { damping: 12, stiffness: 100 },
                        });

                        const cardY = interpolate(cardProgress, [0, 1], [50, 0]);
                        const cardOpacity = interpolate(frame - delay, [0, 15], [0, 1], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        });

                        return (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 15,
                                    background: "rgba(255,255,255,0.08)",
                                    padding: "40px 50px",
                                    borderRadius: 20,
                                    opacity: cardOpacity,
                                    transform: `translateY(${cardY}px)`,
                                    border: "1px solid rgba(74,222,128,0.3)",
                                    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                                }}
                            >
                                <div style={{ fontSize: 60 }}>{feature.icon}</div>
                                <div
                                    style={{
                                        fontSize: 36,
                                        fontWeight: 700,
                                        color: "white",
                                        fontFamily: "'Noto Sans JP', sans-serif",
                                    }}
                                >
                                    {feature.label}
                                </div>
                                <div
                                    style={{
                                        fontSize: 20,
                                        color: "#a0aec0",
                                        fontFamily: "'Noto Sans JP', sans-serif",
                                    }}
                                >
                                    {feature.desc}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AbsoluteFill>
    );
};
