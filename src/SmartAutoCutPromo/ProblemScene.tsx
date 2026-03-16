import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
} from "remotion";

const PROBLEMS = [
    { icon: "⏱️", text: "無音を手動でカット", subtext: "時間がかかりすぎる" },
    { icon: "🔄", text: "リテイク探し", subtext: "どれがベストテイク？" },
    { icon: "😓", text: "単調な繰り返し作業", subtext: "クリエイティブに集中したい" },
];

export const ProblemScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Scene rotation for depth
    const sceneRotate = interpolate(frame, [0, 150], [-2, 2], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: "radial-gradient(ellipse at 30% 30%, #2a0a0a 0%, #1a0505 50%, #0a0202 100%)",
                perspective: 1000,
                overflow: "hidden",
            }}
        >
            {/* Floating Warning Circles */}
            {[...Array(3)].map((_, i) => {
                const orbitFrame = frame + i * 30;
                const x = Math.sin(orbitFrame * 0.02) * 400;
                const y = Math.cos(orbitFrame * 0.015) * 200;
                const size = 80 + i * 40;

                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            left: `${50 + x / 20}%`,
                            top: `${30 + y / 10}%`,
                            width: size,
                            height: size,
                            borderRadius: "50%",
                            background: `radial-gradient(circle, rgba(255, 50, 50, ${0.15 - i * 0.03}) 0%, transparent 70%)`,
                            transform: "translate(-50%, -50%)",
                        }}
                    />
                );
            })}

            {/* Main Content with 3D Transform */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    transform: `rotateY(${sceneRotate}deg)`,
                    transformStyle: "preserve-3d",
                }}
            >
                {/* Header */}
                <h2
                    style={{
                        fontSize: 64,
                        fontWeight: 800,
                        color: "#ff4757",
                        fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                        marginBottom: 80,
                        textShadow: "0 0 40px rgba(255, 71, 87, 0.5)",
                        opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
                        transform: `translateZ(50px) scale(${spring({ frame, fps, config: { damping: 12 } })})`,
                    }}
                >
                    こんな悩み、ありませんか？
                </h2>

                {/* Problem Cards - Staggered 3D */}
                <div
                    style={{
                        display: "flex",
                        gap: 50,
                        transformStyle: "preserve-3d",
                    }}
                >
                    {PROBLEMS.map((problem, index) => {
                        const delay = 30 + index * 20;
                        const cardProgress = spring({
                            frame: frame - delay,
                            fps,
                            config: { damping: 12, stiffness: 80 },
                        });

                        const zOffset = (1 - index) * 30; // Middle card closer

                        return (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 16,
                                    padding: "40px 35px",
                                    background: "linear-gradient(180deg, rgba(255, 71, 87, 0.15) 0%, rgba(255, 71, 87, 0.05) 100%)",
                                    borderRadius: 24,
                                    border: "1px solid rgba(255, 71, 87, 0.3)",
                                    transform: `translateZ(${zOffset}px) scale(${cardProgress}) rotateY(${(index - 1) * -5}deg)`,
                                    opacity: interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: "clamp" }),
                                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                                    minWidth: 220,
                                }}
                            >
                                <span style={{ fontSize: 56 }}>{problem.icon}</span>
                                <span
                                    style={{
                                        fontSize: 26,
                                        fontWeight: 700,
                                        color: "#fff",
                                        fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                                        textAlign: "center",
                                    }}
                                >
                                    {problem.text}
                                </span>
                                <span
                                    style={{
                                        fontSize: 16,
                                        color: "rgba(255, 255, 255, 0.5)",
                                        fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                                    }}
                                >
                                    {problem.subtext}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AbsoluteFill>
    );
};
