import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

interface BrandFlashProps {
    color: string;
}

export const BrandFlash: React.FC<BrandFlashProps> = ({ color }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Flash in
    const flashOpacity = interpolate(frame, [0, 6], [0, 1], {
        extrapolateRight: "clamp",
    });

    const logoScale = spring({
        frame,
        fps,
        config: { damping: 10, stiffness: 150 },
    });

    const subtitleOpacity = interpolate(frame, [12, 22], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Exit flash
    const exitOpacity = interpolate(frame, [35, 45], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Line wipe accent
    const lineWidth = interpolate(frame, [5, 25], [0, 400], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background:
                    "linear-gradient(135deg, #0a0500 0%, #1a0f00 50%, #0a0500 100%)",
                justifyContent: "center",
                alignItems: "center",
                opacity: exitOpacity,
            }}
        >
            {/* Radial glow pulse */}
            <div
                style={{
                    position: "absolute",
                    width: 600,
                    height: 600,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${color}50 0%, transparent 60%)`,
                    filter: "blur(100px)",
                    transform: `scale(${1 + Math.sin(frame * 0.15) * 0.3})`,
                }}
            />

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 16,
                    zIndex: 10,
                    opacity: flashOpacity,
                }}
            >
                {/* IlScripts Logo */}
                <div
                    style={{
                        fontSize: 110,
                        fontWeight: 900,
                        color: "white",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "-0.03em",
                        textShadow: `0 0 80px ${color}80, 0 0 160px ${color}40`,
                        transform: `scale(${logoScale})`,
                    }}
                >
                    IlScripts
                </div>

                {/* Accent line */}
                <div
                    style={{
                        width: lineWidth,
                        height: 3,
                        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                        borderRadius: 2,
                    }}
                />

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: 24,
                        fontWeight: 500,
                        color: "#FFB74D",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        opacity: subtitleOpacity,
                    }}
                >
                    Adobe Illustrator Extension
                </div>
            </div>
        </AbsoluteFill>
    );
};
