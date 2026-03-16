import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    interpolate,
    spring,
    useVideoConfig,
} from "remotion";

/** 課題シーン: プロジェクトパネルの問題を提示 */
export const ProblemScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleSpring = spring({ frame, fps, config: { damping: 14 } });

    const problems = [
        { icon: "📁", text: "何百ものファイルが\nフォルダに埋もれている", delay: 15 },
        { icon: "🔍", text: "目的の素材が\n見つからない", delay: 35 },
        { icon: "⏱", text: "プレビューするには\n毎回ダブルクリック", delay: 55 },
    ];

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #1a0a0a 0%, #2d0a0a 50%, #0a0a1a 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
            }}
        >
            {/* Grid pattern background */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `
            linear-gradient(rgba(255,60,60,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,60,60,0.03) 1px, transparent 1px)
          `,
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Title */}
            <div
                style={{
                    transform: `scale(${titleSpring})`,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    fontSize: 52,
                    fontWeight: 900,
                    color: "#ff4444",
                    marginBottom: 60,
                    textShadow: "0 0 40px rgba(255,68,68,0.4)",
                }}
            >
                😫 こんな悩みありませんか？
            </div>

            {/* Problem cards */}
            <div style={{ display: "flex", gap: 50 }}>
                {problems.map((p, i) => {
                    const cardSpring = spring({
                        frame: frame - p.delay,
                        fps,
                        config: { damping: 12, stiffness: 80 },
                    });
                    const cardOpacity = interpolate(frame - p.delay, [0, 15], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    });
                    const shake =
                        frame > p.delay + 30
                            ? Math.sin((frame - p.delay - 30) * 0.3) * 2
                            : 0;

                    return (
                        <div
                            key={i}
                            style={{
                                transform: `scale(${cardSpring}) translateX(${shake}px)`,
                                opacity: cardOpacity,
                                background: "rgba(255,40,40,0.08)",
                                border: "1px solid rgba(255,60,60,0.3)",
                                borderRadius: 20,
                                padding: "40px 36px",
                                width: 320,
                                textAlign: "center",
                                backdropFilter: "blur(10px)",
                            }}
                        >
                            <div style={{ fontSize: 64, marginBottom: 16 }}>{p.icon}</div>
                            <div
                                style={{
                                    fontFamily: "'Noto Sans JP', sans-serif",
                                    fontSize: 24,
                                    fontWeight: 700,
                                    color: "#ffaaaa",
                                    lineHeight: 1.5,
                                    whiteSpace: "pre-line",
                                }}
                            >
                                {p.text}
                            </div>
                        </div>
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};
