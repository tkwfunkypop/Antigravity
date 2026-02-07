import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

export const TitleScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Logo animation
    const logoScale = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 100 },
    });

    const logoRotate = interpolate(frame, [0, 30], [-10, 0], {
        extrapolateRight: "clamp",
    });

    // Title animation
    const titleProgress = spring({
        frame: frame - 15,
        fps,
        config: { damping: 15, stiffness: 80 },
    });

    const titleOpacity = interpolate(frame, [15, 30], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Subtitle animation
    const subtitleOpacity = interpolate(frame, [40, 55], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const subtitleY = interpolate(frame, [40, 55], [30, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* Animated background elements */}
            <div
                style={{
                    position: "absolute",
                    width: 400,
                    height: 400,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(138,43,226,0.3) 0%, transparent 70%)",
                    transform: `scale(${1 + Math.sin(frame * 0.05) * 0.1})`,
                    filter: "blur(40px)",
                }}
            />

            {/* AE Logo Placeholder */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 30,
                }}
            >
                <div
                    style={{
                        width: 120,
                        height: 120,
                        background: "linear-gradient(135deg, #9966FF 0%, #7B2FBE 100%)",
                        borderRadius: 20,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: 60,
                        fontWeight: 900,
                        color: "white",
                        transform: `scale(${logoScale}) rotate(${logoRotate}deg)`,
                        boxShadow: "0 20px 60px rgba(153, 102, 255, 0.5)",
                    }}
                >
                    Ae
                </div>

                {/* Main Title */}
                <div
                    style={{
                        fontSize: 90,
                        fontWeight: 900,
                        color: "white",
                        fontFamily: "'Noto Sans JP', sans-serif",
                        textAlign: "center",
                        opacity: titleOpacity,
                        transform: `scale(${titleProgress})`,
                        textShadow: "0 4px 30px rgba(153, 102, 255, 0.7)",
                    }}
                >
                    AE File Collector
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: 36,
                        color: "#a78bfa",
                        fontFamily: "'Noto Sans JP', sans-serif",
                        opacity: subtitleOpacity,
                        transform: `translateY(${subtitleY}px)`,
                    }}
                >
                    プロジェクト整理ツール
                </div>
            </div>
        </AbsoluteFill>
    );
};
