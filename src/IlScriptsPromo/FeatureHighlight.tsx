import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

interface FeatureHighlightProps {
    feature: string;
    featureIndex: number;
    color: string;
    icon: string;
}

const CHECK_ICONS = ["✓", "⚡", "★"];
const LAYOUTS: Array<"left" | "center" | "right"> = ["left", "center", "right"];

export const FeatureHighlight: React.FC<FeatureHighlightProps> = ({
    feature,
    featureIndex,
    color,
    icon,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const layout = LAYOUTS[featureIndex % LAYOUTS.length];
    const checkIcon = CHECK_ICONS[featureIndex % CHECK_ICONS.length];

    // Number badge entrance
    const badgeScale = spring({
        frame,
        fps,
        config: { damping: 8, stiffness: 140 },
    });

    // Text entrance - extended timing
    const textOpacity = interpolate(frame, [10, 40], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const textX = interpolate(
        frame,
        [10, 40],
        [layout === "right" ? 60 : layout === "left" ? -60 : 0, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    const textY = interpolate(
        frame,
        [10, 40],
        [layout === "center" ? 30 : 0, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    // Accent bar - extended
    const barWidth = interpolate(frame, [20, 60], [0, 200], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Script icon float
    const iconOpacity = interpolate(frame, [30, 50], [0, 0.15], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const alignItems =
        layout === "left"
            ? "flex-start"
            : layout === "right"
                ? "flex-end"
                : "center";

    const paddingLeft = layout === "left" ? 200 : 0;
    const paddingRight = layout === "right" ? 200 : 0;

    return (
        <AbsoluteFill
            style={{
                background:
                    "linear-gradient(135deg, #0f0a1a 0%, #0a0a15 50%, #0a1020 100%)",
                justifyContent: "center",
                alignItems,
                paddingLeft,
                paddingRight,
            }}
        >
            {/* Background glow - shifts based on layout */}
            <div
                style={{
                    position: "absolute",
                    width: 500,
                    height: 500,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${color}30 0%, transparent 60%)`,
                    filter: "blur(100px)",
                    left: layout === "left" ? "10%" : layout === "right" ? "60%" : "35%",
                    top: "20%",
                }}
            />

            {/* Watermark script icon */}
            <div
                style={{
                    position: "absolute",
                    fontSize: 300,
                    opacity: iconOpacity,
                    right: layout === "left" ? "10%" : undefined,
                    left: layout === "right" ? "10%" : layout === "center" ? "60%" : undefined,
                    top: "15%",
                    filter: "blur(2px)",
                }}
            >
                {icon}
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems,
                    gap: 20,
                    zIndex: 10,
                    maxWidth: 900,
                }}
            >
                {/* Number badge */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        transform: `scale(${badgeScale})`,
                    }}
                >
                    <div
                        style={{
                            width: 52,
                            height: 52,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${color}, ${color}AA)`,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: 26,
                            fontWeight: 800,
                            color: "white",
                            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                            boxShadow: `0 4px 20px ${color}60`,
                        }}
                    >
                        {featureIndex + 1}
                    </div>
                    <span
                        style={{
                            fontSize: 28,
                            color,
                            fontWeight: 700,
                        }}
                    >
                        {checkIcon}
                    </span>
                </div>

                {/* Feature text */}
                <div
                    style={{
                        fontSize: 52,
                        fontWeight: 700,
                        color: "white",
                        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        lineHeight: 1.3,
                        opacity: textOpacity,
                        transform: `translateX(${textX}px) translateY(${textY}px)`,
                        textShadow: "0 2px 20px rgba(0,0,0,0.4)",
                        textAlign: layout === "center" ? "center" : layout,
                    }}
                >
                    {feature}
                </div>

                {/* Accent bar */}
                <div
                    style={{
                        width: barWidth,
                        height: 3,
                        background: `linear-gradient(90deg, ${color}, transparent)`,
                        borderRadius: 2,
                    }}
                />
            </div>
        </AbsoluteFill>
    );
};
