import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

export const CTAScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const mainScale = spring({
        frame,
        fps,
        config: { damping: 10, stiffness: 80 },
    });

    const buttonPulse = 1 + Math.sin(frame * 0.15) * 0.03;

    const subtitleOpacity = interpolate(frame, [30, 45], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* Background glow */}
            <div
                style={{
                    position: "absolute",
                    width: 800,
                    height: 800,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(153,102,255,0.3) 0%, transparent 60%)",
                    filter: "blur(80px)",
                    transform: `scale(${1 + Math.sin(frame * 0.08) * 0.1})`,
                }}
            />

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 40,
                    transform: `scale(${mainScale})`,
                }}
            >
                {/* Main CTA text */}
                <div
                    style={{
                        fontSize: 80,
                        fontWeight: 900,
                        color: "white",
                        fontFamily: "'Noto Sans JP', sans-serif",
                        textShadow: "0 4px 30px rgba(153, 102, 255, 0.7)",
                    }}
                >
                    無料ダウンロード
                </div>

                {/* Button style element */}
                <div
                    style={{
                        background: "linear-gradient(135deg, #9966FF 0%, #7B2FBE 100%)",
                        padding: "25px 80px",
                        borderRadius: 60,
                        fontSize: 42,
                        fontWeight: 700,
                        color: "white",
                        fontFamily: "'Noto Sans JP', sans-serif",
                        transform: `scale(${buttonPulse})`,
                        boxShadow: "0 10px 40px rgba(153, 102, 255, 0.6)",
                    }}
                >
                    AE File Collector
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: 32,
                        color: "#a78bfa",
                        fontFamily: "'Noto Sans JP', sans-serif",
                        opacity: subtitleOpacity,
                    }}
                >
                    プロジェクト整理を今すぐ効率化
                </div>
            </div>
        </AbsoluteFill>
    );
};
