import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

// フォトリアリスティック大気パーティクル
const AtmosphericParticles: React.FC = () => {
    const frame = useCurrentFrame();

    return (
        <>
            {Array.from({ length: 80 }).map((_, i) => {
                const x = (i * 137.5) % 100;
                const baseY = (i * 73.3) % 100;
                const z = (i * 17) % 100;
                const speed = 0.1 + (i % 5) * 0.05;
                const size = 1 + (i % 4) * 0.5;

                const y = (baseY + frame * speed) % 110 - 5;
                const blur = Math.abs(z - 50) / 20;
                const opacity = 0.2 - blur * 0.03;

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
                            background: `rgba(255, 255, 255, ${opacity})`,
                            filter: `blur(${blur}px)`,
                            boxShadow: `0 0 ${size * 2}px rgba(100, 200, 255, ${opacity * 0.5})`,
                        }}
                    />
                );
            })}
        </>
    );
};

// メタリック3Dロゴ
const MetallicLogo: React.FC<{ scale: number; rotateY: number }> = ({ scale, rotateY }) => {
    const frame = useCurrentFrame();
    const reflectionPhase = (frame * 2) % 360;

    return (
        <div
            style={{
                position: "relative",
                width: 200,
                height: 200,
                transformStyle: "preserve-3d",
                transform: `scale(${scale}) rotateY(${rotateY}deg) rotateX(-5deg)`,
            }}
        >
            {/* ロゴ本体 - メタリック効果 */}
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    borderRadius: 32,
                    background: `
                        linear-gradient(135deg, 
                            #1a1a2e 0%, 
                            #3d3d5c 15%, 
                            #5a5a7a 30%, 
                            #8888aa 45%, 
                            #aaaacc 50%, 
                            #8888aa 55%, 
                            #5a5a7a 70%, 
                            #3d3d5c 85%, 
                            #1a1a2e 100%
                        )
                    `,
                    boxShadow: `
                        0 40px 80px rgba(0, 0, 0, 0.8),
                        0 20px 40px rgba(0, 0, 0, 0.6),
                        inset 0 2px 0 rgba(255, 255, 255, 0.3),
                        inset 0 -2px 0 rgba(0, 0, 0, 0.3),
                        0 0 100px rgba(100, 150, 255, 0.3)
                    `,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {/* 反射ハイライト */}
                <div
                    style={{
                        position: "absolute",
                        width: "80%",
                        height: "40%",
                        top: "10%",
                        borderRadius: "50%",
                        background: `
                            radial-gradient(ellipse at center, 
                                rgba(255, 255, 255, 0.4) 0%, 
                                transparent 70%
                            )
                        `,
                        transform: `rotate(${reflectionPhase * 0.1}deg)`,
                    }}
                />

                {/* ロゴテキスト */}
                <div
                    style={{
                        fontSize: 100,
                        fontWeight: 900,
                        background: `
                            linear-gradient(180deg, 
                                #ffffff 0%, 
                                #ccddff 30%, 
                                #8899cc 60%, 
                                #667799 100%
                            )
                        `,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        textShadow: "none",
                        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))",
                    }}
                >
                    Ae
                </div>
            </div>

            {/* 床面反射 */}
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    top: "100%",
                    borderRadius: 32,
                    background: `
                        linear-gradient(180deg, 
                            rgba(100, 150, 255, 0.15) 0%, 
                            transparent 60%
                        )
                    `,
                    transform: "scaleY(-0.4) rotateX(180deg)",
                    filter: "blur(8px)",
                    opacity: 0.5,
                }}
            />
        </div>
    );
};

