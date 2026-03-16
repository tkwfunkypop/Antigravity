import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

interface SingleScriptIntroProps {
    icon: string;
    title: string;
    subtitle: string;
    color: string;
}

export const SingleScriptIntro: React.FC<SingleScriptIntroProps> = ({
    icon,
    title,
    subtitle,
    color,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleScale = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 100 },
    });

    const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: "clamp",
    });

    const subtitleOpacity = interpolate(frame, [25, 45], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const subtitleY = interpolate(frame, [25, 45], [30, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const badgeOpacity = interpolate(frame, [50, 65], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Deterministic random helper
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
            {/* Background glow with script color */}
            <div
                style={{
                    position: "absolute",
                    width: 800,
                    height: 800,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${color}40 0%, transparent 60%)`,
                    filter: "blur(120px)",
                    transform: `scale(${1 + Math.sin(frame * 0.04) * 0.2})`,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    width: 500,
                    height: 500,
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(255,154,0,0.2) 0%, transparent 70%)",
                    filter: "blur(80px)",
                    right: "15%",
                    bottom: "20%",
                    transform: `scale(${1 + Math.cos(frame * 0.03) * 0.15})`,
                }}
            />

            {/* Floating particles */}
            {Array.from({ length: 15 }).map((_, i) => {
                const x = random(i * 7 + 1) * 100;
                const y = random(i * 13 + 3) * 100;
                const size = 2 + random(i * 19 + 5) * 4;
                const speed = 0.5 + random(i * 31 + 7) * 1.5;

                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            width: size,
                            height: size,
                            borderRadius: "50%",
                            background: `${color}${Math.round(
                                (0.15 + random(i * 37) * 0.25) * 255
                            )
                                .toString(16)
                                .padStart(2, "0")}`,
                            left: `${x}%`,
                            top: `${y}%`,
                            transform: `translateY(${Math.sin(frame * 0.02 * speed + i) * 20}px)`,
                        }}
                    />
                );
            })}

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 20,
                    zIndex: 10,
                }}
            >
                {/* IlScripts badge */}
                <div
                    style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#FF9A00",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "0.3em",
                        textTransform: "uppercase",
                        opacity: badgeOpacity,
                    }}
                >
                    IlScripts — Adobe Illustrator Extension
                </div>

                {/* Icon */}
                <div
                    style={{
                        fontSize: 120,
                        filter: `drop-shadow(0 0 40px ${color})`,
                        transform: `scale(${titleScale})`,
                        opacity: titleOpacity,
                    }}
                >
                    {icon}
                </div>

                {/* Main Title */}
                <div
                    style={{
                        fontSize: 120,
                        fontWeight: 900,
                        color: "white",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "-0.03em",
                        textShadow: `0 0 80px ${color}99`,
                        transform: `scale(${titleScale})`,
                        opacity: titleOpacity,
                        lineHeight: 1,
                    }}
                >
                    {title}
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: 40,
                        fontWeight: 400,
                        color: "#FFB74D",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "0.08em",
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
