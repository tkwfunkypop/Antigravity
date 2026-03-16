import React from "react";
import {
    AbsoluteFill,
    Img,
    staticFile,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

// ─── トランジション風背景（ワイプ・スライドモチーフ）─────────
const TransitionBackground: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    // 斜めのスライドバー（トランジションモチーフ）
    const slideBars: React.ReactNode[] = [];
    const barCount = 12;

    for (let i = 0; i < barCount; i++) {
        const speed = 0.3 + (i % 3) * 0.15;
        const offset = (frame * speed + i * 200) % (width + 400) - 200;
        const barWidth = 60 + (i % 4) * 30;
        const opacity = interpolate(
            Math.sin(frame * 0.02 + i * 0.8),
            [-1, 1],
            [0.03, 0.12],
        );
        const hue = 260 + (i % 3) * 20; // 紫系統

        slideBars.push(
            <div
                key={`bar-${i}`}
                style={{
                    position: "absolute",
                    left: offset,
                    top: -50,
                    width: barWidth,
                    height: height + 100,
                    background: `linear-gradient(180deg, transparent, hsla(${hue}, 80%, 60%, ${opacity}), transparent)`,
                    transform: "skewX(-15deg)",
                }}
            />,
        );
    }

    // パーティクル
    const particles: React.ReactNode[] = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const seed = i * 1234.5678;
        const baseX = (seed * 7) % width;
        const baseY = (seed * 13) % height;
        const speed = 0.5 + ((seed * 17) % 2);
        const size = 2 + ((seed * 11) % 4);

        const x = baseX + Math.sin(frame * 0.02 * speed + seed) * 40;
        const y = (baseY + frame * speed * 0.5) % height;
        const opacity = interpolate(
            Math.sin(frame * 0.05 + seed),
            [-1, 1],
            [0.15, 0.7],
        );

        particles.push(
            <div
                key={`p-${i}`}
                style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    backgroundColor: `hsla(270, 80%, 70%, ${opacity})`,
                    boxShadow: `0 0 ${size * 3}px hsla(270, 80%, 70%, ${opacity * 0.5})`,
                }}
            />,
        );
    }

    // 横方向ワイプライン
    const wipeLines: React.ReactNode[] = [];
    for (let i = 0; i < 5; i++) {
        const y = (height / 6) * (i + 1);
        const progress = (frame * 3 + i * 300) % (width + 200) - 100;
        const lineOpacity = interpolate(
            Math.sin(frame * 0.04 + i),
            [-1, 1],
            [0.05, 0.25],
        );

        wipeLines.push(
            <div
                key={`wipe-${i}`}
                style={{
                    position: "absolute",
                    left: progress - 100,
                    top: y,
                    width: 200,
                    height: 2,
                    background: `linear-gradient(90deg, transparent, hsla(280, 100%, 70%, ${lineOpacity}), transparent)`,
                }}
            />,
        );
    }

    return (
        <AbsoluteFill
            style={{
                background:
                    "radial-gradient(ellipse at center, #1a0a2e 0%, #0a0015 60%, #000000 100%)",
                overflow: "hidden",
            }}
        >
            {slideBars}
            {wipeLines}
            {particles}

            {/* スキャンライン */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: `repeating-linear-gradient(
						0deg,
						transparent,
						transparent 2px,
						rgba(0, 0, 0, 0.08) 2px,
						rgba(0, 0, 0, 0.08) 4px
					)`,
                    pointerEvents: "none",
                }}
            />

            {/* ビネット */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
                    pointerEvents: "none",
                }}
            />
        </AbsoluteFill>
    );
};

// ─── グローテキスト（紫＆シアン系）───────────────────────────
const GlowTitle: React.FC<{
    text: string;
    delay: number;
    fontSize?: number;
    color?: string;
}> = ({ text, delay, fontSize = 72, color = "#c084fc" }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const progress = spring({
        frame: frame - delay,
        fps,
        config: { damping: 15, stiffness: 100 },
    });

    const glitchIntensity =
        frame > delay + 5 && frame < delay + 15 ? 1 : 0;
    const glitchX = glitchIntensity * (Math.random() - 0.5) * 8;
    const glitchY = glitchIntensity * (Math.random() - 0.5) * 4;

    const opacity = interpolate(progress, [0, 1], [0, 1], {
        extrapolateRight: "clamp",
    });

    const scale = interpolate(progress, [0, 1], [0.85, 1], {
        extrapolateRight: "clamp",
    });

    return (
        <div
            style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize,
                fontWeight: 900,
                color,
                textShadow: `
					0 0 20px hsla(270, 80%, 70%, 0.8),
					0 0 40px hsla(270, 80%, 70%, 0.4),
					${glitchX + 3}px ${glitchY}px 0 rgba(255, 100, 200, 0.6),
					${-glitchX - 3}px ${-glitchY}px 0 rgba(100, 200, 255, 0.6)
				`,
                opacity,
                transform: `scale(${scale}) translate(${glitchX}px, ${glitchY}px)`,
                letterSpacing: "0.05em",
                textAlign: "center",
            }}
        >
            {text}
        </div>
    );
};

