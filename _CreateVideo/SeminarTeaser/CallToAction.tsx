import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

interface CallToActionProps {
    text: string;
    subtext?: string;
    delay?: number;
}

export const CallToAction: React.FC<CallToActionProps> = ({
    text,
    subtext,
    delay = 0,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const adjustedFrame = frame - delay;

    const scaleSpring = spring({
        frame: adjustedFrame,
        fps,
        config: { damping: 10, stiffness: 150, mass: 0.8 },
    });

    const scale = interpolate(scaleSpring, [0, 1], [0.3, 1]);
    const opacity = interpolate(adjustedFrame, [0, 10], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Pulsing glow effect
    const pulseIntensity = Math.sin(adjustedFrame * 0.15) * 0.3 + 0.7;
    const glowSize = 30 + Math.sin(adjustedFrame * 0.1) * 15;

    return (
        <AbsoluteFill
            style={{
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 24,
                    transform: `scale(${scale})`,
                    opacity,
                }}
            >
                <div
                    style={{
                        padding: "32px 80px",
                        background: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)`,
                        borderRadius: 16,
                        boxShadow: `
              0 0 ${glowSize}px rgba(99, 102, 241, ${pulseIntensity}),
              0 20px 60px rgba(0, 0, 0, 0.4)
            `,
                    }}
                >
                    <span
                        style={{
                            fontSize: 64,
                            fontWeight: 900,
                            color: "#FFFFFF",
                            fontFamily: "'Noto Sans JP', sans-serif",
                            letterSpacing: "0.05em",
                        }}
                    >
                        {text}
                    </span>
                </div>
                {subtext && (
                    <span
                        style={{
                            fontSize: 28,
                            fontWeight: 500,
                            color: "rgba(255, 255, 255, 0.7)",
                            fontFamily: "'Noto Sans JP', sans-serif",
                        }}
                    >
                        {subtext}
                    </span>
                )}
            </div>
        </AbsoluteFill>
    );
};
