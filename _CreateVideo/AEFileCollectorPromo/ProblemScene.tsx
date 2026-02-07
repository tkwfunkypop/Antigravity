import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

const problemItems = [
    "📁 ファイルが散らばっている...",
    "🔗 リンク切れが心配...",
    "📦 納品準備が面倒...",
];

export const ProblemScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 100%)",
                justifyContent: "center",
                alignItems: "center",
                padding: 80,
            }}
        >
            {/* Warning background pulse */}
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    background: `radial-gradient(circle at center, rgba(255,100,100,${0.1 + Math.sin(frame * 0.1) * 0.05}) 0%, transparent 50%)`,
                }}
            />

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 50,
                }}
            >
                {/* Title */}
                <div
                    style={{
                        fontSize: 72,
                        fontWeight: 900,
                        color: "#ff6b6b",
                        fontFamily: "'Noto Sans JP', sans-serif",
                        opacity: titleOpacity,
                        textShadow: "0 4px 30px rgba(255, 107, 107, 0.5)",
                    }}
                >
                    こんな悩みありませんか？
                </div>

                {/* Problem items */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 30,
                    }}
                >
                    {problemItems.map((item, index) => {
                        const delay = 20 + index * 20;
                        const itemProgress = spring({
                            frame: frame - delay,
                            fps,
                            config: { damping: 12, stiffness: 100 },
                        });

                        const itemX = interpolate(itemProgress, [0, 1], [-100, 0]);
                        const itemOpacity = interpolate(frame - delay, [0, 15], [0, 1], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        });

                        return (
                            <div
                                key={index}
                                style={{
                                    fontSize: 48,
                                    color: "white",
                                    fontFamily: "'Noto Sans JP', sans-serif",
                                    opacity: itemOpacity,
                                    transform: `translateX(${itemX}px)`,
                                    background: "rgba(255,255,255,0.05)",
                                    padding: "20px 40px",
                                    borderRadius: 15,
                                    borderLeft: "4px solid #ff6b6b",
                                }}
                            >
                                {item}
                            </div>
                        );
                    })}
                </div>
            </div>
        </AbsoluteFill>
    );
};
