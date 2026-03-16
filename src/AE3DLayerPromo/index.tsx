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

// ─── Houdiniスタイル背景 ───────────────────────────────────
const HoudiniBackground: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    const gridLines: React.ReactNode[] = [];
    const gridCount = 20;

    for (let i = 0; i < gridCount; i++) {
        const baseY = (height / gridCount) * i;
        const waveOffset = Math.sin(frame * 0.05 + i * 0.3) * 20;
        const opacity = interpolate(
            Math.sin(frame * 0.03 + i * 0.5),
            [-1, 1],
            [0.1, 0.4],
        );
        gridLines.push(
            <div
                key={`h-${i}`}
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: baseY + waveOffset,
                    height: 1,
                    background: `linear-gradient(90deg, transparent, rgba(0, 255, 136, ${opacity}), transparent)`,
                }}
            />,
        );
    }

    for (let i = 0; i < gridCount; i++) {
        const baseX = (width / gridCount) * i;
        const waveOffset = Math.sin(frame * 0.04 + i * 0.4) * 15;
        const opacity = interpolate(
            Math.sin(frame * 0.025 + i * 0.6),
            [-1, 1],
            [0.05, 0.3],
        );
        gridLines.push(
            <div
                key={`v-${i}`}
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: baseX + waveOffset,
                    width: 1,
                    background: `linear-gradient(180deg, transparent, rgba(0, 255, 136, ${opacity}), transparent)`,
                }}
            />,
        );
    }

    const particles: React.ReactNode[] = [];
    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
        const seed = i * 1234.5678;
        const baseX = (seed * 7) % width;
        const baseY = (seed * 13) % height;
        const speed = 0.5 + ((seed * 17) % 2);
        const size = 2 + ((seed * 11) % 4);

        const x = baseX + Math.sin(frame * 0.02 * speed + seed) * 50;
        const y = (baseY + frame * speed * 0.5) % height;
        const opacity = interpolate(
            Math.sin(frame * 0.05 + seed),
            [-1, 1],
            [0.2, 0.8],
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
                    backgroundColor: `rgba(0, 255, 200, ${opacity})`,
                    boxShadow: `0 0 ${size * 3}px rgba(0, 255, 200, ${opacity * 0.5})`,
                }}
            />,
        );
    }

    return (
        <AbsoluteFill
            style={{
                background:
                    "radial-gradient(ellipse at center, #0a1a1a 0%, #000000 100%)",
                overflow: "hidden",
            }}
        >
            {gridLines}
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
						rgba(0, 0, 0, 0.1) 2px,
						rgba(0, 0, 0, 0.1) 4px
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

// ─── グリッチテキスト ──────────────────────────────────────
const GlitchTitle: React.FC<{
    text: string;
    delay: number;
    fontSize?: number;
    color?: string;
}> = ({ text, delay, fontSize = 72, color = "#00FF88" }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const progress = spring({
        frame: frame - delay,
        fps,
        config: { damping: 15, stiffness: 100 },
    });

    const glitchIntensity =
        frame > delay + 5 && frame < delay + 15 ? 1 : 0;
    const glitchX = glitchIntensity * (Math.random() - 0.5) * 10;
    const glitchY = glitchIntensity * (Math.random() - 0.5) * 5;

    const opacity = interpolate(progress, [0, 1], [0, 1], {
        extrapolateRight: "clamp",
    });

    const scale = interpolate(progress, [0, 1], [0.8, 1], {
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
					0 0 20px rgba(0, 255, 136, 0.8),
					0 0 40px rgba(0, 255, 136, 0.4),
					${glitchX + 3}px ${glitchY}px 0 rgba(255, 0, 128, 0.7),
					${-glitchX - 3}px ${-glitchY}px 0 rgba(0, 200, 255, 0.7)
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

// ─── データストリームバー ──────────────────────────────────
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
                background: "linear-gradient(transparent, rgba(0, 255, 136, 0.1))",
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
                    color: "rgba(0, 255, 136, 0.4)",
                    whiteSpace: "nowrap",
                    transform: `translateX(${-frame * 2}px)`,
                }}
            >
                {Array(50)
                    .fill("▓░█▒ 3D_LAYER ▒█░▓ ARCHIVE_READY ▒█░▓ DATA_STREAM ")
                    .join("")}
            </div>
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
            <HoudiniBackground />
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
                        filter: "drop-shadow(0 0 30px rgba(0, 255, 136, 0.6))",
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

// ═══ Scene 2: メインタイトル（3D風パースペクティブ）═══════
const Scene2_Title: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // 3D風パースペクティブ回転アニメーション
    const perspective3D = spring({
        frame,
        fps,
        config: { damping: 18, stiffness: 60 },
    });

    const rotateX = interpolate(perspective3D, [0, 1], [25, 0], {
        extrapolateRight: "clamp",
    });

    const rotateY = interpolate(perspective3D, [0, 1], [-15, 0], {
        extrapolateRight: "clamp",
    });

    const translateZ = interpolate(perspective3D, [0, 1], [-200, 0], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill>
            <HoudiniBackground />
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
                        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
                        transformStyle: "preserve-3d",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 15,
                    }}
                >
                    <GlitchTitle
                        text="After Effects"
                        delay={5}
                        fontSize={100}
                        color="#00FF88"
                    />
                    <GlitchTitle
                        text="3Dレイヤー入門講座"
                        delay={20}
                        fontSize={96}
                        color="#a78bfa"
                    />
                </div>

                {/* 3Dアイコン風デコレーション */}
                <div
                    style={{
                        display: "flex",
                        gap: 30,
                        marginTop: 30,
                        opacity: interpolate(
                            spring({
                                frame: frame - 40,
                                fps,
                                config: { damping: 20, stiffness: 80 },
                            }),
                            [0, 1],
                            [0, 1],
                            { extrapolateRight: "clamp" },
                        ),
                    }}
                >
                    {["X", "Y", "Z"].map((axis, i) => (
                        <div
                            key={axis}
                            style={{
                                width: 60,
                                height: 60,
                                borderRadius: 12,
                                border: "2px solid rgba(0, 255, 136, 0.6)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontFamily: "monospace",
                                fontSize: 28,
                                fontWeight: 900,
                                color: ["#FF6B6B", "#00FF88", "#6B9BFF"][i],
                                textShadow: `0 0 15px ${["rgba(255,107,107,0.6)", "rgba(0,255,136,0.6)", "rgba(107,155,255,0.6)"][i]}`,
                                background: "rgba(0, 0, 0, 0.4)",
                                transform: `translateY(${Math.sin(frame * 0.1 + i * 2) * 5}px)`,
                            }}
                        >
                            {axis}
                        </div>
                    ))}
                </div>
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
            <HoudiniBackground />
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
                        filter: "drop-shadow(0 0 20px rgba(0, 255, 136, 0.5))",
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
                        border: `2px solid rgba(0, 255, 136, ${borderOpacity})`,
                        borderRadius: 20,
                        padding: "40px 60px",
                        background: "rgba(0, 20, 15, 0.7)",
                        backdropFilter: "blur(10px)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 20,
                        boxShadow: `0 0 40px rgba(0, 255, 136, 0.15), inset 0 0 40px rgba(0, 255, 136, 0.05)`,
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
                        アーカイブ受け取り方法は
                    </div>
                    <div
                        style={{
                            fontFamily: "'Noto Sans JP', sans-serif",
                            fontSize: 56,
                            fontWeight: 900,
                            color: "#00FF88",
                            textShadow:
                                "0 0 20px rgba(0, 255, 136, 0.8), 0 0 40px rgba(0, 255, 136, 0.4)",
                            textAlign: "center",
                        }}
                    >
                        このポストを見てね！
                    </div>
                </div>

                {/* 矢印アニメーション */}
                <div
                    style={{
                        fontSize: 40,
                        color: "#00FF88",
                        opacity: interpolate(
                            Math.sin(frame * 0.15),
                            [-1, 1],
                            [0.4, 1],
                        ),
                        transform: `translateY(${Math.sin(frame * 0.15) * 8}px)`,
                        textShadow: "0 0 15px rgba(0, 255, 136, 0.6)",
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
export const AE3DLayerPromo: React.FC = () => {
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

                {/* Scene 2: メインタイトル（3D風パース） */}
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
export const AE_3D_LAYER_PROMO_DURATION = 285;
