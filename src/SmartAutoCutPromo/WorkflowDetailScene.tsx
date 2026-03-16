import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

const STEPS = [
    { icon: "🖥️", label: "サーバー起動" },
    { icon: "🎬", label: "パネルを開く" },
    { icon: "✨", label: "ワンクリック実行" },
];

export const WorkflowDetailScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Title entrance
    const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: "clamp",
    });
    const titleY = interpolate(frame, [0, 20], [-30, 0], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background:
                    "linear-gradient(135deg, #0a0a1a 0%, #0d1025 50%, #0a0a1a 100%)",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* Background glow */}
            <div
                style={{
                    position: "absolute",
                    width: 800,
                    height: 800,
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(0,200,255,0.15) 0%, transparent 60%)",
                    filter: "blur(120px)",
                    transform: `scale(${1 + Math.sin(frame * 0.06) * 0.15})`,
                }}
            />

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 50,
                    zIndex: 10,
                }}
            >
                {/* Section title */}
                <div
                    style={{
                        fontSize: 44,
                        fontWeight: 800,
                        color: "white",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        textShadow: "0 0 40px rgba(0,200,255,0.5)",
                        opacity: titleOpacity,
                        transform: `translateY(${titleY}px)`,
                    }}
                >
                    ✂️ かんたん3ステップ
                </div>

                {/* Steps row */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 30,
                    }}
                >
                    {STEPS.map((step, i) => {
                        const delay = 15 + i * 22;
                        const stepScale = spring({
                            frame: Math.max(0, frame - delay),
                            fps,
                            config: { damping: 10, stiffness: 120 },
                        });
                        const stepOpacity = interpolate(
                            frame,
                            [delay, delay + 15],
                            [0, 1],
                            {
                                extrapolateLeft: "clamp",
                                extrapolateRight: "clamp",
                            }
                        );
                        const arrowDelay = delay + 12;
                        const arrowOpacity = interpolate(
                            frame,
                            [arrowDelay, arrowDelay + 10],
                            [0, 1],
                            {
                                extrapolateLeft: "clamp",
                                extrapolateRight: "clamp",
                            }
                        );

                        return (
                            <React.Fragment key={i}>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 16,
                                        opacity: stepOpacity,
                                        transform: `scale(${stepScale})`,
                                    }}
                                >
                                    {/* Step number */}
                                    <div
                                        style={{
                                            width: 70,
                                            height: 70,
                                            borderRadius: "50%",
                                            background:
                                                "linear-gradient(135deg, #00c8ff, #00c8ffAA)",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            fontSize: 32,
                                            fontWeight: 900,
                                            color: "white",
                                            fontFamily:
                                                "'SF Pro Display', -apple-system, sans-serif",
                                            boxShadow:
                                                "0 4px 30px rgba(0,200,255,0.4)",
                                        }}
                                    >
                                        {i + 1}
                                    </div>

                                    {/* Step card */}
                                    <div
                                        style={{
                                            background: "rgba(255,255,255,0.05)",
                                            border: "1px solid rgba(0,200,255,0.3)",
                                            borderRadius: 16,
                                            padding: "28px 40px",
                                            minWidth: 280,
                                            textAlign: "center",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 50,
                                                marginBottom: 12,
                                            }}
                                        >
                                            {step.icon}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 28,
                                                fontWeight: 700,
                                                color: "white",
                                                fontFamily:
                                                    "'SF Pro Display', -apple-system, sans-serif",
                                            }}
                                        >
                                            {step.label}
                                        </div>
                                    </div>
                                </div>

                                {i < STEPS.length - 1 && (
                                    <div
                                        style={{
                                            fontSize: 40,
                                            color: "#00c8ff",
                                            fontWeight: 900,
                                            opacity: arrowOpacity,
                                            textShadow:
                                                "0 0 20px rgba(0,200,255,0.5)",
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
