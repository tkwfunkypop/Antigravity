import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    interpolate,
    spring,
    useVideoConfig,
} from "remotion";

/** インストール簡単シーン */
export const InstallScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const headerSpring = spring({ frame, fps, config: { damping: 14 } });

    const steps = [
        { num: "1", text: "ZIPを展開", icon: "📦", delay: 12 },
        { num: "2", text: "インストーラーを\nダブルクリック", icon: "🖱", delay: 30 },
        { num: "3", text: "AEを再起動して完了！", icon: "✅", delay: 48 },
    ];

    // Arrow animation
    const arrowOpacity1 = interpolate(frame, [28, 35], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const arrowOpacity2 = interpolate(frame, [46, 53], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #0a1a0a 0%, #0a2a15 50%, #0a0a1a 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
            }}
        >
            {/* Title */}
            <div
                style={{
                    transform: `scale(${headerSpring})`,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    fontSize: 48,
                    fontWeight: 900,
                    color: "#66bb6a",
                    marginBottom: 70,
                    textShadow: "0 0 40px rgba(102,187,106,0.4)",
                }}
            >
                🚀 インストールは3ステップ
            </div>

            {/* Steps */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {steps.map((s, i) => {
                    const stepSpring = spring({
                        frame: frame - s.delay,
                        fps,
                        config: { damping: 12, stiffness: 90 },
                    });

                    return (
                        <React.Fragment key={i}>
                            <div
                                style={{
                                    transform: `scale(${stepSpring})`,
                                    background: "rgba(102,187,106,0.08)",
                                    border: "1px solid rgba(102,187,106,0.3)",
                                    borderRadius: 20,
                                    padding: "40px 50px",
                                    textAlign: "center",
                                    width: 300,
                                    backdropFilter: "blur(10px)",
                                }}
                            >
                                <div style={{ fontSize: 56, marginBottom: 12 }}>{s.icon}</div>
                                <div
                                    style={{
                                        fontFamily: "'Noto Sans JP', sans-serif",
                                        fontSize: 15,
                                        fontWeight: 800,
                                        color: "rgba(102,187,106,0.6)",
                                        marginBottom: 6,
                                    }}
                                >
                                    STEP {s.num}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Noto Sans JP', sans-serif",
                                        fontSize: 24,
                                        fontWeight: 700,
                                        color: "#c8e6c9",
                                        lineHeight: 1.5,
                                        whiteSpace: "pre-line",
                                    }}
                                >
                                    {s.text}
                                </div>
                            </div>
                            {i < steps.length - 1 && (
                                <div
                                    style={{
                                        opacity: i === 0 ? arrowOpacity1 : arrowOpacity2,
                                        fontSize: 40,
                                        color: "rgba(102,187,106,0.5)",
                                    }}
                                >
                                    →
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Mac & Win badges */}
            <div
                style={{
                    display: "flex",
                    gap: 20,
                    marginTop: 50,
                    opacity: interpolate(frame, [60, 75], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    }),
                }}
            >
                {["🍎 Mac", "🪟 Windows"].map((os, i) => (
                    <div
                        key={i}
                        style={{
                            padding: "10px 28px",
                            borderRadius: 30,
                            border: "1px solid rgba(255,255,255,0.15)",
                            background: "rgba(255,255,255,0.05)",
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 18,
                            color: "rgba(255,255,255,0.6)",
                        }}
                    >
                        {os}
                    </div>
                ))}
            </div>
        </AbsoluteFill>
    );
};
