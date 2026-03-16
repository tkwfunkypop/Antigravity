import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

interface TipCardProps {
    tipNumber: number;
    title: string;
    subtitle: string;
    accentColor: string;
}

/**
 * テクニック番号付きのカードコンポーネント（画面上部ヘッダー）
 * 左側に大きな番号、右側にタイトルと説明。
 * フェードイン + スライドダウンアニメーション。
 */
export const TipCard: React.FC<TipCardProps> = ({
    tipNumber,
    title,
    subtitle,
    accentColor,
}) => {
    const frame = useCurrentFrame();

    const opacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: "clamp",
    });
    const translateY = interpolate(frame, [0, 20], [-40, 0], {
        extrapolateRight: "clamp",
    });

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                opacity,
                transform: `translateY(${translateY}px)`,
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "40px 60px 28px 60px",
                background: `linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)`,
            }}
        >
            {/* 番号バッジ */}
            <div
                style={{
                    width: 80,
                    height: 80,
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: `0 6px 24px ${accentColor}44`,
                    flexShrink: 0,
                }}
            >
                <span
                    style={{
                        fontSize: 44,
                        fontWeight: 900,
                        color: "#fff",
                        fontFamily: "'Inter', sans-serif",
                    }}
                >
                    {tipNumber}
                </span>
            </div>

            {/* タイトル + サブ */}
            <div>
                <div
                    style={{
                        fontSize: 40,
                        fontWeight: 800,
                        color: "#ffffff",
                        fontFamily: "'Noto Sans JP', sans-serif",
                        textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                        lineHeight: 1.2,
                    }}
                >
                    {title}
                </div>
                <div
                    style={{
                        fontSize: 22,
                        fontWeight: 400,
                        color: "#ffffffbb",
                        fontFamily: "'Noto Sans JP', sans-serif",
                        marginTop: 6,
                    }}
                >
                    {subtitle}
                </div>
            </div>
        </div>
    );
};