// ─── サブテキスト ──────────────────────────────────────────
const SubText: React.FC<{ text: string; delay: number; fontSize?: number }> = ({
    text,
    delay,
    fontSize = 36,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const progress = spring({
        frame: frame - delay,
        fps,
        config: { damping: 20, stiffness: 80 },
    });

    const opacity = interpolate(progress, [0, 1], [0, 1], {
        extrapolateRight: "clamp",
    });

    const y = interpolate(progress, [0, 1], [30, 0], {
        extrapolateRight: "clamp",
    });

    return (
        <div
            style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize,
                fontWeight: 500,
                color: "#FFFFFF",
                textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                opacity,
                transform: `translateY(${y}px)`,
                textAlign: "center",
            }}
        >
            {text}
        </div>
    );
};

// ─── データストリームバー（トランジション風）────────────────
const DataStreamBar: React.FC = () => {
    const frame = useCurrentFrame();

    return (
        <div
            style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
                background: "linear-gradient(transparent, rgba(192, 132, 252, 0.1))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    color: "rgba(192, 132, 252, 0.4)",
                    whiteSpace: "nowrap",
                    transform: `translateX(${-frame * 2}px)`,
                }}
            >
                {Array(50)
                    .fill("▓░█▒ TRANSITION ▒█░▓ WIPE ▒█░▓ SLIDE ▒█░▓ FADE ▒█░▓ CROSS_DISSOLVE ")
                    .join("")}
            </div>
        </div>
    );
};

// ─── トランジションアイコン装飾 ──────────────────────────────
const TransitionIcons: React.FC<{ delay: number }> = ({ delay }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const opacity = interpolate(
        spring({
            frame: frame - delay,
            fps,
            config: { damping: 20, stiffness: 80 },
        }),
        [0, 1],
        [0, 1],
        { extrapolateRight: "clamp" },
    );

    const icons = [
        { label: "WIPE", color: "#c084fc" },
        { label: "SLIDE", color: "#67e8f9" },
        { label: "FADE", color: "#f0abfc" },
        { label: "PUSH", color: "#a78bfa" },
    ];

    return (
        <div
            style={{
                display: "flex",
                gap: 24,
                marginTop: 30,
                opacity,
            }}
        >
            {icons.map((icon, i) => (
                <div
                    key={icon.label}
                    style={{
                        width: 80,
                        height: 50,
                        borderRadius: 10,
                        border: `2px solid hsla(270, 60%, 70%, 0.5)`,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontFamily: "monospace",
                        fontSize: 16,
                        fontWeight: 700,
                        color: icon.color,
                        textShadow: `0 0 10px ${icon.color}80`,
                        background: "rgba(10, 0, 30, 0.5)",
                        transform: `translateY(${Math.sin(frame * 0.1 + i * 1.5) * 5}px)`,
                    }}
                >
                    {icon.label}
                </div>
            ))}
        </div>
    );
};

// ═══ Scene 1: ロゴ登場 ═══════════════════════════════════
const Scene1_Logo: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const logoProgress = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 150 },
    });

    const logoScale = interpolate(logoProgress, [0, 1], [0.5, 1], {
        extrapolateRight: "clamp",
    });

    const logoOpacity = interpolate(logoProgress, [0, 1], [0, 1], {
        extrapolateRight: "clamp",
    });

    const floatY = Math.sin(frame * 0.08) * 8;

    return (
        <AbsoluteFill>
            <TransitionBackground />
            <AbsoluteFill
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 30,
                }}
            >
                <div
                    style={{
                        opacity: logoOpacity,
                        transform: `scale(${logoScale}) translateY(${floatY}px)`,
                        filter: "drop-shadow(0 0 30px hsla(270, 80%, 70%, 0.6))",
                    }}
                >
                    <Img
                        src={staticFile("images/takahashidan_logo.png")}
                        style={{
                            width: 600,
                            height: "auto",
                        }}
                    />
                </div>

                <SubText text="presents" delay={20} fontSize={28} />
            </AbsoluteFill>
            <DataStreamBar />
        </AbsoluteFill>
    );
};

