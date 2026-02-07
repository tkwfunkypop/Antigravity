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

    const logoGlow = interpolate(frame, [0, 60, 120], [0, 1, 0.7], {
        extrapolateRight: "clamp",
    });

    // Title animation
    const titleProgress = spring({
        frame: frame - 20,
        fps,
        config: { damping: 15, stiffness: 80 },
    });

    const titleOpacity = interpolate(frame, [20, 40], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Subtitle animation
    const subtitleOpacity = interpolate(frame, [50, 70], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const subtitleY = interpolate(frame, [50, 70], [30, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Powered by Claude badge
    const badgeOpacity = interpolate(frame, [80, 100], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b4e 100%)",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* Animated background glow */}
            <div
                style={{
                    position: "absolute",
                    width: 600,
                    height: 600,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, rgba(124,58,237,${0.3 * logoGlow}) 0%, transparent 70%)`,
                    transform: `scale(${1 + Math.sin(frame * 0.03) * 0.15})`,
                    filter: "blur(60px)",
                }}
            />

            {/* Secondary glow */}
            <div
                style={{
                    position: "absolute",
                    width: 400,
                    height: 400,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, rgba(59,130,246,${0.2 * logoGlow}) 0%, transparent 70%)`,
                    transform: `translate(200px, -100px) scale(${1 + Math.cos(frame * 0.04) * 0.1})`,
                    filter: "blur(50px)",
                }}
            />

            {/* Main content */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 30,
                    zIndex: 1,
                }}
            >
                {/* VIBE MOTION Logo */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 20,
                        transform: `scale(${logoScale})`,
                    }}
                >
                    <div
                        style={{
                            width: 100,
                            height: 100,
                            background: "linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)",
                            borderRadius: 24,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            boxShadow: `0 20px 60px rgba(124, 58, 237, ${0.6 * logoGlow})`,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 48,
                                fontWeight: 900,
                            }}
                        >
                            🎬
                        </div>
                    </div>
                </div>

                {/* Main Title */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 10,
                        opacity: titleOpacity,
                        transform: `scale(${titleProgress})`,
                    }}
                >
                    <div
                        style={{
                            fontSize: 100,
                            fontWeight: 900,
                            color: "white",
                            fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                            textAlign: "center",
                            letterSpacing: "-2px",
                            textShadow: "0 4px 40px rgba(124, 58, 237, 0.8)",
                        }}
                    >
                        VIBE MOTION
                    </div>
                    <div
                        style={{
                            fontSize: 28,
                            fontWeight: 600,
                            color: "#a78bfa",
                            fontFamily: "'Noto Sans JP', sans-serif",
                            letterSpacing: "8px",
                        }}
                    >
                        by HiggsField AI
                    </div>
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: 42,
                        color: "white",
                        fontFamily: "'Noto Sans JP', sans-serif",
                        opacity: subtitleOpacity,
                        transform: `translateY(${subtitleY}px)`,
                        textAlign: "center",
                        fontWeight: 500,
                    }}
                >
                    AIでモーショングラフィックスを、誰でも
                </div>

                {/* Powered by Claude badge */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 24px",
                        background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: 50,
                        opacity: badgeOpacity,
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                >
                    <span style={{ fontSize: 20, color: "#a78bfa" }}>⚡</span>
                    <span
                        style={{
                            fontSize: 20,
                            color: "white",
                            fontFamily: "'Noto Sans JP', sans-serif",
                        }}
                    >
                        Powered by Claude AI
                    </span>
                </div>
            </div>
        </AbsoluteFill>
    );
};
