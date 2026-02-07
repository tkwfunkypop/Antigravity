import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

const features = [
    { icon: "📦", label: "自動収集", desc: "使用中のフッテージを自動検出" },
    { icon: "📂", label: "フォルダ整理", desc: "IMAGE/MOVIE/AUDIO別に分類" },
    { icon: "🔗", label: "リンク更新", desc: "収集後も自動でリンク維持" },
    { icon: "💾", label: "バックアップ", desc: "実行前に自動バックアップ" },
    { icon: "📊", label: "レポート生成", desc: "フォント・欠落ファイル一覧" },
    { icon: "🎯", label: "パネル整理", desc: "AE内フォルダも自動整理" },
];

export const FeaturesScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const titleScale = spring({
        frame,
        fps,
        config: { damping: 15, stiffness: 80 },
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #0f3460 0%, #16213e 50%, #1a1a2e 100%)",
                justifyContent: "center",
                alignItems: "center",
                padding: 60,
            }}
        >
            {/* 背景グロー */}
            <div
                style={{
                    position: "absolute",
                    width: 700,
                    height: 700,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(74,222,128,0.15) 0%, transparent 70%)",
                    filter: "blur(80px)",
                }}
            />

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 50,
                    width: "100%",
                }}
            >
                {/* タイトル */}
                <div
                    style={{
                        fontSize: 64,
                        fontWeight: 900,
                        color: "#4ade80",
                        fontFamily: "'Noto Sans JP', sans-serif",
                        opacity: titleOpacity,
                        transform: `scale(${titleScale})`,
                        textShadow: "0 4px 30px rgba(74, 222, 128, 0.5)",
                    }}
                >
                    充実の機能
                </div>

                {/* 機能グリッド（2行3列） */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 30,
                        maxWidth: 1100,
                    }}
                >
                    {features.map((feature, index) => {
                        const row = Math.floor(index / 3);
                        const delay = 30 + row * 30 + (index % 3) * 10;

                        const cardProgress = spring({
                            frame: frame - delay,
                            fps,
                            config: { damping: 12, stiffness: 100 },
                        });

                        const cardY = interpolate(cardProgress, [0, 1], [40, 0]);
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
                                    gap: 12,
                                    background: "rgba(255,255,255,0.06)",
                                    padding: "30px 25px",
                                    borderRadius: 16,
                                    opacity: cardOpacity,
                                    transform: `translateY(${cardY}px)`,
                                    border: "1px solid rgba(74,222,128,0.2)",
                                    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                                }}
                            >
                                <div style={{ fontSize: 50 }}>{feature.icon}</div>
                                <div
                                    style={{
                                        fontSize: 28,
                                        fontWeight: 700,
                                        color: "white",
                                        fontFamily: "'Noto Sans JP', sans-serif",
                                    }}
                                >
                                    {feature.label}
                                </div>
                                <div
                                    style={{
                                        fontSize: 18,
                                        color: "#94a3b8",
                                        fontFamily: "'Noto Sans JP', sans-serif",
                                        textAlign: "center",
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
