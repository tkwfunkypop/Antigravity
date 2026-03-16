import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

const BADGES = [
    { icon: "🔊", label: "Whisper AI" },
    { icon: "🎯", label: "50ms精度" },
    { icon: "⚡", label: "高速処理" },
    { icon: "🆓", label: "無料" },
];

export const TrustBadgesScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
        extrapolateRight: "clamp",
    });
    const titleScale = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 100 },
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
                    width: 700,
                    height: 700,
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(0,200,255,0.15) 0%, transparent 60%)",
                    filter: "blur(100px)",
                    transform: `scale(${1 + Math.sin(frame * 0.06) * 0.2})`,
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
                        opacity: titleOpacity,
                        transform: `scale(${titleScale})`,
                        textShadow: "0 0 40px rgba(0,200,255,0.5)",
                    }}
                >
                    選ばれる理由
                </div>

                {/* Badges grid */}
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: 30,
                        maxWidth: 1100,
                    }}
                >
                    {BADGES.map((badge, i) => {
                        const delay = 12 + i * 15;
                        const badgeScale = spring({
                            frame: Math.max(0, frame - delay),
                            fps,
                            config: { damping: 10, stiffness: 130 },
                        });
                        const badgeOpacity = interpolate(
                            frame,
                            [delay, delay + 12],
                            [0, 1],
                            {
                                extrapolateLeft: "clamp",
                                extrapolateRight: "clamp",
                            }
                        );
                        const hoverPulse =
                            1 + Math.sin((frame - delay) * 0.1) * 0.02;

                        return (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 14,
                                    padding: "30px 40px",
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(0,200,255,0.2)",
                                    borderRadius: 20,
                                    minWidth: 200,
                                    opacity: badgeOpacity,
                                    transform: `scale(${badgeScale * hoverPulse})`,
                                    boxShadow:
                                        "0 4px 30px rgba(0,200,255,0.1)",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 56,
                                        filter: "drop-shadow(0 2px 10px rgba(0,200,255,0.3))",
                                    }}
                                >
                                    {badge.icon}
                                </div>
                                <div
                                    style={{
                                        fontSize: 26,
                                        fontWeight: 700,
                                        color: "white",
                                        fontFamily:
                                            "'SF Pro Display', -apple-system, sans-serif",
                                        letterSpacing: "0.02em",
                                    }}
                                >
                                    {badge.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AbsoluteFill>
    );
};
