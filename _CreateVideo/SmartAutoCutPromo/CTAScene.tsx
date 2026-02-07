import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
} from "remotion";

export const CTAScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Logo pulse
    const pulse = interpolate(
        Math.sin(frame * 0.15),
        [-1, 1],
        [1, 1.05]
    );

    // Text animations
    const titleScale = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 100 },
    });

    const subtitleOpacity = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: "clamp" });
    const ctaOpacity = interpolate(frame, [50, 65], [0, 1], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #0a0a1a 0%, #0f2847 50%, #0a1a2a 100%)",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* Animated Background Glow */}
            <div
                style={{
                    position: "absolute",
                    width: 600,
                    height: 600,
                    background: "radial-gradient(circle, rgba(0,217,255,0.15) 0%, rgba(0,255,136,0.05) 50%, transparent 70%)",
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) scale(${pulse})`,
                }}
            />

            {/* Logo */}
            <div
                style={{
                    fontSize: 100,
                    transform: `scale(${titleScale})`,
                    marginBottom: 20,
                }}
            >
                ✂️
            </div>

            {/* Title */}
            <h1
                style={{
                    fontSize: 64,
                    fontWeight: 800,
                    background: "linear-gradient(90deg, #00d9ff, #00ff88)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "'Inter', sans-serif",
                    transform: `scale(${titleScale})`,
                    margin: 0,
                }}
            >
                Smart Auto-Cut
            </h1>

            {/* Subtitle */}
            <p
                style={{
                    fontSize: 28,
                    color: "#888",
                    marginTop: 16,
                    opacity: subtitleOpacity,
                    fontFamily: "'Inter', sans-serif",
                }}
            >
                編集時間を大幅カット
            </p>

            {/* CTA Button */}
            <div
                style={{
                    marginTop: 40,
                    padding: "16px 48px",
                    background: "linear-gradient(135deg, #00d9ff 0%, #00ff88 100%)",
                    borderRadius: 50,
                    opacity: ctaOpacity,
                    transform: `scale(${ctaOpacity})`,
                }}
            >
                <span
                    style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: "#0a0a1a",
                        fontFamily: "'Inter', sans-serif",
                    }}
                >
                    今すぐ試す →
                </span>
            </div>
        </AbsoluteFill>
    );
};
