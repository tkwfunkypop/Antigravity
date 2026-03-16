import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
    Easing,
} from "remotion";

export const TitleScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Background gradient animation
    const bgHue = interpolate(frame, [0, 150], [220, 260], {
        extrapolateRight: "clamp",
    });

    // Logo icon spring
    const iconScale = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 100 },
    });

    // Title text spring (delayed)
    const titleSpring = spring({
        frame: frame - 10,
        fps,
        config: { damping: 14, stiffness: 80 },
    });

    // Subtitle fade
    const subtitleOpacity = interpolate(frame, [25, 45], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const subtitleY = interpolate(frame, [25, 45], [20, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Particle system (decorative)
    const particles = Array.from({ length: 20 }, (_, i) => ({
        x: ((i * 137) % 1920),
        y: ((i * 97 + 200) % 1080),
        size: 2 + (i % 4) * 2,
        delay: i * 3,
        speed: 0.5 + (i % 3) * 0.3,
    }));

    // Glow pulse
    const glowIntensity = interpolate(
        frame,
        [0, 30, 60, 90, 120, 150],
        [0, 0.6, 0.4, 0.7, 0.5, 0.6]
    );

    return (
        <AbsoluteFill
            style={{
                background: `
          radial-gradient(ellipse at 50% 40%, hsla(${bgHue}, 80%, 25%, 1) 0%, transparent 60%),
          radial-gradient(ellipse at 20% 80%, hsla(${bgHue + 40}, 70%, 15%, 0.8) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, hsla(${bgHue - 20}, 60%, 20%, 0.6) 0%, transparent 50%),
          linear-gradient(180deg, #050510 0%, #0a0a2e 50%, #050515 100%)
        `,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
            }}
        >
            {/* Floating particles */}
            {particles.map((p, i) => {
                const particleOpacity = interpolate(
                    frame - p.delay,
                    [0, 20, 80, 100],
                    [0, 0.4, 0.4, 0],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );
                const particleY = p.y - frame * p.speed;
                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            left: p.x,
                            top: ((particleY % 1080) + 1080) % 1080,
                            width: p.size,
                            height: p.size,
                            borderRadius: "50%",
                            background: `hsla(${bgHue + i * 15}, 80%, 70%, ${particleOpacity})`,
                            filter: `blur(${p.size > 4 ? 2 : 0}px)`,
                        }}
                    />
                );
            })}

            {/* Central glow */}
            <div
                style={{
                    position: "absolute",
                    width: 600,
                    height: 600,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, hsla(${bgHue}, 80%, 50%, ${glowIntensity * 0.15}) 0%, transparent 70%)`,
                    filter: "blur(60px)",
                }}
            />

            {/* Icon */}
            <div
                style={{
                    transform: `scale(${iconScale})`,
                    fontSize: 120,
                    marginBottom: 20,
                    filter: `drop-shadow(0 0 30px hsla(${bgHue}, 80%, 60%, 0.6))`,
                }}
            >
                🖼
            </div>

            {/* Title */}
            <div
                style={{
                    transform: `scale(${titleSpring})`,
                    fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                    fontSize: 80,
                    fontWeight: 900,
                    color: "#ffffff",
                    letterSpacing: 4,
                    textShadow: `
            0 0 40px hsla(${bgHue}, 80%, 60%, 0.6),
            0 0 80px hsla(${bgHue}, 70%, 50%, 0.3)
          `,
                }}
            >
                AE Visual Browser
            </div>

            {/* Subtitle */}
            <div
                style={{
                    opacity: subtitleOpacity,
                    transform: `translateY(${subtitleY}px)`,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    fontSize: 32,
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.7)",
                    marginTop: 20,
                    letterSpacing: 6,
                }}
            >
                After Effects プロジェクトを視覚的にブラウズ
            </div>

            {/* Version badge */}
            <div
                style={{
                    opacity: subtitleOpacity,
                    marginTop: 30,
                    padding: "8px 28px",
                    borderRadius: 30,
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.06)",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 18,
                    color: "rgba(255,255,255,0.5)",
                    letterSpacing: 2,
                }}
            >
                FREE EXTENSION v1.0
            </div>
        </AbsoluteFill>
    );
};
