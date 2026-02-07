import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

const steps = [
    { icon: "🎙️", label: "Transcribe", color: "#9966FF" },
    { icon: "✂️", label: "Cut", color: "#FF6B6B" },
    { icon: "💬", label: "Caption", color: "#4ECDC4" },
];

export const WorkflowScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* Header */}
            <div
                style={{
                    position: "absolute",
                    top: 100,
                    fontSize: 56,
                    fontWeight: 700,
                    color: "white",
                    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                    opacity: headerOpacity,
                }}
            >
                シームレスなワークフロー
            </div>

            {/* Workflow steps */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 30,
                }}
            >
                {steps.map((step, i) => {
                    const delay = i * 25 + 20;
                    const stepScale = spring({
                        frame: frame - delay,
                        fps,
                        config: { damping: 12, stiffness: 100 },
                    });

                    const stepOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    });

                    // Arrow animation
                    const arrowDelay = delay + 15;
                    const arrowOpacity = interpolate(frame, [arrowDelay, arrowDelay + 10], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    });
                    const arrowX = interpolate(frame, [arrowDelay, arrowDelay + 10], [-20, 0], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    });

                    return (
                        <React.Fragment key={i}>
                            {/* Step Card */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 20,
                                    background: `linear-gradient(145deg, ${step.color}25 0%, rgba(0,0,0,0.3) 100%)`,
                                    borderRadius: 24,
                                    padding: "50px 60px",
                                    border: `2px solid ${step.color}50`,
                                    transform: `scale(${Math.max(0, stepScale)})`,
                                    opacity: stepOpacity,
                                    boxShadow: `0 20px 60px ${step.color}30`,
                                }}
                            >
                                <div style={{ fontSize: 80 }}>{step.icon}</div>
                                <div
                                    style={{
                                        fontSize: 32,
                                        fontWeight: 700,
                                        color: step.color,
                                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                                    }}
                                >
                                    {step.label}
                                </div>
                            </div>

                            {/* Arrow */}
                            {i < steps.length - 1 && (
                                <div
                                    style={{
                                        fontSize: 60,
                                        color: "rgba(255,255,255,0.5)",
                                        opacity: arrowOpacity,
                                        transform: `translateX(${arrowX}px)`,
                                    }}
                                >
                                    →
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Bottom text */}
            <div
                style={{
                    position: "absolute",
                    bottom: 120,
                    fontSize: 36,
                    color: "rgba(255,255,255,0.7)",
                    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                    opacity: interpolate(frame, [100, 120], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    }),
                }}
            >
                SRTファイルで連携 • ワンクリック処理
            </div>
        </AbsoluteFill>
    );
};
