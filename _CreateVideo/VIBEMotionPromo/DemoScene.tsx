import React from "react";
import {
    AbsoluteFill,
    Img,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    staticFile,
} from "remotion";

const screenshots = [
    {
        file: "hero.png",
        label: "トップページ",
        description: "5つのカテゴリーから選択",
    },
    {
        file: "text_animation.png",
        label: "Text Animation",
        description: "スタイルとテーマを選んでGenerate",
    },
    {
        file: "canvas.png",
        label: "キャンバス画面",
        description: "AIとチャットしながらリアルタイム編集",
    },
];

export const DemoScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Title animation
    const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: "clamp",
    });

    // Calculate which screenshot to show
    const screenshotDuration = 100; // ~3.3 seconds each
    const currentScreenshotIndex = Math.min(
        Math.floor(frame / screenshotDuration),
        screenshots.length - 1
    );

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)",
                justifyContent: "center",
                alignItems: "center",
                padding: 60,
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 30,
                    width: "100%",
                    maxWidth: 1600,
                }}
            >
                {/* Title */}
                <div
                    style={{
                        opacity: titleOpacity,
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            fontSize: 48,
                            fontWeight: 800,
                            color: "white",
                            fontFamily: "'Noto Sans JP', sans-serif",
                        }}
                    >
                        実際の画面を見てみよう
                    </div>
                </div>

                {/* Screenshot display */}
                {screenshots.map((screenshot, index) => {
                    const isActive = index === currentScreenshotIndex;
                    const enterDelay = index * screenshotDuration;

                    const screenshotOpacity = interpolate(
                        frame,
                        [enterDelay, enterDelay + 20, (index + 1) * screenshotDuration - 10, (index + 1) * screenshotDuration],
                        [0, 1, 1, 0],
                        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                    );

                    const screenshotScale = spring({
                        frame: frame - enterDelay,
                        fps,
                        config: { damping: 15, stiffness: 80 },
                    });

                    if (!isActive && Math.abs(frame - (index * screenshotDuration + screenshotDuration / 2)) > screenshotDuration / 2 + 20) {
                        return null;
                    }

                    return (
                        <div
                            key={index}
                            style={{
                                position: "absolute",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 25,
                                opacity: screenshotOpacity,
                                transform: `scale(${Math.min(screenshotScale, 1)})`,
                            }}
                        >
                            {/* Screenshot container */}
                            <div
                                style={{
                                    position: "relative",
                                    borderRadius: 16,
                                    overflow: "hidden",
                                    boxShadow: "0 30px 80px rgba(124, 58, 237, 0.4)",
                                    border: "3px solid rgba(124, 58, 237, 0.5)",
                                }}
                            >
                                <Img
                                    src={staticFile(`screenshots/${screenshot.file}`)}
                                    style={{
                                        width: 1200,
                                        height: "auto",
                                        display: "block",
                                    }}
                                />

                                {/* Overlay gradient */}
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: 150,
                                        background: "linear-gradient(transparent, rgba(15, 15, 35, 0.9))",
                                    }}
                                />
                            </div>

                            {/* Label */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 10,
                                    marginTop: -60,
                                    zIndex: 10,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 36,
                                        fontWeight: 700,
                                        color: "white",
                                        fontFamily: "'Noto Sans JP', sans-serif",
                                        textShadow: "0 2px 20px rgba(0,0,0,0.8)",
                                    }}
                                >
                                    {screenshot.label}
                                </div>
                                <div
                                    style={{
                                        fontSize: 24,
                                        color: "#a78bfa",
                                        fontFamily: "'Noto Sans JP', sans-serif",
                                        textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                                    }}
                                >
                                    {screenshot.description}
                                </div>
                            </div>

                            {/* Progress indicator */}
                            <div
                                style={{
                                    display: "flex",
                                    gap: 12,
                                    marginTop: 10,
                                }}
                            >
                                {screenshots.map((_, dotIndex) => (
                                    <div
                                        key={dotIndex}
                                        style={{
                                            width: dotIndex === currentScreenshotIndex ? 40 : 12,
                                            height: 12,
                                            borderRadius: 6,
                                            background: dotIndex === currentScreenshotIndex
                                                ? "linear-gradient(90deg, #7c3aed, #3b82f6)"
                                                : "rgba(255,255,255,0.3)",
                                            transition: "width 0.3s",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};
