import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

// フォトリアル問題カード
const problems = [
    { icon: "📁", text: "ファイル散乱", subtext: "FILE SCATTER", severity: "CRITICAL" },
    { icon: "🔗", text: "リンク切れ", subtext: "BROKEN LINKS", severity: "ERROR" },
    { icon: "⏰", text: "納品前の焦り", subtext: "DEADLINE PRESSURE", severity: "WARNING" },
];

// メタリック警告パネル
const WarningPanel: React.FC<{
    problem: typeof problems[0];
    index: number;
    progress: number;
}> = ({ problem, index, progress }) => {
    const frame = useCurrentFrame();
    const pulsePhase = Math.sin(frame * 0.15 + index) * 0.5 + 0.5;

    const severityColor = problem.severity === "CRITICAL" ? "#ff3366" :
        problem.severity === "ERROR" ? "#ff6633" : "#ffaa33";

    return (
        <div
            style={{
                width: 360,
                background: `
                    linear-gradient(180deg, 
                        rgba(20, 15, 25, 0.95) 0%, 
                        rgba(35, 25, 40, 0.95) 50%,
                        rgba(20, 15, 25, 0.95) 100%
                    )
                `,
                borderRadius: 16,
                border: `1px solid rgba(255, 100, 100, 0.2)`,
                boxShadow: `
                    0 40px 80px rgba(0, 0, 0, 0.6),
                    0 20px 40px rgba(0, 0, 0, 0.4),
                    0 0 60px rgba(255, 50, 50, ${pulsePhase * 0.15}),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `,
                transform: `scale(${progress}) translateY(${(1 - progress) * 50}px)`,
                opacity: progress,
                overflow: "hidden",
            }}
        >
            {/* ヘッダー */}
            <div
                style={{
                    padding: "16px 24px",
                    background: `linear-gradient(90deg, ${severityColor}20 0%, transparent 100%)`,
                    borderBottom: `1px solid ${severityColor}30`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div style={{
                    fontSize: 13,
                    color: severityColor,
                    fontFamily: "monospace",
                    letterSpacing: 2,
                    fontWeight: 600,
                }}>
                    {problem.severity}
                </div>
                <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: severityColor,
                    boxShadow: `0 0 15px ${severityColor}`,
                    opacity: pulsePhase,
                }} />
            </div>

            {/* コンテンツ */}
            <div style={{ padding: "40px 30px", textAlign: "center" }}>
                <div style={{ fontSize: 70, marginBottom: 20 }}>{problem.icon}</div>
                <div style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#ffffff",
                    fontFamily: "'Noto Sans JP', sans-serif",
                    marginBottom: 8,
                }}>
                    {problem.text}
                </div>
                <div style={{
                    fontSize: 14,
                    color: "rgba(150, 150, 180, 0.8)",
                    fontFamily: "monospace",
                    letterSpacing: 3,
                }}>
                    {problem.subtext}
                </div>
            </div>
        </div>
    );
};

export const Problem3DScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleOpacity = interpolate(frame, [0, 25], [0, 1], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: `
                    radial-gradient(ellipse at 50% 0%, #1a0a15 0%, #0a0508 50%, #050305 100%)
                `,
                overflow: "hidden",
            }}
        >
            {/* 警告グロー背景 */}
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    background: `
                        radial-gradient(ellipse at 50% 50%, 
                            rgba(255, 50, 80, 0.08) 0%, 
                            transparent 50%
                        )
                    `,
                }}
            />

            {/* 大気パーティクル */}
            {Array.from({ length: 30 }).map((_, i) => {
                const x = (i * 63.7) % 100;
                const y = (i * 47.3 + frame * 0.2) % 100;
                const size = 1 + (i % 3);
                const opacity = 0.1 + (i % 5) * 0.02;

                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            left: `${x}%`,
                            top: `${y}%`,
                            width: size,
                            height: size,
                            borderRadius: "50%",
                            background: `rgba(255, 100, 100, ${opacity})`,
                            filter: "blur(1px)",
                        }}
                    />
                );
            })}

            {/* タイトル */}
            <div
                style={{
                    position: "absolute",
                    top: 80,
                    width: "100%",
                    textAlign: "center",
                    opacity: titleOpacity,
                }}
            >
                <div style={{
                    fontSize: 20,
                    color: "#ff6666",
                    fontFamily: "monospace",
                    letterSpacing: 8,
                    marginBottom: 15,
                }}>
                    [ SYSTEM ALERT ]
                </div>
                <div style={{
                    fontSize: 64,
                    fontWeight: 800,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    background: `
                        linear-gradient(180deg, 
                            #ffffff 0%, 
                            #ffcccc 50%, 
                            #ff8888 100%
                        )
                    `,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 5px 20px rgba(255, 100, 100, 0.4))",
                }}>
                    こんな経験ありませんか？
                </div>
            </div>

            {/* 問題パネル */}
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 40,
                    paddingTop: 100,
                }}
            >
                {problems.map((problem, index) => {
                    const delay = 25 + index * 18;
                    const panelProgress = spring({
                        frame: frame - delay,
                        fps,
                        config: { damping: 15, stiffness: 80 },
                    });

                    return (
                        <WarningPanel
                            key={index}
                            problem={problem}
                            index={index}
                            progress={panelProgress}
                        />
                    );
                })}
            </div>

            {/* ビネット */}
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    background: `
                        radial-gradient(ellipse at center, 
                            transparent 40%, 
                            rgba(0, 0, 0, 0.5) 100%
                        )
                    `,
                    pointerEvents: "none",
                }}
            />
        </AbsoluteFill>
    );
};
