import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

interface SingleScriptCTAProps {
    icon: string;
    title: string;
    color: string;
}

export const SingleScriptCTA: React.FC<SingleScriptCTAProps> = ({
    icon,
    title,
    color,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleScale = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 100 },
    });

    const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
        extrapolateRight: "clamp",
    });

    const ctaOpacity = interpolate(frame, [25, 40], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const ctaScale = spring({
        frame: Math.max(0, frame - 25),
        fps,
        config: { damping: 10, stiffness: 120 },
    });

    const pulse = 1 + Math.sin(frame * 0.12) * 0.03;

    return (
        <AbsoluteFill
            style={{
                background:
                    "linear-gradient(135deg, #1a0f00 0%, #2d1800 30%, #1e0f00 70%, #0a0500 100%)",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* Radiating glow */}
            <div
                style={{
                    position: "absolute",
                    width: 900,
                    height: 900,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${color}30 0%, transparent 55%)`,
                    filter: "blur(60px)",
                    transform: `scale(${1 + Math.sin(frame * 0.05) * 0.15})`,
                }}
            />

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 24,
                    zIndex: 10,
                }}
            >
                {/* Icon */}
                <div
                    style={{
                        fontSize: 80,
                        opacity: titleOpacity,
                        transform: `scale(${titleScale})`,
                        filter: `drop-shadow(0 4px 20px ${color})`,
                    }}
                >
                    {icon}
                </div>

                {/* Title */}
                <div
                    style={{
                        fontSize: 80,
                        fontWeight: 900,
                        color: "white",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "-0.02em",
                        textShadow: `0 0 60px ${color}80`,
                        transform: `scale(${titleScale})`,
                        opacity: titleOpacity,
                    }}
                >
                    {title}
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: 28,
                        fontWeight: 400,
                        color: "#FFB74D",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "0.05em",
                        opacity: ctaOpacity,
                    }}
                >
                    IlScripts — Free Download
                </div>

                {/* CTA Button */}
                <div
                    style={{
                        marginTop: 16,
                        padding: "16px 50px",
                        background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
                        borderRadius: 50,
                        fontSize: 26,
                        fontWeight: 700,
                        color: "white",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "0.05em",
                        opacity: ctaOpacity,
                        transform: `scale(${Math.max(0.8, ctaScale) * pulse})`,
                        boxShadow: `0 8px 40px ${color}60, 0 0 80px ${color}30`,
                    }}
                >
                    ↓ Download Now
                </div>
            </div>
        </AbsoluteFill>
    );
};
