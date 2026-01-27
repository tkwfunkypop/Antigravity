import React from "react";
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
} from "remotion";

interface DynamicBackgroundProps {
    baseColor?: string;
    accentColor?: string;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
    baseColor = "#0a0a0a",
    accentColor = "#1e3a8a",
}) => {
    const frame = useCurrentFrame();

    // Subtle gradient shift
    const gradientAngle = interpolate(frame, [0, 300], [135, 180]);

    // Floating orbs
    const orb1Y = Math.sin(frame * 0.02) * 50;
    const orb1X = Math.cos(frame * 0.015) * 80;
    const orb2Y = Math.cos(frame * 0.018) * 60;
    const orb2X = Math.sin(frame * 0.022) * 100;

    return (
        <AbsoluteFill
            style={{
                background: `linear-gradient(${gradientAngle}deg, ${baseColor} 0%, ${accentColor} 100%)`,
                overflow: "hidden",
            }}
        >
            {/* Floating orb 1 */}
            <div
                style={{
                    position: "absolute",
                    top: `calc(30% + ${orb1Y}px)`,
                    left: `calc(20% + ${orb1X}px)`,
                    width: 400,
                    height: 400,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)`,
                    filter: "blur(60px)",
                }}
            />
            {/* Floating orb 2 */}
            <div
                style={{
                    position: "absolute",
                    top: `calc(60% + ${orb2Y}px)`,
                    right: `calc(15% + ${orb2X}px)`,
                    width: 500,
                    height: 500,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, transparent 70%)`,
                    filter: "blur(80px)",
                }}
            />
            {/* Grid overlay */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
                    backgroundSize: "60px 60px",
                }}
            />
        </AbsoluteFill>
    );
};
