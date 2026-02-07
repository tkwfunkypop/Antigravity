import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

// UIパネルの設定項目
const uiSettings = [
    { label: "Collect Footage", checked: true, delay: 30 },
    { label: "Organize by Type", checked: true, delay: 45 },
    { label: "Backup Project", checked: true, delay: 60 },
    { label: "Generate Report", checked: true, delay: 75 },
];

export const DemoScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // パネル全体のアニメーション
    const panelScale = spring({
        frame,
        fps,
        config: { damping: 15, stiffness: 80 },
    });

    const panelOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // ボタンのパルスアニメーション
    const buttonPulse = frame > 120 ? 1 + Math.sin((frame - 120) * 0.2) * 0.05 : 1;
    const buttonGlow = frame > 120 ? 0.8 + Math.sin((frame - 120) * 0.15) * 0.2 : 0.5;

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* 背景のグロー効果 */}
            <div
                style={{
                    position: "absolute",
                    width: 500,
                    height: 500,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(153,102,255,0.2) 0%, transparent 70%)",
                    filter: "blur(60px)",
                }}
            />

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 40,
                }}
            >
                {/* タイトル */}
                <div
                    style={{
                        fontSize: 48,
                        fontWeight: 700,
                        color: "#a78bfa",
                        fontFamily: "'Noto Sans JP', sans-serif",
                        opacity: panelOpacity,
                    }}
                >
                    シンプルなUIパネル
                </div>

                {/* UIパネル */}
                <div
                    style={{
                        background: "linear-gradient(180deg, #2a2a3e 0%, #1e1e2e 100%)",
                        borderRadius: 16,
                        padding: "30px 40px",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        opacity: panelOpacity,
                        transform: `scale(${panelScale})`,
                        minWidth: 450,
                    }}
                >
                    {/* パネルヘッダー */}
                    <div
                        style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: "white",
                            fontFamily: "'Noto Sans JP', sans-serif",
                            marginBottom: 25,
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                background: "linear-gradient(135deg, #9966FF 0%, #7B2FBE 100%)",
                                borderRadius: 8,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontSize: 20,
                                fontWeight: 900,
                            }}
                        >
                            Ae
                        </div>
                        AE File Collector
                    </div>

                    {/* 設定項目 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                        {uiSettings.map((setting, index) => {
                            const itemOpacity = interpolate(frame - setting.delay, [0, 15], [0, 1], {
                                extrapolateLeft: "clamp",
                                extrapolateRight: "clamp",
                            });

                            const checkScale = spring({
                                frame: frame - setting.delay - 5,
                                fps,
                                config: { damping: 8, stiffness: 200 },
                            });

                            return (
                                <div
                                    key={index}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 15,
                                        opacity: itemOpacity,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 6,
                                            background: setting.checked
                                                ? "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)"
                                                : "rgba(255,255,255,0.1)",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            transform: `scale(${checkScale})`,
                                        }}
                                    >
                                        {setting.checked && (
                                            <span style={{ color: "white", fontSize: 16, fontWeight: 700 }}>✓</span>
                                        )}
                                    </div>
                                    <span
                                        style={{
                                            fontSize: 22,
                                            color: "white",
                                            fontFamily: "'Noto Sans JP', sans-serif",
                                        }}
                                    >
                                        {setting.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* 実行ボタン */}
                    <div
                        style={{
                            marginTop: 30,
                            background: "linear-gradient(135deg, #9966FF 0%, #7B2FBE 100%)",
                            padding: "15px 30px",
                            borderRadius: 10,
                            textAlign: "center",
                            fontSize: 22,
                            fontWeight: 700,
                            color: "white",
                            fontFamily: "'Noto Sans JP', sans-serif",
                            transform: `scale(${buttonPulse})`,
                            boxShadow: `0 10px 30px rgba(153, 102, 255, ${buttonGlow})`,
                            cursor: "pointer",
                        }}
                    >
                        Collect & Organize
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
