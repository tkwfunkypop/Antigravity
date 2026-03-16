import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

interface ScriptCardSceneProps {
    icon: string;
    title: string;
    subtitle: string;
    features: string[];
    color: string;
}

export const ScriptCardScene: React.FC<ScriptCardSceneProps> = ({
    icon,
    title,
    subtitle,
    features,
    color,
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

    // Right panel mock UI animation
    const mockOpacity = interpolate(frame, [35, 55], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const mockScale = spring({
        frame: Math.max(0, frame - 35),
        fps,
        config: { damping: 15, stiffness: 80 },
    });

    // Deterministic random
    const random = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    return (
        <AbsoluteFill
            style={{
                background:
                    "linear-gradient(135deg, #0f0a1a 0%, #0a0a15 50%, #0a1020 100%)",
                justifyContent: "center",
                alignItems: "center",
                padding: 100,
            }}
        >
            {/* Background glow */}
            <div
                style={{
                    position: "absolute",
                    width: 900,
                    height: 900,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${color}30 0%, transparent 60%)`,
                    filter: "blur(120px)",
                    opacity: 0.7,
                }}
            />

            {/* Subtle particles */}
            {Array.from({ length: 12 }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        width: 3 + random(i * 11) * 3,
                        height: 3 + random(i * 11) * 3,
                        borderRadius: "50%",
                        background: `${color}30`,
                        left: `${random(i * 7 + 1) * 100}%`,
                        top: `${random(i * 13 + 3) * 100}%`,
                        transform: `translateY(${Math.sin(frame * 0.03 + i * 2) * 15}px)`,
                    }}
                />
            ))}

            <div
                style={{
                    display: "flex",
                    gap: 80,
                    alignItems: "center",
                    transform: `scale(${mainScale})`,
                    opacity: cardOpacity,
                    zIndex: 10,
                }}
            >
                {/* Left: Info Card */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 28,
                        maxWidth: 650,
                    }}
                >
                    {/* Icon and Title */}
                    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                        <div
                            style={{
                                fontSize: 90,
                                filter: `drop-shadow(0 0 30px ${color})`,
                            }}
                        >
                            {icon}
                        </div>
                        <div>
                            <div
                                style={{
                                    fontSize: 68,
                                    fontWeight: 800,
                                    color: "white",
                                    fontFamily:
                                        "'SF Pro Display', -apple-system, sans-serif",
                                    letterSpacing: "-0.01em",
                                }}
                            >
                                {title}
                            </div>
                            <div
                                style={{
                                    fontSize: 26,
                                    color,
                                    fontFamily:
                                        "'SF Pro Display', -apple-system, sans-serif",
                                    marginTop: 6,
                                    fontWeight: 500,
                                }}
                            >
                                {subtitle}
                            </div>
                        </div>
                    </div>

                    {/* Feature list */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 18,
                            marginTop: 10,
                        }}
                    >
                        {features.map((feature, i) => {
                            const featureOpacity = interpolate(
                                frame,
                                [18 + i * 12, 33 + i * 12],
                                [0, 1],
                                {
                                    extrapolateLeft: "clamp",
                                    extrapolateRight: "clamp",
                                }
                            );
                            const featureX = interpolate(
                                frame,
                                [18 + i * 12, 33 + i * 12],
                                [-40, 0],
                                {
                                    extrapolateLeft: "clamp",
                                    extrapolateRight: "clamp",
                                }
                            );

                            return (
                                <div
                                    key={i}
                                    style={{
                                        fontSize: 30,
                                        color: "rgba(255,255,255,0.9)",
                                        fontFamily:
                                            "'SF Pro Display', -apple-system, sans-serif",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 14,
                                        opacity: featureOpacity,
                                        transform: `translateX(${featureX}px)`,
                                    }}
                                >
                                    <span
                                        style={{
                                            color,
                                            fontSize: 24,
                                            fontWeight: 700,
                                        }}
                                    >
                                        ✓
                                    </span>
                                    {feature}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Mock UI Panel */}
                <div
                    style={{
                        width: 620,
                        height: 440,
                        borderRadius: 16,
                        background:
                            "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.4) 100%)",
                        border: `1.5px solid ${color}40`,
                        display: "flex",
                        flexDirection: "column",
                        opacity: mockOpacity,
                        transform: `scale(${Math.max(0.85, mockScale)})`,
                        boxShadow: `0 20px 60px ${color}25, inset 0 1px 0 rgba(255,255,255,0.05)`,
                        overflow: "hidden",
                    }}
                >
                    {/* Mock title bar */}
                    <div
                        style={{
                            height: 38,
                            background: "rgba(255,255,255,0.04)",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                            display: "flex",
                            alignItems: "center",
                            padding: "0 14px",
                            gap: 8,
                        }}
                    >
                        <div
                            style={{
                                width: 11,
                                height: 11,
                                borderRadius: "50%",
                                background: "#FF5F57",
                            }}
                        />
                        <div
                            style={{
                                width: 11,
                                height: 11,
                                borderRadius: "50%",
                                background: "#FFBD2E",
                            }}
                        />
                        <div
                            style={{
                                width: 11,
                                height: 11,
                                borderRadius: "50%",
                                background: "#28CA42",
                            }}
                        />
                        <div
                            style={{
                                flex: 1,
                                textAlign: "center",
                                fontSize: 12,
                                color: "rgba(255,255,255,0.4)",
                                fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                            }}
                        >
                            {title}
                        </div>
                    </div>

                    {/* Mock content area */}
                    <div
                        style={{
                            flex: 1,
                            padding: 20,
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                        }}
                    >
                        {/* Mock UI rows */}
                        {Array.from({ length: 6 }).map((_, i) => {
                            const rowDelay = 45 + i * 8;
                            const rowOpacity = interpolate(
                                frame,
                                [rowDelay, rowDelay + 12],
                                [0, 1],
                                {
                                    extrapolateLeft: "clamp",
                                    extrapolateRight: "clamp",
                                }
                            );

                            return (
                                <div
                                    key={i}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        opacity: rowOpacity,
                                        padding: "8px 12px",
                                        background: "rgba(255,255,255,0.03)",
                                        borderRadius: 6,
                                        border: "1px solid rgba(255,255,255,0.05)",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 16,
                                            height: 16,
                                            borderRadius: 3,
                                            background: `${color}60`,
                                        }}
                                    />
                                    <div
                                        style={{
                                            height: 10,
                                            borderRadius: 5,
                                            background: "rgba(255,255,255,0.12)",
                                            width: `${40 + random(i * 23) * 50}%`,
                                        }}
                                    />
                                </div>
                            );
                        })}

                        {/* Mock action button */}
                        <div
                            style={{
                                marginTop: "auto",
                                padding: "10px 20px",
                                background: `${color}`,
                                borderRadius: 6,
                                textAlign: "center",
                                fontSize: 14,
                                fontWeight: 600,
                                color: "white",
                                fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                                opacity: interpolate(
                                    frame,
                                    [90, 105],
                                    [0, 1],
                                    {
                                        extrapolateLeft: "clamp",
                                        extrapolateRight: "clamp",
                                    }
                                ),
                                boxShadow: `0 4px 15px ${color}40`,
                            }}
                        >
                            OK
                        </div>
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
