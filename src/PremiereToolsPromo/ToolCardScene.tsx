import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    Img,
    staticFile,
} from "remotion";

interface ToolCardSceneProps {
    icon: string;
    title: string;
    subtitle: string;
    features: string[];
    color: string;
    screenshotPath?: string;
}

export const ToolCardScene: React.FC<ToolCardSceneProps> = ({
    icon,
    title,
    subtitle,
    features,
    color,
    screenshotPath,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const mainScale = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 100 },
    });

    const cardOpacity = interpolate(frame, [0, 15], [0, 1], {
        extrapolateRight: "clamp",
    });

    const screenshotOpacity = interpolate(frame, [40, 60], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const screenshotScale = spring({
        frame: frame - 40,
        fps,
        config: { damping: 15, stiffness: 80 },
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #0f0a1a 0%, #0a0a15 50%, #0a1020 100%)",
                justifyContent: "center",
                alignItems: "center",
                padding: 80,
            }}
        >
            {/* Background glow */}
            <div
                style={{
                    position: "absolute",
                    width: 800,
                    height: 800,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${color}40 0%, transparent 60%)`,
                    filter: "blur(120px)",
                    opacity: 0.6,
                }}
            />

            <div
                style={{
                    display: "flex",
                    gap: 80,
                    alignItems: "center",
                    transform: `scale(${mainScale})`,
                    opacity: cardOpacity,
                }}
            >
                {/* Left: Info Card */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 30,
                        maxWidth: 600,
                    }}
                >
                    {/* Icon and Title */}
                    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                        <div
                            style={{
                                fontSize: 100,
                                filter: `drop-shadow(0 0 30px ${color})`,
                            }}
                        >
                            {icon}
                        </div>
                        <div>
                            <div
                                style={{
                                    fontSize: 72,
                                    fontWeight: 800,
                                    color: "white",
                                    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                                }}
                            >
                                {title}
                            </div>
                            <div
                                style={{
                                    fontSize: 28,
                                    color: color,
                                    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                                    marginTop: 8,
                                }}
                            >
                                {subtitle}
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
                        {features.map((feature, i) => {
                            const featureOpacity = interpolate(
                                frame,
                                [20 + i * 10, 35 + i * 10],
                                [0, 1],
                                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                            );
                            const featureX = interpolate(
                                frame,
                                [20 + i * 10, 35 + i * 10],
                                [-30, 0],
                                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                            );

                            return (
                                <div
                                    key={i}
                                    style={{
                                        fontSize: 32,
                                        color: "rgba(255,255,255,0.9)",
                                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 16,
                                        opacity: featureOpacity,
                                        transform: `translateX(${featureX}px)`,
                                    }}
                                >
                                    <span style={{ color }}>✓</span>
                                    {feature}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Screenshot placeholder */}
                <div
                    style={{
                        width: 700,
                        height: 500,
                        borderRadius: 20,
                        background: `linear-gradient(145deg, ${color}20 0%, rgba(0,0,0,0.5) 100%)`,
                        border: `2px solid ${color}40`,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        opacity: screenshotOpacity,
                        transform: `scale(${Math.max(0.8, screenshotScale)})`,
                        boxShadow: `0 20px 60px ${color}30`,
                        overflow: "hidden",
                    }}
                >
                    {screenshotPath ? (
                        <Img
                            src={staticFile(screenshotPath)}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                fontSize: 48,
                                color: `${color}80`,
                                fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                            }}
                        >
                            Demo Preview
                        </div>
                    )}
                </div>
            </div>
        </AbsoluteFill>
    );
};
