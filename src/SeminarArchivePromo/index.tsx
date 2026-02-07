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

/**
 * Houdiniスタイルのパーティクル/グリッドエフェクト背景
 */
const HoudiniBackground: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    // グリッドライン生成
    const gridLines: React.ReactNode[] = [];
    const gridCount = 20;

    for (let i = 0; i < gridCount; i++) {
        const baseY = (height / gridCount) * i;
        const waveOffset = Math.sin((frame * 0.05) + (i * 0.3)) * 20;
        const opacity = interpolate(
            Math.sin((frame * 0.03) + (i * 0.5)),
            [-1, 1],
            [0.1, 0.4]
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
            />
        );
    }

    for (let i = 0; i < gridCount; i++) {
        const baseX = (width / gridCount) * i;
        const waveOffset = Math.sin((frame * 0.04) + (i * 0.4)) * 15;
        const opacity = interpolate(
            Math.sin((frame * 0.025) + (i * 0.6)),
            [-1, 1],
            [0.05, 0.3]
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
            />
        );
    }

    // パーティクル生成
    const particles: React.ReactNode[] = [];
    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
        const seed = i * 1234.5678;
        const baseX = ((seed * 7) % width);
        const baseY = ((seed * 13) % height);
        const speed = 0.5 + ((seed * 17) % 2);
        const size = 2 + ((seed * 11) % 4);

        const x = baseX + Math.sin((frame * 0.02 * speed) + seed) * 50;
        const y = (baseY + frame * speed * 0.5) % height;
        const opacity = interpolate(
            Math.sin((frame * 0.05) + seed),
            [-1, 1],
            [0.2, 0.8]
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
            />
        );
    }

    return (
        <AbsoluteFill
            style={{
                background: "radial-gradient(ellipse at center, #0a1a1a 0%, #000000 100%)",
                overflow: "hidden",
            }}
        >
            {gridLines}
            {particles}

            {/* スキャンライン効果 */}
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

            {/* Vignette */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
                    pointerEvents: "none",
                }}
            />
        </AbsoluteFill>
    );
};

/**
 * グリッチテキストエフェクト
 */
const GlitchTitle: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const progress = spring({
        frame: frame - delay,
        fps,
        config: { damping: 15, stiffness: 100 },
    });

    const glitchIntensity = frame > delay + 5 && frame < delay + 15 ? 1 : 0;
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
                fontSize: 72,
                fontWeight: 900,
                color: "#00FF88",
                textShadow: `
                    0 0 20px rgba(0, 255, 136, 0.8),
                    0 0 40px rgba(0, 255, 136, 0.4),
                    ${glitchX + 3}px ${glitchY}px 0 rgba(255, 0, 128, 0.7),
                    ${-glitchX - 3}px ${-glitchY}px 0 rgba(0, 200, 255, 0.7)
                `,
                opacity,
                transform: `scale(${scale}) translate(${glitchX}px, ${glitchY}px)`,
                letterSpacing: "0.05em",
            }}
        >
            {text}
        </div>
    );
};

/**
 * サブテキスト（フェードイン）
 */
const SubText: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
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
                fontSize: 36,
                fontWeight: 500,
                color: "#FFFFFF",
                textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                opacity,
                transform: `translateY(${y}px)`,
            }}
        >
            {text}
        </div>
    );
};

/**
 * セミナーアーカイブ告知動画コンポジション
 */
export const SeminarArchivePromo: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // ロゴのスプリングアニメーション
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

    // ロゴの浮遊アニメーション
    const floatY = Math.sin(frame * 0.08) * 8;

    return (
        <AbsoluteFill>
            <HoudiniBackground />

            {/* コンテンツコンテナ */}
            <AbsoluteFill
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 40,
                }}
            >
                {/* ロゴ */}
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
                            width: 500,
                            height: "auto",
                        }}
                    />
                </div>

                {/* メインタイトル */}
                <GlitchTitle text="テキストアニメーション超入門講座" delay={15} />

                {/* サブテキスト */}
                <SubText text="アーカイブの受け取り方はこのポストを見てね！" delay={35} />
            </AbsoluteFill>

            {/* 下部のデータストリームエフェクト */}
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
                    {Array(50).fill("▓░█▒ ARCHIVE_READY ▒█░▓ DATA_STREAM ").join("")}
                </div>
            </div>
        </AbsoluteFill>
    );
};

export const SEMINAR_ARCHIVE_PROMO_DURATION = 300; // 10 seconds at 30fps
