import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

interface KineticTitleProps {
    text: string;
    fontSize?: number;
    color?: string;
    fontFamily?: string;
    delay?: number;
}

export const KineticTitle: React.FC<KineticTitleProps> = ({
    text,
    fontSize = 120,
    color = "#FFFFFF",
    fontFamily = "'Noto Sans JP', sans-serif",
    delay = 0,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const characters = text.split("");

    return (
        <AbsoluteFill
            style={{
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "0.05em",
                }}
            >
                {characters.map((char, index) => {
                    const charDelay = delay + index * 2;
                    const adjustedFrame = frame - charDelay;

                    const springProgress = spring({
                        frame: adjustedFrame,
                        fps,
                        config: { damping: 12, stiffness: 200, mass: 0.8 },
                    });

                    const translateY = interpolate(springProgress, [0, 1], [80, 0]);
                    const opacity = interpolate(adjustedFrame, [0, 8], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    });
                    const scale = interpolate(springProgress, [0, 1], [0.5, 1]);

                    return (
                        <span
                            key={index}
                            style={{
                                display: "inline-block",
                                fontSize,
                                fontWeight: 900,
                                color,
                                fontFamily,
                                transform: `translateY(${translateY}px) scale(${scale})`,
                                opacity,
                                textShadow:
                                    "0 4px 20px rgba(0, 0, 0, 0.5), 0 0 60px rgba(59, 130, 246, 0.5)",
                            }}
                        >
                            {char === " " ? "\u00A0" : char}
                        </span>
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};
