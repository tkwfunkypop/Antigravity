import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

const problems = [
    { icon: "⏱️", text: "手動の文字起こしに何時間も..." },
    { icon: "🔇", text: "無音区間を一つずつカット..." },
    { icon: "📝", text: "テロップを手作業で配置..." },
];

export const ProblemScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: "clamp",
    });

    const headerY = interpolate(frame, [0, 20], [-30, 0], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(180deg, #0a0a15 0%, #1a1a30 100%)",
                justifyContent: "center",
                alignItems: "center",
                padding: 80,
            }}
        >
            {/* Header */}
            <div
                style={{
                    position: "absolute",
                    top: 120,
                    fontSize: 64,
                    fontWeight: 800,
                    color: "white",
                    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                    opacity: headerOpacity,
                    transform: `translateY(${headerY}px)`,
                }}
            >
                動画編集で時間がかかる作業...
            </div>

            {/* Problem cards */}
            <div
                style={{
                    display: "flex",
                    gap: 50,
                    marginTop: 80,
                }}
            >
                {problems.map((problem, i) => {
                    const delay = i * 15 + 30;
                    const cardScale = spring({
                        frame: frame - delay,
                        fps,
                        config: { damping: 12, stiffness: 80 },
                    });

                    const cardOpacity = interpolate(frame, [delay, delay + 20], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    });

                    return (
                        <div
                            key={i}
                            style={{
                                background: "linear-gradient(145deg, rgba(255,100,100,0.15) 0%, rgba(255,50,50,0.05) 100%)",
                                borderRadius: 24,
                                padding: "50px 40px",
                                width: 380,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 24,
                                border: "1px solid rgba(255,100,100,0.3)",
                                transform: `scale(${cardScale})`,
                                opacity: cardOpacity,
                            }}
                        >
                            <div style={{ fontSize: 72 }}>{problem.icon}</div>
                            <div
                                style={{
                                    fontSize: 28,
                                    fontWeight: 600,
                                    color: "#ff9999",
                                    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                                    textAlign: "center",
                                    lineHeight: 1.4,
                                }}
                            >
                                {problem.text}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom fade hint */}
            <div
                style={{
                    position: "absolute",
                    bottom: 60,
                    fontSize: 32,
                    color: "rgba(255,255,255,0.5)",
                    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                    opacity: interpolate(frame, [90, 110], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    }),
                }}
            >
                これらを一発で解決 ↓
            </div>
        </AbsoluteFill>
    );
};
