import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

const solutions = [
    { icon: "💬", text: "テキスト入力だけ", subtext: "日本語OK", delay: 0 },
    { icon: "🤖", text: "Claude AI搭載", subtext: "自然言語で指示", delay: 25 },
    { icon: "⚡", text: "数秒で完成", subtext: "リアルタイム生成", delay: 50 },
];

export const SolutionScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Title animation
    const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: "clamp",
    });

    const titleScale = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 80 },
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #0a1a0a 0%, #1a2d1a 50%, #0f1a2d 100%)",
                justifyContent: "center",
                alignItems: "center",
                padding: 80,
            }}
        >
            {/* Success glow */}
            <div
                style={{
                    position: "absolute",
                    width: 600,
                    height: 600,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)",
                    filter: "blur(80px)",
                }}
            />

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 60,
                    width: "100%",
                    maxWidth: 1400,
                }}
            >
                {/* Title */}
                <div
                    style={{
                        opacity: titleOpacity,
                        transform: `scale(${titleScale})`,
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            fontSize: 56,
                            fontWeight: 800,
                            color: "#22c55e",
                            fontFamily: "'Noto Sans JP', sans-serif",
                            marginBottom: 10,
                        }}
                    >
                        VIBE MOTIONなら
                    </div>
                    <div
                        style={{
                            fontSize: 72,
                            fontWeight: 900,
                            color: "white",
                            fontFamily: "'Noto Sans JP', sans-serif",
                        }}
                    >
                        すべて解決！
                    </div>
                </div>

                {/* Solution cards */}
                <div
                    style={{
                        display: "flex",
                        gap: 40,
                        justifyContent: "center",
                    }}
                >
                    {solutions.map((solution, index) => {
                        const cardProgress = spring({
                            frame: frame - solution.delay - 40,
                            fps,
                            config: { damping: 12, stiffness: 100 },
                        });

                        const cardOpacity = interpolate(
                            frame,
                            [solution.delay + 40, solution.delay + 60],
                            [0, 1],
                            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                        );

                        return (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 20,
                                    padding: "40px 50px",
                                    background: "rgba(34, 197, 94, 0.15)",
                                    borderRadius: 24,
                                    border: "2px solid rgba(34, 197, 94, 0.4)",
                                    opacity: cardOpacity,
                                    transform: `scale(${cardProgress}) translateY(${(1 - cardProgress) * 30}px)`,
                                    minWidth: 280,
                                }}
                            >
                                <span style={{ fontSize: 64 }}>{solution.icon}</span>
                                <span
                                    style={{
                                        fontSize: 36,
                                        color: "white",
                                        fontFamily: "'Noto Sans JP', sans-serif",
                                        fontWeight: 700,
                                        textAlign: "center",
                                    }}
                                >
                                    {solution.text}
                                </span>
                                <span
                                    style={{
                                        fontSize: 22,
                                        color: "#86efac",
                                        fontFamily: "'Noto Sans JP', sans-serif",
                                        fontWeight: 500,
                                    }}
                                >
                                    {solution.subtext}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Celebration emoji */}
                <div
                    style={{
                        fontSize: 80,
                        opacity: interpolate(frame, [130, 150], [0, 1], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        }),
                        transform: `scale(${spring({
                            frame: frame - 130,
                            fps,
                            config: { damping: 10, stiffness: 150 },
                        })})`,
                    }}
                >
                    🎉
                </div>
            </div>
        </AbsoluteFill>
    );
};
