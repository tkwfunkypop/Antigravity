import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

const comparisonItems = [
    { label: "学習コスト", before: "数週間〜数ヶ月", after: "数分" },
    { label: "操作方法", before: "タイムライン・キーフレーム", after: "テキスト入力" },
    { label: "作成時間", before: "数時間〜数日", after: "数秒〜数分" },
    { label: "必要スキル", before: "専門知識必須", after: "不要" },
];

export const ComparisonScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Title animation
    const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: "clamp",
    });

    // Table header animation
    const headerOpacity = interpolate(frame, [20, 40], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)",
                justifyContent: "center",
                alignItems: "center",
                padding: 80,
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 50,
                    width: "100%",
                    maxWidth: 1400,
                }}
            >
                {/* Title */}
                <div
                    style={{
                        opacity: titleOpacity,
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
                        従来ツール vs VIBE MOTION
                    </div>
                </div>

                {/* Comparison table */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        borderRadius: 20,
                        overflow: "hidden",
                        border: "2px solid rgba(124, 58, 237, 0.3)",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: "flex",
                            opacity: headerOpacity,
                        }}
                    >
                        <div
                            style={{
                                flex: 1,
                                padding: "25px 30px",
                                background: "rgba(255,255,255,0.05)",
                                fontSize: 28,
                                fontWeight: 600,
                                color: "white",
                                fontFamily: "'Noto Sans JP', sans-serif",
                                textAlign: "center",
                            }}
                        >
                            比較項目
                        </div>
                        <div
                            style={{
                                flex: 1.2,
                                padding: "25px 30px",
                                background: "rgba(239, 68, 68, 0.2)",
                                fontSize: 28,
                                fontWeight: 600,
                                color: "#fca5a5",
                                fontFamily: "'Noto Sans JP', sans-serif",
                                textAlign: "center",
                            }}
                        >
                            従来のツール 😰
                        </div>
                        <div
                            style={{
                                flex: 1.2,
                                padding: "25px 30px",
                                background: "rgba(34, 197, 94, 0.2)",
                                fontSize: 28,
                                fontWeight: 600,
                                color: "#86efac",
                                fontFamily: "'Noto Sans JP', sans-serif",
                                textAlign: "center",
                            }}
                        >
                            VIBE MOTION 🎉
                        </div>
                    </div>

                    {/* Rows */}
                    {comparisonItems.map((item, index) => {
                        const delay = index * 25 + 50;
                        const rowProgress = spring({
                            frame: frame - delay,
                            fps,
                            config: { damping: 15, stiffness: 100 },
                        });

                        const rowOpacity = interpolate(
                            frame,
                            [delay, delay + 20],
                            [0, 1],
                            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                        );

                        return (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    opacity: rowOpacity,
                                    transform: `translateX(${(1 - rowProgress) * 50}px)`,
                                    borderTop: "1px solid rgba(124, 58, 237, 0.2)",
                                }}
                            >
                                <div
                                    style={{
                                        flex: 1,
                                        padding: "22px 30px",
                                        background: "rgba(255,255,255,0.03)",
                                        fontSize: 26,
                                        fontWeight: 600,
                                        color: "white",
                                        fontFamily: "'Noto Sans JP', sans-serif",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {item.label}
                                </div>
                                <div
                                    style={{
                                        flex: 1.2,
                                        padding: "22px 30px",
                                        background: "rgba(239, 68, 68, 0.08)",
                                        fontSize: 24,
                                        color: "#fca5a5",
                                        fontFamily: "'Noto Sans JP', sans-serif",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        textAlign: "center",
                                    }}
                                >
                                    {item.before}
                                </div>
                                <div
                                    style={{
                                        flex: 1.2,
                                        padding: "22px 30px",
                                        background: "rgba(34, 197, 94, 0.08)",
                                        fontSize: 24,
                                        fontWeight: 700,
                                        color: "#86efac",
                                        fontFamily: "'Noto Sans JP', sans-serif",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        textAlign: "center",
                                    }}
                                >
                                    {item.after}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AbsoluteFill>
    );
};