export const Title3DScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const logoScale = spring({
        frame,
        fps,
        config: { damping: 18, stiffness: 50 },
        durationInFrames: 50,
    });

    const logoRotateY = interpolate(frame, [0, 90], [-10, 10], {
        extrapolateRight: "clamp",
    });

    const titleOpacity = interpolate(frame, [30, 50], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const titleY = interpolate(frame, [30, 50], [30, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const subtitleOpacity = interpolate(frame, [55, 75], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: `
                    radial-gradient(ellipse at 50% 30%, #0a1525 0%, #050a15 50%, #020408 100%)
                `,
                overflow: "hidden",
            }}
        >
            {/* 大気パーティクル */}
            <AtmosphericParticles />

            {/* ボリュームライト - 上から */}
            <div
                style={{
                    position: "absolute",
                    width: 800,
                    height: 1200,
                    left: "50%",
                    top: -200,
                    transform: "translateX(-50%)",
                    background: `
                        linear-gradient(180deg, 
                            rgba(100, 180, 255, 0.15) 0%, 
                            rgba(100, 180, 255, 0.05) 30%, 
                            transparent 60%
                        )
                    `,
                    clipPath: "polygon(40% 0%, 60% 0%, 70% 100%, 30% 100%)",
                }}
            />

            {/* 地平線グロー */}
            <div
                style={{
                    position: "absolute",
                    width: "200%",
                    height: 400,
                    left: "-50%",
                    bottom: 0,
                    background: `
                        linear-gradient(0deg, 
                            rgba(0, 150, 255, 0.1) 0%, 
                            transparent 100%
                        )
                    `,
                }}
            />

            {/* 3Dグリッド床 - フォトリアル */}
            <div
                style={{
                    position: "absolute",
                    width: 4000,
                    height: 2000,
                    left: "50%",
                    bottom: -400,
                    transform: "translateX(-50%) rotateX(75deg)",
                    background: `
                        linear-gradient(90deg, rgba(0, 200, 255, 0.08) 1px, transparent 1px),
                        linear-gradient(rgba(0, 200, 255, 0.08) 1px, transparent 1px)
                    `,
                    backgroundSize: "120px 120px",
                    maskImage: "linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%)",
                }}
            />

            {/* サイドライト - 左 */}
            <div
                style={{
                    position: "absolute",
                    width: 300,
                    height: 600,
                    left: 100,
                    top: "30%",
                    background: `
                        radial-gradient(ellipse at center, 
                            rgba(255, 100, 150, 0.15) 0%, 
                            transparent 70%
                        )
                    `,
                    filter: "blur(40px)",
                }}
            />

            {/* サイドライト - 右 */}
            <div
                style={{
                    position: "absolute",
                    width: 300,
                    height: 600,
                    right: 100,
                    top: "30%",
                    background: `
                        radial-gradient(ellipse at center, 
                            rgba(100, 200, 255, 0.15) 0%, 
                            transparent 70%
                        )
                    `,
                    filter: "blur(40px)",
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
                    gap: 50,
                }}
            >
                {/* 3Dメタリックロゴ */}
                <MetallicLogo scale={logoScale} rotateY={logoRotateY} />

                {/* メインタイトル */}
                <div
                    style={{
                        fontSize: 100,
                        fontWeight: 800,
                        fontFamily: "'Noto Sans JP', sans-serif",
                        background: `
                            linear-gradient(180deg, 
                                #ffffff 0%, 
                                #cce0ff 40%, 
                                #88aadd 80%, 
                                #6688bb 100%
                            )
                        `,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        opacity: titleOpacity,
                        transform: `translateY(${titleY}px)`,
                        letterSpacing: 2,
                        filter: "drop-shadow(0 10px 30px rgba(0, 150, 255, 0.3))",
                    }}
                >
                    AE File Collector
                </div>

                {/* サブタイトル */}
                <div
                    style={{
                        fontSize: 38,
                        fontFamily: "'Noto Sans JP', sans-serif",
                        color: "rgba(150, 200, 255, 0.9)",
                        opacity: subtitleOpacity,
                        letterSpacing: 6,
                        textShadow: "0 0 30px rgba(100, 180, 255, 0.5)",
                    }}
                >
                    PROJECT ORGANIZATION SYSTEM
                </div>
            </div>

            {/* フィルムグレイン効果 */}
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    opacity: 0.03,
                    background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    pointerEvents: "none",
                }}
            />

            {/* ビネット効果 */}
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    background: `
                        radial-gradient(ellipse at center, 
                            transparent 50%, 
                            rgba(0, 0, 0, 0.4) 100%
                        )
                    `,
                    pointerEvents: "none",
                }}
            />
        </AbsoluteFill>
    );
};
