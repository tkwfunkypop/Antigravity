import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    interpolate,
    spring,
    useVideoConfig,
} from "remotion";

/** CTAシーン: ダウンロード促し */
export const CTAScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const iconSpring = spring({ frame, fps, config: { damping: 12 } });
    const titleSpring = spring({
        frame: frame - 8,
        fps,
        config: { damping: 14 },
    });

    // Pulsing button
    const pulse = Math.sin(frame * 0.12) * 0.04 + 1;
    const buttonOpacity = interpolate(frame, [20, 35], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Background hue rotation
    const bgHue = interpolate(frame, [0, 180], [240, 280], {
        extrapolateRight: "clamp",
    });

    // Confetti particles
    const confetti = Array.from({ length: 30 }, (_, i) => ({
        x: ((i * 157 + 100) % 1920),
        y: -20 - (i * 40),
        rotation: i * 47,
        color: `hsl(${(i * 37) % 360}, 80%, 65%)`,
        delay: 30 + i * 2,
        speed: 3 + (i % 5),
    }));

    return (
        <AbsoluteFill
            style={{
                background: `
          radial-gradient(ellipse at 50% 50%, hsla(${bgHue}, 60%, 20%, 1) 0%, transparent 60%),
          linear-gradient(180deg, #050510 0%, #0a0a2e 50%, #050515 100%)
        `,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
            }}
        >
            {/* Confetti */}
            {confetti.map((c, i) => {
                const cY = c.y + (frame - c.delay) * c.speed;
                if (frame < c.delay || cY > 1100) return null;
                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            left: c.x,
                            top: cY,
                            width: 8,
                            height: 12,
                            background: c.color,
                            borderRadius: 2,
                            transform: `rotate(${c.rotation + frame * 3}deg)`,
                            opacity: 0.7,
                        }}
                    />
                );
            })}

            {/* Icon */}
            <div
                style={{
                    transform: `scale(${iconSpring})`,
                    fontSize: 100,
                    marginBottom: 20,
                    filter: `drop-shadow(0 0 40px hsla(${bgHue}, 80%, 60%, 0.5))`,
                }}
            >
                🖼
            </div>

            {/* Title */}
            <div
                style={{
                    transform: `scale(${titleSpring})`,
                    fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                    fontSize: 64,
                    fontWeight: 900,
                    color: "#fff",
                    marginBottom: 16,
                    textShadow: `0 0 40px hsla(${bgHue}, 80%, 60%, 0.5)`,
                }}
            >
                AE Visual Browser
            </div>

            {/* Tagline */}
            <div
                style={{
                    opacity: buttonOpacity,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    fontSize: 28,
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: 40,
                }}
            >
                プロジェクトを、視覚的に。
            </div>

            {/* CTA Message */}
            <div
                style={{
                    opacity: buttonOpacity,
                    transform: `scale(${pulse})`,
                    background: `linear-gradient(135deg, hsla(${bgHue}, 70%, 55%, 1), hsla(${bgHue + 30}, 70%, 45%, 1))`,
                    padding: "24px 60px",
                    borderRadius: 20,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    fontSize: 30,
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: 2,
                    boxShadow: `0 0 40px hsla(${bgHue}, 70%, 50%, 0.4)`,
                    textAlign: "center" as const,
                }}
            >
                ❤️ いいねとリプが多ければ公開します
            </div>

            {/* Sub info */}
            <div
                style={{
                    opacity: interpolate(frame, [40, 55], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    }),
                    fontFamily: "'Noto Sans JP', sans-serif",
                    fontSize: 22,
                    color: "rgba(255,255,255,0.5)",
                    marginTop: 30,
                    letterSpacing: 2,
                }}
            >
                欲しい人は 👍 いいね & 💬 リプ で教えてください！
            </div>
        </AbsoluteFill>
    );
};
