import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
    Sequence,
} from "remotion";

const WORKFLOW_STEPS = [
    { num: 1, text: "サーバー起動", icon: "🚀" },
    { num: 2, text: "パネルを開く", icon: "📋" },
    { num: 3, text: "分析実行", icon: "🎙️" },
    { num: 4, text: "完了！", icon: "✅" },
];

export const DemoScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Title
    const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 100%)",
                justifyContent: "center",
                alignItems: "center",
                padding: 80,
            }}
        >
            {/* Title */}
            <h2
                style={{
                    fontSize: 48,
                    fontWeight: 700,
                    color: "#fff",
                    fontFamily: "'Inter', sans-serif",
                    marginBottom: 60,
                    opacity: titleOpacity,
                }}
            >
                使い方は超シンプル
            </h2>

            {/* Workflow Steps */}
            <div style={{ display: "flex", gap: 30 }}>
                {WORKFLOW_STEPS.map((step, index) => (
                    <Sequence key={index} from={30 + index * 40}>
                        <WorkflowStep step={step} index={index} />
                    </Sequence>
                ))}
            </div>

            {/* Progress Line */}
            <div
                style={{
                    position: "absolute",
                    bottom: 200,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                }}
            >
                {[0, 1, 2].map((i) => {
                    const lineStart = 70 + i * 40;
                    const progress = interpolate(
                        frame,
                        [lineStart, lineStart + 30],
                        [0, 100],
                        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                    );

                    return (
                        <div key={i} style={{ display: "flex", alignItems: "center" }}>
                            <div
                                style={{
                                    width: 140,
                                    height: 4,
                                    background: "rgba(0,217,255,0.2)",
                                    borderRadius: 2,
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        width: `${progress}%`,
                                        height: "100%",
                                        background: "linear-gradient(90deg, #00d9ff, #00ff88)",
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};

const WorkflowStep: React.FC<{ step: { num: number; text: string; icon: string }; index: number }> = ({
    step,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const scale = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 100 },
    });

    const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                opacity,
                transform: `scale(${scale})`,
            }}
        >
            <div
                style={{
                    width: 80,
                    height: 80,
                    borderRadius: 20,
                    background: "linear-gradient(135deg, rgba(0,217,255,0.2), rgba(0,255,136,0.2))",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 40,
                    border: "2px solid rgba(0,217,255,0.3)",
                }}
            >
                {step.icon}
            </div>
            <span
                style={{
                    fontSize: 18,
                    color: "#e0e0e0",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                }}
            >
                {step.text}
            </span>
        </div>
    );
};
