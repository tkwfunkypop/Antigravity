import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
} from "remotion";

const FEATURES = [
    {
        icon: "📂",
        title: "ドラッグ&ドロップ",
        desc: ".aep / .prproj を\nドロップするだけで読み込み",
        color: "#ff8c00",
    },
    {
        icon: "🔄",
        title: "バッチレンダリング",
        desc: "複数ファイルを\nキューに追加して一括処理",
        color: "#ffd700",
    },
    {
        icon: "📊",
        title: "リアルタイム進捗",
        desc: "フレーム数・経過時間\n残り時間をリアルタイム表示",
        color: "#ff6347",
    },
    {
        icon: "🔔",
        title: "LINE完了通知",
        desc: "レンダリング完了を\nLINEで即座にお知らせ",
        color: "#06d6a0",
    },
    {
        icon: "☁️",
        title: "クラウド自動UP",
        desc: "Google Drive / Dropbox\nギガファイル便に自動送信",
        color: "#4ea8de",
    },
];

export const FeatureScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const headerScale = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 80 },
    });
    const headerOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill
            style={{
                background: "radial-gradient(ellipse at 50% 50%, #1a1000 0%, #0d0800 50%, #050300 100%)",
                perspective: 1200,
                overflow: "hidden",
            }}
        >
            {/* Animated Grid */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `
                        linear-gradient(rgba(255, 165, 0, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 165, 0, 0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: "80px 80px",
                    transform: `perspective(500px) rotateX(60deg) translateY(${frame * 1.5}px)`,
                    transformOrigin: "center top",
                }}
            />

            {/* Content */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {/* Header */}
                <h2
                    style={{
                        fontSize: 56,
                        fontWeight: 800,
                        background: "linear-gradient(90deg, #ff8c00, #ffd700)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                        marginBottom: 60,
                        opacity: headerOpacity,
                        transform: `scale(${headerScale})`,
                    }}
                >
                    豊富な機能
                </h2>

                {/* Feature Cards - Top row 3, bottom row 2 */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 30,
                        alignItems: "center",
                    }}
                >
                    {/* Row 1: first 3 features */}
                    <div style={{ display: "flex", gap: 30 }}>
                        {FEATURES.slice(0, 3).map((feature, index) => {
                            const delay = 15 + index * 15;
                            const cardProgress = spring({
                                frame: frame - delay,
                                fps,
                                config: { damping: 10, stiffness: 60 },
                            });
                            const cardOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
                                extrapolateRight: "clamp",
                            });

                            return (
                                <div
                                    key={index}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 14,
                                        padding: "30px 28px",
                                        background: `linear-gradient(180deg, ${feature.color}15 0%, ${feature.color}05 100%)`,
                                        borderRadius: 20,
                                        border: `1px solid ${feature.color}35`,
                                        transform: `scale(${cardProgress})`,
                                        opacity: cardOpacity,
                                        boxShadow: `0 15px 50px rgba(0, 0, 0, 0.4), 0 0 15px ${feature.color}10`,
                                        minWidth: 220,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 48,
                                            filter: `drop-shadow(0 0 12px ${feature.color})`,
                                        }}
                                    >
                                        {feature.icon}
                                    </div>
                                    <span
                                        style={{
                                            fontSize: 22,
                                            fontWeight: 700,
                                            color: feature.color,
                                            fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                                        }}
                                    >
                                        {feature.title}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 14,
                                            color: "rgba(255, 255, 255, 0.55)",
                                            fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                                            lineHeight: 1.5,
                                            whiteSpace: "pre-line",
                                            textAlign: "center",
                                        }}
                                    >
                                        {feature.desc}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Row 2: last 2 features */}
                    <div style={{ display: "flex", gap: 30 }}>
                        {FEATURES.slice(3).map((feature, index) => {
                            const delay = 60 + index * 15;
                            const cardProgress = spring({
                                frame: frame - delay,
                                fps,
                                config: { damping: 10, stiffness: 60 },
                            });
                            const cardOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
                                extrapolateRight: "clamp",
                            });

                            return (
                                <div
                                    key={index + 3}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 14,
                                        padding: "30px 28px",
                                        background: `linear-gradient(180deg, ${feature.color}15 0%, ${feature.color}05 100%)`,
                                        borderRadius: 20,
                                        border: `1px solid ${feature.color}35`,
                                        transform: `scale(${cardProgress})`,
                                        opacity: cardOpacity,
                                        boxShadow: `0 15px 50px rgba(0, 0, 0, 0.4), 0 0 15px ${feature.color}10`,
                                        minWidth: 280,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 48,
                                            filter: `drop-shadow(0 0 12px ${feature.color})`,
                                        }}
                                    >
                                        {feature.icon}
                                    </div>
                                    <span
                                        style={{
                                            fontSize: 22,
                                            fontWeight: 700,
                                            color: feature.color,
                                            fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                                        }}
                                    >
                                        {feature.title}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 14,
                                            color: "rgba(255, 255, 255, 0.55)",
                                            fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                                            lineHeight: 1.5,
                                            whiteSpace: "pre-line",
                                            textAlign: "center",
                                        }}
                                    >
                                        {feature.desc}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