// ═══ Scene 2: メインタイトル ═══════════════════════════════
const Scene2_Title: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // ワイプイン風パースペクティブ
    const perspective = spring({
        frame,
        fps,
        config: { damping: 18, stiffness: 60 },
    });

    const rotateX = interpolate(perspective, [0, 1], [20, 0], {
        extrapolateRight: "clamp",
    });

    const translateZ = interpolate(perspective, [0, 1], [-150, 0], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill>
            <TransitionBackground />
            <AbsoluteFill
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 20,
                    perspective: 1200,
                }}
            >
                <div
                    style={{
                        transform: `rotateX(${rotateX}deg) translateZ(${translateZ}px)`,
                        transformStyle: "preserve-3d",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 15,
                    }}
                >
                    <GlowTitle
                        text="After Effects"
                        delay={5}
                        fontSize={100}
                        color="#67e8f9"
                    />
                    <GlowTitle
                        text="トランジション超入門講座"
                        delay={20}
                        fontSize={88}
                        color="#c084fc"
                    />
                </div>

                <TransitionIcons delay={40} />
            </AbsoluteFill>
            <DataStreamBar />
        </AbsoluteFill>
    );
};

// ═══ Scene 3: CTA ════════════════════════════════════════
const Scene3_CTA: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const borderOpacity = interpolate(
        Math.sin(frame * 0.1),
        [-1, 1],
        [0.4, 0.8],
    );

    const boxProgress = spring({
        frame: frame - 10,
        fps,
        config: { damping: 18, stiffness: 80 },
    });

    const boxScale = interpolate(boxProgress, [0, 1], [0.9, 1], {
        extrapolateRight: "clamp",
    });

    const boxOpacity = interpolate(boxProgress, [0, 1], [0, 1], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill>
            <TransitionBackground />
            <AbsoluteFill
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 40,
                }}
            >
                {/* ロゴ（小さめ） */}
                <Img
                    src={staticFile("images/takahashidan_logo.png")}
                    style={{
                        width: 300,
                        height: "auto",
                        filter: "drop-shadow(0 0 20px hsla(270, 80%, 70%, 0.5))",
                        opacity: interpolate(
                            spring({ frame, fps, config: { damping: 15, stiffness: 100 } }),
                            [0, 1],
                            [0, 1],
                            { extrapolateRight: "clamp" },
                        ),
                    }}
                />

                {/* CTAボックス */}
                <div
                    style={{
                        opacity: boxOpacity,
                        transform: `scale(${boxScale})`,
                        border: `2px solid hsla(270, 80%, 70%, ${borderOpacity})`,
                        borderRadius: 20,
                        padding: "40px 60px",
                        background: "rgba(20, 5, 40, 0.7)",
                        backdropFilter: "blur(10px)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 20,
                        boxShadow: `0 0 40px hsla(270, 80%, 70%, 0.15), inset 0 0 40px hsla(270, 80%, 70%, 0.05)`,
                    }}
                >
                    <div
                        style={{
                            fontFamily: "'Noto Sans JP', sans-serif",
                            fontSize: 48,
                            fontWeight: 700,
                            color: "#FFFFFF",
                            textShadow: "0 0 15px rgba(255, 255, 255, 0.4)",
                            textAlign: "center",
                        }}
                    >
                        アーカイブの受け取り方は
                    </div>
                    <div
                        style={{
                            fontFamily: "'Noto Sans JP', sans-serif",
                            fontSize: 56,
                            fontWeight: 900,
                            color: "#c084fc",
                            textShadow:
                                "0 0 20px hsla(270, 80%, 70%, 0.8), 0 0 40px hsla(270, 80%, 70%, 0.4)",
                            textAlign: "center",
                        }}
                    >
                        ポストをチェック！
                    </div>
                </div>

                {/* 矢印アニメーション */}
                <div
                    style={{
                        fontSize: 40,
                        color: "#c084fc",
                        opacity: interpolate(
                            Math.sin(frame * 0.15),
                            [-1, 1],
                            [0.4, 1],
                        ),
                        transform: `translateY(${Math.sin(frame * 0.15) * 8}px)`,
                        textShadow: "0 0 15px hsla(270, 80%, 70%, 0.6)",
                    }}
                >
                    ▼ ▼ ▼
                </div>
            </AbsoluteFill>
            <DataStreamBar />
        </AbsoluteFill>
    );
};

// ═══ メインコンポジション ═════════════════════════════════
export const AETransitionPromo: React.FC = () => {
    const transitionDuration = 15;

    return (
        <AbsoluteFill>
            <TransitionSeries>
                {/* Scene 1: ロゴ登場 */}
                <TransitionSeries.Sequence durationInFrames={90}>
                    <Scene1_Logo />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: transitionDuration })}
                />

                {/* Scene 2: メインタイトル */}
                <TransitionSeries.Sequence durationInFrames={120}>
                    <Scene2_Title />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-bottom" })}
                    timing={linearTiming({ durationInFrames: transitionDuration })}
                />

                {/* Scene 3: CTA */}
                <TransitionSeries.Sequence durationInFrames={105}>
                    <Scene3_CTA />
                </TransitionSeries.Sequence>
            </TransitionSeries>
        </AbsoluteFill>
    );
};

// 合計: 90 + 120 + 105 - 15 - 15 = 285 frames (~9.5秒 at 30fps)
export const AE_TRANSITION_PROMO_DURATION = 285;
