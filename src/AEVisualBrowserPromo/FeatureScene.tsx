import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    interpolate,
    spring,
    useVideoConfig,
} from "remotion";

const FEATURES = [
    {
        icon: "🖼",
        title: "サムネイルプレビュー",
        desc: "PNG, JPG, PSD, MOV, MP4…\nすべての素材をビジュアルで確認",
        color: "#4fc3f7",
        bg: "rgba(79,195,247,0.08)",
        border: "rgba(79,195,247,0.3)",
    },
    {
        icon: "🔍",
        title: "プロジェクト横断検索",
        desc: "フォルダ構造に関係なく\n全アイテムを一発検索",
        color: "#81c784",
        bg: "rgba(129,199,132,0.08)",
        border: "rgba(129,199,132,0.3)",
    },
    {
        icon: "🔲",
        title: "複数選択",
        desc: "Cmd+Click / Shift+Click\nドラッグ選択で一括操作",
        color: "#ba68c8",
        bg: "rgba(186,104,200,0.08)",
        border: "rgba(186,104,200,0.3)",
    },
    {
        icon: "📥",
        title: "ドラッグ&ドロップ",
        desc: "外部ファイルをパネルに\nドロップして即インポート",
        color: "#ffb74d",
        bg: "rgba(255,183,77,0.08)",
        border: "rgba(255,183,77,0.3)",
    },
];

export const FeatureScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const headerSpring = spring({ frame, fps, config: { damping: 14 } });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(180deg, #060620 0%, #0c0c35 50%, #060620 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
            }}
        >
            {/* Background pattern */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `
            radial-gradient(circle at 30% 30%, rgba(79,195,247,0.05) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(186,104,200,0.05) 0%, transparent 50%)
          `,
                }}
            />

            {/* Header */}
            <div
                style={{
                    transform: `scale(${headerSpring})`,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    fontSize: 48,
                    fontWeight: 900,
                    color: "#fff",
                    marginBottom: 50,
                    textShadow: "0 0 30px rgba(100,150,255,0.3)",
                }}
            >
                ✨ 主な機能
            </div>

            {/* Feature grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 30,
                    maxWidth: 1200,
                }}
            >
                {FEATURES.map((f, i) => {
                    const delay = 15 + i * 12;
                    const cardSpring = spring({
                        frame: frame - delay,
                        fps,
                        config: { damping: 12, stiffness: 90 },
                    });
                    const cardOpacity = interpolate(frame - delay, [0, 10], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    });

                    // Hover glow animation
                    const glowPhase = Math.sin((frame - delay) * 0.05) * 0.5 + 0.5;

                    return (
                        <div
                            key={i}
                            style={{
                                transform: `scale(${cardSpring})`,
                                opacity: cardOpacity,
                                background: f.bg,
                                border: `1px solid ${f.border}`,
                                borderRadius: 16,
                                padding: "30px 36px",
                                display: "flex",
                                alignItems: "center",
                                gap: 24,
                                backdropFilter: "blur(10px)",
                                boxShadow: `0 0 ${20 + glowPhase * 15}px ${f.bg}`,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 56,
                                    flexShrink: 0,
                                    filter: `drop-shadow(0 0 10px ${f.color})`,
                                }}
                            >
                                {f.icon}
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontFamily: "'Noto Sans JP', sans-serif",
                                        fontSize: 28,
                                        fontWeight: 800,
                                        color: f.color,
                                        marginBottom: 6,
                                    }}
                                >
                                    {f.title}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Noto Sans JP', sans-serif",
                                        fontSize: 18,
                                        color: "rgba(255,255,255,0.65)",
                                        lineHeight: 1.5,
                                        whiteSpace: "pre-line",
                                    }}
                                >
                                    {f.desc}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};
