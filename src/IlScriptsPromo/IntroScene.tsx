import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

export const IntroScene: React.FC = () => {
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

    const iconsOpacity = interpolate(frame, [55, 75], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const icons = ["✏️", "🏷", "📑", "🔲", "🔤"];

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
            {/* Background glow orbs */}
            <div
                style={{
                    position: "absolute",
                    width: 700,
                    height: 700,
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(255,154,0,0.35) 0%, transparent 70%)",
                    filter: "blur(100px)",
                    left: "15%",
                    top: "10%",
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
                        "radial-gradient(circle, rgba(255,87,34,0.25) 0%, transparent 70%)",
                    filter: "blur(80px)",
                    right: "10%",
                    bottom: "15%",
                    transform: `scale(${1 + Math.cos(frame * 0.03) * 0.15})`,
                }}
            />

            {/* Floating particles */}
            {Array.from({ length: 20 }).map((_, i) => {
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
                            background: `rgba(255, 154, 0, ${0.15 + random(i * 37) * 0.25})`,
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
                    gap: 24,
                    zIndex: 10,
                }}
            >
                {/* Illustrator badge */}
                <div
                    style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#FF9A00",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "0.3em",
                        textTransform: "uppercase",
                        opacity: titleOpacity,
                        marginBottom: 8,
                    }}
                >
                    Adobe Illustrator Extensions
                </div>

                {/* Main Title */}
                <div
                    style={{
                        fontSize: 160,
                        fontWeight: 900,
                        color: "white",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "-0.03em",
                        textShadow: "0 0 80px rgba(255, 154, 0, 0.6)",
                        transform: `scale(${titleScale})`,
                        opacity: titleOpacity,
                        lineHeight: 1,
                    }}
                >
                    IlScripts
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: 36,
                        fontWeight: 400,
                        color: "#FFB74D",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        letterSpacing: "0.08em",
                        opacity: subtitleOpacity,
                        transform: `translateY(${subtitleY}px)`,
                    }}
                >
                    Illustrator Script Tools Collection
                </div>

                {/* Five script icons */}
                <div
                    style={{
                        display: "flex",
                        gap: 50,
                        marginTop: 30,
                        opacity: iconsOpacity,
                    }}
                >
                    {icons.map((icon, i) => (
                        <div
                            key={i}
                            style={{
                                fontSize: 64,
                                transform: `translateY(${Math.sin((frame + i * 15) * 0.08) * 8}px)`,
                                filter: "drop-shadow(0 4px 20px rgba(255,154,0,0.4))",
                            }}
                        >
                            {icon}
                        </div>
                    ))}
                </div>
            </div>
        </AbsoluteFill>
    );
};
