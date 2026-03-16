import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

interface FeatureDetailSceneProps {
    featureIndex: number;
}

const FEATURES = [
    {
        icon: "🔊",
        title: "Whisper AI 音声認識",
        description: "動画内の音声を高精度で\n自動文字起こし",
        color: "#00c8ff",
    },
    {
        icon: "✂️",
        title: "無音検出 × 自動カット",
        description: "無音区間を検出して\n自動でカット編集",
        color: "#64ffda",
    },
    {
        icon: "🎯",
        title: "ワンクリックで完了",
        description: "面倒な手動編集は一切不要\nボタン1つで完成",
        color: "#bb86fc",
    },
];

export const FeatureDetailScene: React.FC<FeatureDetailSceneProps> = ({
    featureIndex,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const feat = FEATURES[featureIndex];

    const iconScale = spring({
        frame,
        fps,
        config: { damping: 8, stiffness: 140 },
    });

    const titleOpacity = interpolate(frame, [10, 30], [0, 1], {
        extrapolateRight: "clamp",
    });
    const titleX = interpolate(frame, [10, 30], [60, 0], {
        extrapolateRight: "clamp",
    });

    const descOpacity = interpolate(frame, [25, 45], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Accent bar
    const barWidth = interpolate(frame, [20, 50], [0, 300], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background:
                    "linear-gradient(135deg, #0a0a1a 0%, #0d1025 50%, #0a0a1a 100%)",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* Background glow */}
            <div
                style={{
                    position: "absolute",
                    width: 600,
                    height: 600,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${feat.color}30 0%, transparent 60%)`,
                    filter: "blur(120px)",
                    transform: `scale(${1 + Math.sin(frame * 0.1) * 0.2})`,
                }}
            />

            {/* Large watermark icon */}
            <div
                style={{
                    position: "absolute",
                    fontSize: 350,
                    opacity: 0.06,
                    right: "8%",
                    top: "10%",
                    filter: "blur(3px)",
                }}
            >
                {feat.icon}
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 30,
                    zIndex: 10,
                }}
            >
                {/* Feature number badge */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                    }}
                >
                    <div
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${feat.color}, ${feat.color}AA)`,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: 28,
                            fontWeight: 900,
                            color: "white",
                            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                            boxShadow: `0 4px 20px ${feat.color}60`,
                            transform: `scale(${iconScale})`,
                        }}
                    >
                        {featureIndex + 1}
                    </div>
                </div>

                {/* Icon */}
                <div
                    style={{
                        fontSize: 90,
                        transform: `scale(${iconScale})`,
                        filter: `drop-shadow(0 4px 30px ${feat.color})`,
                    }}
                >
                    {feat.icon}
                </div>

                {/* Title */}
                <div
                    style={{
                        fontSize: 60,
                        fontWeight: 800,
                        color: "white",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        textShadow: `0 0 40px ${feat.color}50`,
                        opacity: titleOpacity,
                        transform: `translateX(${titleX}px)`,
                    }}
                >
                    {feat.title}
                </div>

                {/* Accent bar */}
                <div
                    style={{
                        width: barWidth,
                        height: 3,
                        background: `linear-gradient(90deg, ${feat.color}, transparent)`,
                        borderRadius: 2,
                    }}
                />

                {/* Description */}
                <div
                    style={{
                        fontSize: 32,
                        fontWeight: 400,
                        color: "rgba(255,255,255,0.8)",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        lineHeight: 1.6,
                        textAlign: "center",
                        opacity: descOpacity,
                        whiteSpace: "pre-line",
                    }}
                >
                    {feat.description}
                </div>
            </div>
        </AbsoluteFill>
    );
};
