import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

// 大気パーティクル
const AtmosphericParticles: React.FC = () => {
    const frame = useCurrentFrame();

    return (
        <>
            {Array.from({ length: 60 }).map((_, i) => {
                const x = (i * 137.5) % 100;
                const baseY = (i * 73.3) % 100;
                const speed = 0.15 + (i % 5) * 0.05;
                const size = 1 + (i % 3) * 0.5;

                const y = (baseY + frame * speed) % 110 - 5;
                const opacity = 0.15 + Math.sin(frame * 0.05 + i) * 0.05;

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
                            background: `rgba(100, 200, 255, ${opacity})`,
                            boxShadow: `0 0 ${size * 3}px rgba(100, 200, 255, ${opacity * 0.5})`,
                        }}
                    />
                );
            })}
        </>
    );
};

export const CTA3DScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const mainScale = spring({
        frame,
        fps,
        config: { damping: 20, stiffness: 50 },
    });

    const pulseScale = 1 + Math.sin(frame * 0.12) * 0.015;
    const glowIntensity = 0.4 + Math.sin(frame * 0.1) * 0.2;

    const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
        extrapolateRight: "clamp",
    });

    const buttonOpacity = interpolate(frame, [20, 45], [0, 1], {
        extrapolateRight: "clamp",
    });

    const subtitleOpacity = interpolate(frame, [50, 70], [0, 1], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: `
                    radial-gradient(ellipse at 50% 40%, #0a1530 0%, #050a18 50%, #020508 100%)
                `,
                overflow: "hidden",
            }}
        >
            {/* 大気パーティクル */}
            <AtmosphericParticles />

            {/* メインボリュームライト */}
            <div
                style={{
                    position: "absolute",
                    width: 1200,
                    height: 800,
                    left: "50%",
                    top: "40%",
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    background: `
                        radial-gradient(ellipse at center, 
                            rgba(100, 180, 255, ${glowIntensity * 0.15}) 0%, 
                            transparent 50%
                        )
                    `,
                    filter: "blur(80px)",
                }}
            />

            {/* アクセントライト - マゼンタ */}
            <div
                style={{
                    position: "absolute",
                    width: 500,
                    height: 500,
                    left: "25%",
                    top: "30%",
                    borderRadius: "50%",
                    background: `
                        radial-gradient(ellipse at center, 
                            rgba(255, 100, 180, ${glowIntensity * 0.1}) 0%, 
                            transparent 60%
                        )
                    `,
                    filter: "blur(60px)",
                }}
            />

            {/* 3Dグリッド床 */}
            <div
                style={{
                    position: "absolute",
                    width: 4000,
                    height: 2000,
                    left: "50%",
                    bottom: -400,
                    transform: "translateX(-50%) rotateX(75deg)",
                    background: `
                        linear-gradient(90deg, rgba(100, 180, 255, 0.05) 1px, transparent 1px),
                        linear-gradient(rgba(100, 180, 255, 0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: "100px 100px",
                    maskImage: "linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%)",
                }}
            />

            {/* メインコンテンツ */}
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 40,
                    transform: `scale(${mainScale})`,
                }}
            >
                {/* ステータスラベル */}
                <div
                    style={{
                        fontSize: 18,
                        color: "#66ddaa",
                        fontFamily: "monospace",
                        letterSpacing: 8,
                        opacity: titleOpacity,
                    }}
                >
                    [ DOWNLOAD READY ]
                </div>

                {/* メインタイトル */}
                <div
                    style={{
                        fontSize: 88,
                        fontWeight: 800,
                        fontFamily: "'Noto Sans JP', sans-serif",
                        background: `
                            linear-gradient(180deg, 
                                #ffffff 0%, 
                                #cce0ff 40%, 
                                #88aadd 80%, 
                                #667799 100%
                            )
                        `,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        opacity: titleOpacity,
                        filter: "drop-shadow(0 10px 40px rgba(100, 180, 255, 0.4))",
                        letterSpacing: 4,
                    }}
                >
                    無料ダウンロード
                </div>

                {/* CTAボタン - メタリック */}
                <div
                    style={{
                        position: "relative",
                        background: `
                            linear-gradient(180deg, 
                                rgba(80, 120, 180, 0.9) 0%, 
                                rgba(50, 80, 130, 0.95) 50%,
                                rgba(40, 60, 100, 0.9) 100%
                            )
                        `,
                        padding: "30px 100px",
                        borderRadius: 60,
                        border: "1px solid rgba(150, 200, 255, 0.3)",
                        boxShadow: `
                            0 30px 60px rgba(0, 0, 0, 0.4),
                            0 15px 30px rgba(0, 0, 0, 0.3),
                            0 0 80px rgba(100, 180, 255, ${glowIntensity}),
                            inset 0 2px 0 rgba(255, 255, 255, 0.2),
                            inset 0 -2px 0 rgba(0, 0, 0, 0.2)
                        `,
                        transform: `scale(${pulseScale})`,
                        opacity: buttonOpacity,
                        overflow: "hidden",
                    }}
                >
                    {/* 光沢シマー */}
                    <div
                        style={{
                            position: "absolute",
                            width: "200%",
                            height: 60,
                            top: -20,
                            left: `${(frame * 2) % 300 - 100}%`,
                            background: `
                                linear-gradient(90deg, 
                                    transparent 0%, 
                                    rgba(255, 255, 255, 0.1) 45%, 
                                    rgba(255, 255, 255, 0.2) 50%, 
                                    rgba(255, 255, 255, 0.1) 55%, 
                                    transparent 100%
                                )
                            `,
                            transform: "rotate(-20deg)",
                            pointerEvents: "none",
                        }}
                    />

                    <div
                        style={{
                            fontSize: 44,
                            fontWeight: 700,
                            color: "#ffffff",
                            fontFamily: "'Noto Sans JP', sans-serif",
                            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                            letterSpacing: 2,
                        }}
                    >
                        AE File Collector
                    </div>
                </div>

                {/* サブテキスト */}
                <div
                    style={{
                        fontSize: 30,
                        color: "rgba(180, 210, 255, 0.8)",
                        fontFamily: "'Noto Sans JP', sans-serif",
                        opacity: subtitleOpacity,
                        letterSpacing: 3,
                    }}
                >
                    プロジェクト整理を効率化
                </div>
            </div>

            {/* コーナーデコレーション */}
            {[
                { top: 40, left: 40, borderTop: true, borderLeft: true },
                { top: 40, right: 40, borderTop: true, borderRight: true },
                { bottom: 40, left: 40, borderBottom: true, borderLeft: true },
                { bottom: 40, right: 40, borderBottom: true, borderRight: true },
            ].map((corner, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        width: 80,
                        height: 80,
                        ...corner,
                        borderTop: corner.borderTop ? "1px solid rgba(100, 180, 255, 0.3)" : "none",
                        borderBottom: corner.borderBottom ? "1px solid rgba(100, 180, 255, 0.3)" : "none",
                        borderLeft: corner.borderLeft ? "1px solid rgba(100, 180, 255, 0.3)" : "none",
                        borderRight: corner.borderRight ? "1px solid rgba(100, 180, 255, 0.3)" : "none",
                    }}
                />
            ))}

            {/* ビネット */}
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    background: `
                        radial-gradient(ellipse at center, 
                            transparent 50%, 
                            rgba(0, 0, 0, 0.5) 100%
                        )
                    `,
                    pointerEvents: "none",
                }}
            />
        </AbsoluteFill>
    );
};
