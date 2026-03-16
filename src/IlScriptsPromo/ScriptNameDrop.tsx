import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

interface ScriptNameDropProps {
    icon: string;
    title: string;
    subtitle: string;
    color: string;
}

export const ScriptNameDrop: React.FC<ScriptNameDropProps> = ({
    icon,
    title,
    subtitle,
    color,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Icon drops in from above
    const iconY = interpolate(frame, [0, 20], [-200, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const iconScale = spring({
        frame,
        fps,
        config: { damping: 8, stiffness: 120 },
    });

    // Title slides in
    const titleScale = spring({
        frame: Math.max(0, frame - 15),
        fps,
        config: { damping: 12, stiffness: 100 },
    });

    const titleOpacity = interpolate(frame, [15, 35], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Subtitle fades in
    const subtitleOpacity = interpolate(frame, [40, 60], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const subtitleY = interpolate(frame, [40, 60], [20, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
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
                    "linear-gradient(135deg, #1a0f00 0%, #2d1800 25%, #3d2000 50%, #1a0f00 100%)",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* Dynamic glow */}
            <div
                style={{
                    position: "absolute",
                    width: 700,
                    height: 700,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${color}45 0%, transparent 55%)`,
                    filter: "blur(100px)",
                    transform: `scale(${1 + Math.sin(frame * 0.08) * 0.2})`,
                }}
            />

            {/* Floating sparks */}
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        width: 3 + random(i * 17) * 4,
                        height: 3 + random(i * 17) * 4,
                        borderRadius: "50%",
                        background: `${color}${Math.round(0.3 * 255)
                            .toString(16)
                            .padStart(2, "0")}`,
                        left: `${20 + random(i * 7) * 60}%`,
                        top: `${20 + random(i * 13) * 60}%`,
                        transform: `translateY(${Math.sin(frame * 0.04 + i * 2) * 25}px)`,
                    }}
                />
            ))}

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 16,
                    zIndex: 10,
                }}
            >
                {/* Icon - drops in */}
                <div
                    style={{
                        fontSize: 140,
                        filter: `drop-shadow(0 0 50px ${color})`,
                        transform: `translateY(${iconY}px) scale(${iconScale})`,
                    }}
                >
                    {icon}
                </div>

                {/* Script Name */}
                <div
                    style={{
                        fontSize: 130,
                        fontWeight: 900,
                        color: "white",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "-0.03em",
                        textShadow: `0 0 80px ${color}90, 0 4px 30px rgba(0,0,0,0.5)`,
                        transform: `scale(${titleScale})`,
                        opacity: titleOpacity,
                        lineHeight: 1,
                    }}
                >
                    {title}
                </div>

                {/* Japanese subtitle */}
                <div
                    style={{
                        fontSize: 42,
                        fontWeight: 400,
                        color: color,
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "0.1em",
                        opacity: subtitleOpacity,
                        transform: `translateY(${subtitleY}px)`,
                    }}
                >
                    {subtitle}
                </div>
            </div>
        </AbsoluteFill>
    );
};
