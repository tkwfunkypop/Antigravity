import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

interface InfoSlideProps {
    lines: { label: string; value: string }[];
    delay?: number;
}

export const InfoSlide: React.FC<InfoSlideProps> = ({ lines, delay = 0 }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    return (
        <AbsoluteFill
            style={{
                justifyContent: "center",
                alignItems: "center",
                padding: 80,
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 40,
                    width: "100%",
                    maxWidth: 1200,
                }}
            >
                {lines.map((line, index) => {
                    const lineDelay = delay + index * 12;
                    const adjustedFrame = frame - lineDelay;

                    const slideProgress = spring({
                        frame: adjustedFrame,
                        fps,
                        config: { damping: 200 },
                    });

                    const translateX = interpolate(slideProgress, [0, 1], [-100, 0]);
                    const opacity = interpolate(adjustedFrame, [0, 10], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    });

                    // Mask reveal effect
                    const maskProgress = interpolate(adjustedFrame, [0, 15], [0, 100], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    });

                    return (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                alignItems: "baseline",
                                gap: 24,
                                transform: `translateX(${translateX}px)`,
                                opacity,
                                clipPath: `inset(0 ${100 - maskProgress}% 0 0)`,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 28,
                                    fontWeight: 500,
                                    color: "rgba(255, 255, 255, 0.6)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.15em",
                                    fontFamily: "'Noto Sans JP', sans-serif",
                                    minWidth: 140,
                                }}
                            >
                                {line.label}
                            </span>
                            <span
                                style={{
                                    fontSize: 56,
                                    fontWeight: 700,
                                    color: "#FFFFFF",
                                    fontFamily: "'Noto Sans JP', sans-serif",
                                }}
                            >
                                {line.value}
                            </span>
                        </div>
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};
