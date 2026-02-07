import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

// フォトリアルステップ
const steps = [
    { number: "01", label: "保存", subLabel: "SAVE", icon: "💾", color: "#00ddff" },
    { number: "02", label: "選択", subLabel: "SELECT", icon: "🎬", color: "#dd00ff" },
    { number: "03", label: "実行", subLabel: "EXECUTE", icon: "🚀", color: "#00ffaa" },
];

// メタリックステップカード
const StepCard: React.FC<{
    step: typeof steps[0];
    index: number;
    progress: number;
}> = ({ step, index, progress }) => {
    const frame = useCurrentFrame();
    const glowIntensity = 0.3 + Math.sin(frame * 0.1 + index * 2) * 0.2;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 25,
                transform: `scale(${progress}) translateY(${(1 - progress) * 40}px)`,
                opacity: progress,
            }}
        >
            {/* ステップ番号リング */}
            <div
                style={{
                    position: "relative",
                    width: 110,
                    height: 110,
                }}
            >
                {/* 外側リング - メタリック */}
                <div
                    style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        background: `
                            conic-gradient(
                                from 0deg,
                                ${step.color}00 0deg,
                                ${step.color} 90deg,
                                ${step.color}00 180deg,
                                ${step.color} 270deg,
                                ${step.color}00 360deg
                            )
                        `,
                        transform: `rotate(${frame * 2}deg)`,
                        padding: 3,
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            background: "#0a0a15",
                        }}
                    />
                </div>

                {/* 内側 - メタリック */}
                <div
                    style={{
                        position: "absolute",
                        width: 90,
                        height: 90,
                        left: 10,
                        top: 10,
                        borderRadius: "50%",
                        background: `
                            linear-gradient(180deg, 
                                rgba(40, 45, 60, 0.95) 0%, 
                                rgba(20, 25, 40, 0.95) 50%,
                                rgba(30, 35, 50, 0.95) 100%
                            )
                        `,
                        boxShadow: `
                            0 10px 30px rgba(0, 0, 0, 0.5),
                            0 0 40px ${step.color}${Math.floor(glowIntensity * 50).toString(16).padStart(2, '0')},
                            inset 0 2px 0 rgba(255, 255, 255, 0.1),
                            inset 0 -2px 0 rgba(0, 0, 0, 0.2)
                        `,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            fontSize: 36,
                            fontWeight: 800,
                            fontFamily: "monospace",
                            background: `
                                linear-gradient(180deg, 
                                    #ffffff 0%, 
                                    ${step.color} 100%
                                )
                            `,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        {step.number}
                    </div>
                </div>
            </div>

            {/* アイコン */}
            <div style={{ fontSize: 60 }}>{step.icon}</div>

            {/* ラベル */}
            <div
                style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: "#ffffff",
                    fontFamily: "'Noto Sans JP', sans-serif",
                }}
            >
                {step.label}
            </div>

            {/* サブラベル */}
            <div
                style={{
                    fontSize: 16,
                    color: step.color,
                    fontFamily: "monospace",
                    letterSpacing: 3,
                    opacity: 0.8,
                }}
            >
                {step.subLabel}
            </div>
        </div>
    );
};

// 接続ライン
const ConnectionLine: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
    const frame = useCurrentFrame();
    const progress = interpolate(frame - delay, [0, 30], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const particlePos = (frame * 3 + delay * 10) % 100;

    return (
        <div
            style={{
                width: 120,
                height: 4,
                background: `
                    linear-gradient(90deg, 
                        transparent 0%, 
                        ${color}40 20%, 
                        ${color} 50%, 
                        ${color}40 80%, 
                        transparent 100%
                    )
                `,
                opacity: progress,
                position: "relative",
                borderRadius: 2,
            }}
        >
            {/* 流れるパーティクル */}
            <div
                style={{
                    position: "absolute",
                    width: 12,
                    height: 12,
                    left: `${particlePos}%`,
                    top: -4,
                    borderRadius: "50%",
                    background: color,
                    boxShadow: `0 0 20px ${color}`,
                    opacity: progress * 0.8,
                }}
            />
        </div>
    );
};

export const Workflow3DScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleOpacity = interpolate(frame, [0, 25], [0, 1], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: `
                    radial-gradient(ellipse at 50% 40%, #0a1020 0%, #050810 50%, #020408 100%)
                `,
                overflow: "hidden",
            }}
        >
            {/* 大気ライト */}
            <div
                style={{
                    position: "absolute",
                    width: 800,
                    height: 500,
                    left: "50%",
                    top: "45%",
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    background: `
                        radial-gradient(ellipse at center, 
                            rgba(100, 150, 255, 0.08) 0%, 
                            transparent 60%
                        )
                    `,
                    filter: "blur(50px)",
                }}
            />

            {/* 3Dグリッド床 */}
            <div
                style={{
                    position: "absolute",
                    width: 4000,
                    height: 2000,
                    left: "50%",
                    bottom: -400,
                    transform: "translateX(-50%) rotateX(75deg)",
                    background: `
                        linear-gradient(90deg, rgba(100, 150, 255, 0.04) 1px, transparent 1px),
                        linear-gradient(rgba(100, 150, 255, 0.04) 1px, transparent 1px)
                    `,
                    backgroundSize: "100px 100px",
                    maskImage: "linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%)",
                }}
            />

            {/* タイトル */}
            <div
                style={{
                    position: "absolute",
                    top: 90,
                    width: "100%",
                    textAlign: "center",
                    opacity: titleOpacity,
                }}
            >
                <div style={{
                    fontSize: 18,
                    color: "#88aaff",
                    fontFamily: "monospace",
                    letterSpacing: 8,
                    marginBottom: 12,
                }}>
                    [ WORKFLOW ]
                </div>
                <div style={{
                    fontSize: 58,
                    fontWeight: 800,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    background: `
                        linear-gradient(180deg, 
                            #ffffff 0%, 
                            #ccddff 50%, 
                            #88aadd 100%
                        )
                    `,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 5px 20px rgba(100, 150, 255, 0.3))",
                }}>
                    かんたん3ステップ
                </div>
            </div>

            {/* ステップコンテナ */}
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 30,
                    paddingTop: 80,
                }}
            >
                {steps.map((step, index) => {
                    const delay = 30 + index * 25;
                    const stepProgress = spring({
                        frame: frame - delay,
                        fps,
                        config: { damping: 15, stiffness: 80 },
                    });

                    return (
                        <React.Fragment key={index}>
                            <StepCard step={step} index={index} progress={stepProgress} />
                            {index < steps.length - 1 && (
                                <ConnectionLine
                                    delay={delay + 20}
                                    color={step.color}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* ビネット */}
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    background: `
                        radial-gradient(ellipse at center, 
                            transparent 50%, 
                            rgba(0, 0, 0, 0.4) 100%
                        )
                    `,
                    pointerEvents: "none",
                }}
            />
        </AbsoluteFill>
    );
};
