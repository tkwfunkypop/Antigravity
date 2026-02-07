import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

const benefits = [
    { icon: "🚀", label: "納品準備の時間を大幅短縮" },
    { icon: "✅", label: "リンク切れの心配なし" },
    { icon: "📁", label: "プロジェクトの再利用が簡単" },
];

export const BenefitsScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleScale = spring({
        frame,
        fps,
        config: { damping: 15, stiffness: 80 },
    });

    const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #1a1a2e 100%)",
                justifyContent: "center",
                alignItems: "center",
                padding: 80,
            }}
        >
            {/* 背景グロー */}
            <div
                style={{
                    position: "absolute",
                    width: 600,
                    height: 600,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(153,102,255,0.2) 0%, transparent 60%)",
                    filter: "blur(60px)",
                    transform: `scale(${1 + Math.sin(frame * 0.05) * 0.1})`,
                }}
            />

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 50,
                }}
            >
                {/* タイトル */}
                <div
                    style={{
                        fontSize: 64,
                        fontWeight: 900,
                        color: "#a78bfa",
                        fontFamily: "'Noto Sans JP', sans-serif",
                        opacity: titleOpacity,
                        transform: `scale(${titleScale})`,
                        textShadow: "0 4px 30px rgba(167, 139, 250, 0.5)",
                    }}
                >
                    導入メリット
                </div>

                {/* 利点リスト */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 30,
                    }}
                >
                    {benefits.map((benefit, index) => {
                        const delay = 30 + index * 25;

                        const itemProgress = spring({
                            frame: frame - delay,
                            fps,
                            config: { damping: 12, stiffness: 100 },
                        });

                        const itemX = interpolate(itemProgress, [0, 1], [-80, 0]);
                        const itemOpacity = interpolate(frame - delay, [0, 15], [0, 1], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        });

                        return (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 25,
                                    opacity: itemOpacity,
                                    transform: `translateX(${itemX}px)`,
                                    background: "rgba(255,255,255,0.05)",
                                    padding: "25px 40px",
                                    borderRadius: 16,
                                    borderLeft: "4px solid #a78bfa",
                                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                                }}
                            >
                                <div style={{ fontSize: 50 }}>{benefit.icon}</div>
                                <div
                                    style={{
                                        fontSize: 36,
                                        fontWeight: 600,
                                        color: "white",
                                        fontFamily: "'Noto Sans JP', sans-serif",
                                    }}
                                >
                                    {benefit.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AbsoluteFill>
    );
};
