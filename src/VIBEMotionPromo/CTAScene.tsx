import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

export const CTAScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Main content animation
    const contentScale = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 80 },
    });

    const contentOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: "clamp",
    });

    // URL animation
    const urlOpacity = interpolate(frame, [40, 60], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const urlScale = spring({
        frame: frame - 40,
        fps,
        config: { damping: 15, stiffness: 100 },
    });

    // Badge animation
    const badgeOpacity = interpolate(frame, [70, 90], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Pulsing glow effect
    const glowIntensity = interpolate(
        Math.sin(frame * 0.1),
        [-1, 1],
        [0.3, 0.6]
    );

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #1a0a2e 0%, #2d1a4e 50%, #1a1a3e 100%)",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* Animated background glow */}
            <div
                style={{
                    position: "absolute",
                    width: 800,
                    height: 800,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, rgba(124,58,237,${glowIntensity}) 0%, transparent 60%)`,
                    filter: "blur(100px)",
                }}
            />

            {/* Secondary glow */}
            <div
                style={{
                    position: "absolute",
                    width: 500,
                    height: 500,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, rgba(59,130,246,${glowIntensity * 0.5}) 0%, transparent 60%)`,
                    transform: "translate(300px, 150px)",
                    filter: "blur(80px)",
                }}
            />

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 40,
                    zIndex: 1,
                    opacity: contentOpacity,
                    transform: `scale(${contentScale})`,
                }}
            >
                {/* Main CTA text */}
                <div
                    style={{
                        fontSize: 72,
                        fontWeight: 900,
                        color: "white",
                        fontFamily: "'Noto Sans JP', sans-serif",
                        textAlign: "center",
                        textShadow: "0 4px 40px rgba(124, 58, 237, 0.8)",
                    }}
                >
                    今すぐ無料で試そう！
                </div>

                {/* URL */}
                <div
                    style={{
                        opacity: urlOpacity,
                        transform: `scale(${urlScale})`,
                    }}
                >
                    <div
                        style={{
                            padding: "25px 60px",
                            background: "linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)",
                            borderRadius: 20,
                            fontSize: 42,
                            fontWeight: 700,
                            color: "white",
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: "1px",
                            boxShadow: `0 20px 60px rgba(124, 58, 237, ${glowIntensity + 0.2})`,
                        }}
                    >
                        higgsfield.ai/vibe-motion
                    </div>
                </div>

                {/* Beta badge */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 15,
                        opacity: badgeOpacity,
                    }}
                >
                    <div
                        style={{
                            padding: "10px 20px",
                            background: "rgba(34, 197, 94, 0.2)",
                            border: "2px solid rgba(34, 197, 94, 0.5)",
                            borderRadius: 50,
                            fontSize: 24,
                            color: "#86efac",
                            fontWeight: 600,
                            fontFamily: "'Noto Sans JP', sans-serif",
                        }}
                    >
                        🎁 Beta版 無料公開中
                    </div>
                </div>

                {/* Powered by */}
                <div
                    style={{
                        opacity: badgeOpacity,
                        fontSize: 22,
                        color: "rgba(255,255,255,0.6)",
                        fontFamily: "'Noto Sans JP', sans-serif",
                    }}
                >
                    Powered by Claude AI
                </div>
            </div>
        </AbsoluteFill>
    );
};
