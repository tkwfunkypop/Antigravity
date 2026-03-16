import React from "react";
import {
    interpolate,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

interface TitleBarProps {
    title: string;
    accentColor: string;
}

/**
 * ニュース番組風の下部タイトルバー
 * グラデーション付きのバーがスライドインし、テキストがフェードイン。
 */
export const TitleBar: React.FC<TitleBarProps> = ({ title, accentColor }) => {
    const frame = useCurrentFrame();
    const { width } = useVideoConfig();

    // バーのスライドイン
    const barTranslateX = interpolate(frame, [0, 15], [width, 0], {
        extrapolateRight: "clamp",
    });

    // テキストのフェードイン
    const textOpacity = interpolate(frame, [10, 25], [0, 1], {
        extrapolateRight: "clamp",
    });

    return (
        <div
            style={{
                position: "absolute",
                bottom: 40,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    transform: `translateX(${barTranslateX}px)`,
                    background: `linear-gradient(135deg, ${accentColor}dd 0%, ${accentColor}66 60%, transparent 100%)`,
                    backdropFilter: "blur(12px)",
                    borderLeft: `4px solid ${accentColor}`,
                    padding: "14px 40px",
                    borderRadius: "0 8px 8px 0",
                    maxWidth: "70%",
                }}
            >
                <div
                    style={{
                        opacity: textOpacity,
                        color: "#ffffff",
                        fontSize: 32,
                        fontWeight: 700,
                        fontFamily: "'Noto Sans JP', sans-serif",
                        letterSpacing: "0.05em",
                        textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                    }}
                >
                    {title}
                </div>
            </div>
        </div>
    );
};
