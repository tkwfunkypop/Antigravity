import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

const steps = [
    { number: "1", label: "保存", desc: "プロジェクトを保存", icon: "💾" },
    { number: "2", label: "選択", desc: "コンポジションを選択", icon: "🎬" },
    { number: "3", label: "実行", desc: "Collect & Organize", icon: "🚀" },
];

export const WorkflowScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #16213e 0%, #1a1a2e 100%)",
                justifyContent: "center",
                alignItems: "center",
                padding: 80,
            }}
        >
            {/* 背景のパーティクル風 */}
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    background: `radial-gradient(circle at 30% 40%, rgba(153,102,255,0.1) 0%, transparent 40%),
                                 radial-gradient(circle at 70% 60%, rgba(74,222,128,0.1) 0%, transparent 40%)`,
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
                {/* タイトル */}
                <div
                    style={{
                        fontSize: 64,
                        fontWeight: 900,
                        color: "#fbbf24",
                        fontFamily: "'Noto Sans JP', sans-serif",
                        opacity: titleOpacity,
                        textShadow: "0 4px 30px rgba(251, 191, 36, 0.5)",
                    }}
                >
                    かんたん3ステップ
                </div>

                {/* ステップ */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 30,
                    }}
                >
                    {steps.map((step, index) => {
                        const delay = 30 + index * 40;

                        const stepProgress = spring({
                            frame: frame - delay,
                            fps,
                            config: { damping: 12, stiffness: 100 },
                        });

                        const stepScale = interpolate(stepProgress, [0, 1], [0.5, 1]);
                        const stepOpacity = interpolate(frame - delay, [0, 20], [0, 1], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        });

                        // 矢印の表示
                        const arrowOpacity = index < steps.length - 1
                            ? interpolate(frame - (delay + 25), [0, 15], [0, 1], {
                                extrapolateLeft: "clamp",
                                extrapolateRight: "clamp",
                            })
                            : 0;

                        return (
                            <React.Fragment key={index}>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 20,
                                        opacity: stepOpacity,
                                        transform: `scale(${stepScale})`,
                                    }}
                                >
                                    {/* ステップ番号 */}
                                    <div
                                        style={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: "50%",
                                            background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            fontSize: 40,
                                            fontWeight: 900,
                                            color: "#1a1a2e",
                                            boxShadow: "0 10px 30px rgba(251, 191, 36, 0.4)",
                                        }}
                                    >
                                        {step.number}
                                    </div>

                                    {/* アイコン */}
                                    <div style={{ fontSize: 50 }}>{step.icon}</div>

                                    {/* ラベル */}
                                    <div
                                        style={{
                                            fontSize: 32,
                                            fontWeight: 700,
                                            color: "white",
                                            fontFamily: "'Noto Sans JP', sans-serif",
                                        }}
                                    >
                                        {step.label}
                                    </div>

                                    {/* 説明 */}
                                    <div
                                        style={{
                                            fontSize: 20,
                                            color: "#94a3b8",
                                            fontFamily: "'Noto Sans JP', sans-serif",
                                        }}
                                    >
                                        {step.desc}
                                    </div>
                                </div>

                                {/* 矢印 */}
                                {index < steps.length - 1 && (
                                    <div
                                        style={{
                                            fontSize: 50,
                                            color: "#fbbf24",
                                            opacity: arrowOpacity,
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
