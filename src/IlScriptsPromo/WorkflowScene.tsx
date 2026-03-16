import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

interface WorkflowSceneProps {
    steps: string[];
    color: string;
    icon: string;
}

const STEP_ICONS = ["①", "②", "③"];

export const WorkflowScene: React.FC<WorkflowSceneProps> = ({
    steps,
    color,
    icon,
}) => {
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
                    "linear-gradient(135deg, #0a0500 0%, #1a0f00 50%, #0a0500 100%)",
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
                    background: `radial-gradient(circle, ${color}25 0%, transparent 60%)`,
                    filter: "blur(120px)",
                    transform: `scale(${1 + Math.sin(frame * 0.08) * 0.15})`,
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
                        letterSpacing: "-0.01em",
                        textShadow: `0 0 40px ${color}60`,
                        opacity: titleOpacity,
                        transform: `translateY(${titleY}px)`,
                    }}
                >
                    <span style={{ marginRight: 16 }}>{icon}</span>
                    使い方はカンタン
                </div>

                {/* Steps row */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 30,
                    }}
                >
                    {steps.map((step, i) => {
                        const delay = 15 + i * 20;
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

                        // Arrow between steps
                        const arrowDelay = delay + 10;
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
                                {/* Step card */}
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
                                            background: `linear-gradient(135deg, ${color}, ${color}AA)`,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            fontSize: 32,
                                            fontWeight: 900,
                                            color: "white",
                                            fontFamily:
                                                "'SF Pro Display', -apple-system, sans-serif",
                                            boxShadow: `0 4px 30px ${color}50`,
                                        }}
                                    >
                                        {STEP_ICONS[i]}
                                    </div>

                                    {/* Step card body */}
                                    <div
                                        style={{
                                            background: "rgba(255,255,255,0.05)",
                                            border: `1px solid ${color}40`,
                                            borderRadius: 16,
                                            padding: "24px 36px",
                                            minWidth: 260,
                                            textAlign: "center",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 28,
                                                fontWeight: 700,
                                                color: "white",
                                                fontFamily:
                                                    "'SF Pro Display', -apple-system, sans-serif",
                                                lineHeight: 1.4,
                                            }}
                                        >
                                            {step}
                                        </div>
                                    </div>
                                </div>

                                {/* Arrow between steps */}
                                {i < steps.length - 1 && (
                                    <div
                                        style={{
                                            fontSize: 40,
                                            color,
                                            fontWeight: 900,
                                            opacity: arrowOpacity,
                                            textShadow: `0 0 20px ${color}60`,
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
