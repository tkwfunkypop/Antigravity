import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

const categories = [
    {
        icon: "📊",
        name: "Infographics",
        nameJa: "インフォグラフィックス",
        description: "データやグラフを動かす",
        color: "#3b82f6",
    },
    {
        icon: "🔤",
        name: "Text Animation",
        nameJa: "テキストアニメーション",
        description: "文字に命を吹き込む",
        color: "#8b5cf6",
    },
    {
        icon: "🖼️",
        name: "Posters",
        nameJa: "ポスター/ロゴ",
        description: "静止画を動画化",
        color: "#ec4899",
    },
    {
        icon: "📑",
        name: "Presentation",
        nameJa: "プレゼンテーション",
        description: "スライドに動きを",
        color: "#f59e0b",
    },
    {
        icon: "🎨",
        name: "From Scratch",
        nameJa: "ゼロから作成",
        description: "自由にデザイン",
        color: "#22c55e",
    },
];

export const CategoriesScene: React.FC = () => {
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
                background: "linear-gradient(180deg, #0f0f23 0%, #1a1a3e 100%)",
                justifyContent: "center",
                alignItems: "center",
                padding: 60,
            }}
        >
            {/* Background grid effect */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `
                        linear-gradient(rgba(124, 58, 237, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(124, 58, 237, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: "60px 60px",
                    opacity: 0.5,
                }}
            />

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 50,
                    width: "100%",
                    zIndex: 1,
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
                            fontSize: 56,
                            fontWeight: 800,
                            color: "white",
                            fontFamily: "'Noto Sans JP', sans-serif",
                        }}
                    >
                        5つのカテゴリーから選ぶだけ
                    </div>
                </div>

                {/* Category cards */}
                <div
                    style={{
                        display: "flex",
                        gap: 25,
                        justifyContent: "center",
                        flexWrap: "wrap",
                        maxWidth: 1600,
                    }}
                >
                    {categories.map((category, index) => {
                        const delay = index * 40 + 30;
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

                        // Highlight animation for current card
                        const isHighlighted = frame >= delay + 30 && frame < delay + 80;
                        const highlightScale = isHighlighted ? 1.05 : 1;

                        return (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 15,
                                    padding: "30px 25px",
                                    background: `linear-gradient(135deg, ${category.color}20 0%, ${category.color}10 100%)`,
                                    borderRadius: 20,
                                    border: `2px solid ${category.color}50`,
                                    opacity: cardOpacity,
                                    transform: `scale(${cardProgress * highlightScale}) translateY(${(1 - cardProgress) * 40}px)`,
                                    minWidth: 260,
                                    boxShadow: isHighlighted
                                        ? `0 0 40px ${category.color}40`
                                        : "none",
                                    transition: "box-shadow 0.3s, transform 0.3s",
                                }}
                            >
                                <span style={{ fontSize: 56 }}>{category.icon}</span>
                                <span
                                    style={{
                                        fontSize: 26,
                                        color: "white",
                                        fontFamily: "'Inter', sans-serif",
                                        fontWeight: 700,
                                    }}
                                >
                                    {category.name}
                                </span>
                                <span
                                    style={{
                                        fontSize: 18,
                                        color: category.color,
                                        fontFamily: "'Noto Sans JP', sans-serif",
                                        fontWeight: 500,
                                    }}
                                >
                                    {category.nameJa}
                                </span>
                                <span
                                    style={{
                                        fontSize: 16,
                                        color: "rgba(255,255,255,0.7)",
                                        fontFamily: "'Noto Sans JP', sans-serif",
                                    }}
                                >
                                    {category.description}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AbsoluteFill>
    );
};
