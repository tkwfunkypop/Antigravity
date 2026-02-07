import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
    Easing,
} from "remotion";

export const TitleScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // 3D Circle Animation
    const circleScale = spring({
        frame,
        fps,
        config: { damping: 8, stiffness: 60 },
    });

    const circleRotate = interpolate(frame, [0, 90], [0, 360], {
        extrapolateRight: "extend",
    });

    // Title with 3D perspective entrance
    const titleProgress = spring({
        frame: frame - 20,
        fps,
        config: { damping: 12, stiffness: 80 },
    });

    const titleZ = interpolate(frame, [20, 50], [500, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
    });

    // Tagline
    const taglineOpacity = interpolate(frame, [50, 65], [0, 1], { extrapolateRight: "clamp" });
    const taglineY = interpolate(frame, [50, 65], [30, 0], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill
            style={{
                background: "radial-gradient(ellipse at center, #1a1a3e 0%, #0a0a1a 70%, #050510 100%)",
                justifyContent: "center",
                alignItems: "center",
                perspective: 1200,
            }}
        >
            {/* Animated Background Circles with Depth */}
            {[...Array(5)].map((_, i) => {
                const delay = i * 8;
                const size = 200 + i * 150;
                const opacity = interpolate(
                    frame,
                    [delay, delay + 20],
                    [0, 0.15 - i * 0.02],
                    { extrapolateRight: "clamp" }
                );
                const scale = spring({
                    frame: frame - delay,
                    fps,
                    config: { damping: 15, stiffness: 40 },
                });

                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            width: size,
                            height: size,
                            borderRadius: "50%",
                            border: `2px solid rgba(0, 217, 255, ${opacity})`,
                            transform: `scale(${scale}) rotateX(60deg) rotateZ(${circleRotate + i * 15}deg)`,
                            transformStyle: "preserve-3d",
                        }}
                    />
                );
            })}

            {/* Main Glowing Circle */}
            <div
                style={{
                    position: "absolute",
                    width: 300,
                    height: 300,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(0,217,255,0.3) 0%, transparent 70%)",
                    transform: `scale(${circleScale}) rotateZ(${circleRotate}deg)`,
                    boxShadow: "0 0 60px rgba(0, 217, 255, 0.4), 0 0 120px rgba(0, 217, 255, 0.2)",
                }}
            />

            {/* Scissors Icon with 3D effect */}
            <div
                style={{
                    fontSize: 100,
                    transform: `translateZ(${titleZ}px) scale(${circleScale})`,
                    textShadow: "0 0 40px rgba(0, 217, 255, 0.8)",
                    marginBottom: 20,
                }}
            >
                ✂️
            </div>

            {/* Title with 3D Entrance */}
            <h1
                style={{
                    fontSize: 90,
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #00d9ff 0%, #00ff88 50%, #00d9ff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                    transform: `translateZ(${titleZ}px) scale(${titleProgress})`,
                    margin: 0,
                    letterSpacing: -3,
                    textShadow: "0 0 30px rgba(0, 217, 255, 0.5)",
                }}
            >
                Smart Auto-Cut
            </h1>

            {/* Tagline */}
            <p
                style={{
                    fontSize: 32,
                    color: "rgba(255, 255, 255, 0.7)",
                    marginTop: 24,
                    opacity: taglineOpacity,
                    transform: `translateY(${taglineY}px)`,
                    fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                    fontWeight: 300,
                    letterSpacing: 4,
                }}
            >
                AI-POWERED EDITING
            </p>
        </AbsoluteFill>
    );
};
