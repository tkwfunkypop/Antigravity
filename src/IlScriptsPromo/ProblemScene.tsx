import React from "react";
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

interface ProblemSceneProps {
    problemText: string;
    color: string;
}

export const ProblemScene: React.FC<ProblemSceneProps> = ({
    problemText,
    color,
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Typewriter effect - reveal characters over longer time
    const charCount = Math.floor(
        interpolate(frame, [10, 80], [0, problemText.length], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
    );

    const displayedText = problemText.slice(0, charCount);
    const showCursor = frame < 90 && frame % 10 < 6;

    // Question mark emphasis
    const qScale = interpolate(frame, [75, 95], [0.5, 1.2], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const qOpacity = interpolate(frame, [75, 88], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Background pulse
    const bgPulse = interpolate(frame, [0, durationInFrames], [0, 1], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background:
                    "linear-gradient(135deg, #0a0500 0%, #1a0a00 50%, #0a0500 100%)",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* Warning-like subtle glow */}
            <div
                style={{
                    position: "absolute",
                    width: 1000,
                    height: 600,
                    borderRadius: "50%",
                    background: `radial-gradient(ellipse, ${color}15 0%, transparent 60%)`,
                    filter: "blur(80px)",
                    transform: `scale(${1 + bgPulse * 0.3})`,
                }}
            />

            {/* Diagonal accent lines */}
            {[...Array(3)].map((_, i) => {
                const lineOpacity = interpolate(
                    frame,
                    [5 + i * 10, 25 + i * 10],
                    [0, 0.06],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );
                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            width: 2500,
                            height: 1,
                            background: color,
                            opacity: lineOpacity,
                            transform: `rotate(-30deg) translateY(${(i - 1) * 200}px)`,
                        }}
                    />
                );
            })}

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 30,
                    zIndex: 10,
                    maxWidth: 1200,
                    padding: "0 80px",
                }}
            >
                {/* Main question text */}
                <div
                    style={{
                        fontSize: 56,
                        fontWeight: 700,
                        color: "white",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        textAlign: "center",
                        lineHeight: 1.4,
                        textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                    }}
                >
                    {displayedText}
                    {showCursor && (
                        <span style={{ color, fontWeight: 300 }}>|</span>
                    )}
                </div>

                {/* Emphasized question mark */}
                {charCount >= problemText.length && (
                    <div
                        style={{
                            fontSize: 120,
                            fontWeight: 900,
                            color: color,
                            fontFamily:
                                "'SF Pro Display', -apple-system, sans-serif",
                            textShadow: `0 0 60px ${color}60`,
                            transform: `scale(${qScale})`,
                            opacity: qOpacity,
                        }}
                    >
                        ?
                    </div>
                )}
            </div>
        </AbsoluteFill>
    );
};
