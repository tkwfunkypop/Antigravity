import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
    Sequence,
} from "remotion";

const PROBLEMS = [
    { icon: "⏱️", text: "手動で無音をカット…" },
    { icon: "🔄", text: "リテイクを探す時間…" },
    { icon: "😓", text: "単調な作業の繰り返し…" },
];

export const ProblemScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Header animation
    const headerScale = spring({
        frame,
        fps,
        config: { damping: 15, stiffness: 100 },
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(180deg, #1a0a0a 0%, #2a1a1a 100%)",
                justifyContent: "center",
                alignItems: "center",
                padding: 80,
            }}
        >
            {/* Red warning glow */}
            <div
                style={{
                    position: "absolute",
                    width: 600,
                    height: 600,
                    background: "radial-gradient(circle, rgba(255,50,50,0.15) 0%, transparent 70%)",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                }}
            />

            {/* Header */}
            <h2
                style={{
                    fontSize: 56,
                    fontWeight: 700,
                    color: "#ff4757",
                    fontFamily: "'Inter', sans-serif",
                    transform: `scale(${headerScale})`,
                    marginBottom: 60,
                }}
            >
                こんな悩み、ありませんか？
            </h2>

            {/* Problem List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
                {PROBLEMS.map((problem, index) => (
                    <Sequence key={index} from={20 + index * 25}>
                        <ProblemItem icon={problem.icon} text={problem.text} index={index} />
                    </Sequence>
                ))}
            </div>
        </AbsoluteFill>
    );
};

const ProblemItem: React.FC<{ icon: string; text: string; index: number }> = ({
    icon,
    text,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const slideIn = spring({
        frame,
        fps,
        config: { damping: 15, stiffness: 80 },
    });

    const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                opacity,
                transform: `translateX(${(1 - slideIn) * 100}px)`,
            }}
        >
            <span style={{ fontSize: 48 }}>{icon}</span>
            <span
                style={{
                    fontSize: 36,
                    color: "#e0e0e0",
                    fontFamily: "'Inter', sans-serif",
                }}
            >
                {text}
            </span>
        </div>
    );
};
