import React from "react";
import {
    AbsoluteFill,
    Audio,
    Sequence,
    interpolate,
    staticFile,
    useCurrentFrame,
} from "remotion";
import { TitleBar } from "./TitleBar";
import { TipCard } from "./TipCard";
import { SceneSlide } from "./SceneSlide";
import { getSceneTimings, AE_TIPS_VIDEO_DURATION } from "./data";

// ────────────────────────────────────────────
// 背景グラデーション（AE風ダークテーマ）
// ────────────────────────────────────────────
const Background: React.FC = () => {
    const frame = useCurrentFrame();
    const hueShift = interpolate(frame, [0, AE_TIPS_VIDEO_DURATION], [0, 30]);
    return (
        <AbsoluteFill
            style={{
                background: `
          radial-gradient(ellipse at 20% 80%, hsl(${240 + hueShift}, 60%, 12%) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, hsl(${280 + hueShift}, 50%, 10%) 0%, transparent 60%),
          linear-gradient(180deg, #0a0a1a 0%, #111128 50%, #0a0a1a 100%)
        `,
            }}
        />
    );
};

// ────────────────────────────────────────────
// パーティクル装飾
// ────────────────────────────────────────────
const Particles: React.FC = () => {
    const frame = useCurrentFrame();
    const particles = Array.from({ length: 20 }, (_, i) => {
        // 決定論的な疑似ランダム（シード: i）
        const seed = (i * 7919 + 104729) % 1000;
        const x = (seed % 100);
        const y = ((seed * 3) % 100);
        const size = 2 + (seed % 4);
        const speed = 0.3 + (seed % 5) * 0.1;
        const opacity = interpolate(
            (frame * speed + seed) % 200,
            [0, 100, 200],
            [0, 0.4, 0],
        );
        return (
            <div
                key={i}
                style={{
                    position: "absolute",
                    left: `${x}%`,
                    top: `${(y + frame * speed * 0.05) % 110 - 10}%`,
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    opacity,
                }}
            />
        );
    });
    return <AbsoluteFill>{particles}</AbsoluteFill>;
};

// ────────────────────────────────────────────
// オープニングシーン
// ────────────────────────────────────────────
const OpeningScene: React.FC<{
    title: string;
    subtitle: string;
    accentColor: string;
}> = ({ title, subtitle, accentColor }) => {
    const frame = useCurrentFrame();
    const titleOpacity = interpolate(frame, [0, 25], [0, 1], {
        extrapolateRight: "clamp",
    });
    const titleScale = interpolate(frame, [0, 25], [0.8, 1], {
        extrapolateRight: "clamp",
    });
    const subtitleOpacity = interpolate(frame, [15, 35], [0, 1], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* メインタイトル */}
            <div
                style={{
                    opacity: titleOpacity,
                    transform: `scale(${titleScale})`,
                    fontSize: 72,
                    fontWeight: 900,
                    color: "#ffffff",
                    fontFamily: "'Noto Sans JP', sans-serif",
                    textAlign: "center",
                    textShadow: `0 0 40px ${accentColor}66, 0 4px 20px rgba(0,0,0,0.5)`,
                    lineHeight: 1.3,
                    maxWidth: "80%",
                }}
            >
                {title}
            </div>

            {/* サブタイトル */}
            <div
                style={{
                    opacity: subtitleOpacity,
                    marginTop: 24,
                    fontSize: 32,
                    fontWeight: 400,
                    color: accentColor,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    letterSpacing: "0.1em",
                }}
            >
                {subtitle}
            </div>

            {/* アクセントライン */}
            <div
                style={{
                    marginTop: 32,
                    width: interpolate(frame, [20, 40], [0, 200], {
                        extrapolateRight: "clamp",
                    }),
                    height: 3,
                    background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                }}
            />
        </AbsoluteFill>
    );
};

// ────────────────────────────────────────────
// エンディングシーン
// ────────────────────────────────────────────
const EndingScene: React.FC<{
    title: string;
    subtitle: string;
    accentColor: string;
}> = ({ title, subtitle, accentColor }) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: "clamp",
    });
    const scale = interpolate(frame, [0, 20], [0.9, 1], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                opacity,
                transform: `scale(${scale})`,
            }}
        >
            <div
                style={{
                    fontSize: 64,
                    fontWeight: 900,
                    color: "#ffffff",
                    fontFamily: "'Noto Sans JP', sans-serif",
                    textAlign: "center",
                    textShadow: `0 0 40px ${accentColor}66`,
                    maxWidth: "80%",
                    lineHeight: 1.3,
                }}
            >
                {title}
            </div>
            <div
                style={{
                    marginTop: 24,
                    fontSize: 28,
                    color: accentColor,
                    fontFamily: "'Noto Sans JP', sans-serif",
                }}
            >
                {subtitle}
            </div>
        </AbsoluteFill>
    );
};

// ────────────────────────────────────────────
// テクニックシーン（スライド + カード + タイトルバー）
// ────────────────────────────────────────────
const TipScene: React.FC<{
    tipNumber: number;
    title: string;
    subtitle: string;
    slideImage?: string;
    accentColor: string;
}> = ({ tipNumber, title, subtitle, slideImage, accentColor }) => {
    return (
        <AbsoluteFill>
            {/* スライド画像 */}
            {slideImage && <SceneSlide imagePath={slideImage} />}

            {/* テクニック番号カード（左上） */}
            <TipCard
                tipNumber={tipNumber}
                title={title}
                subtitle={subtitle}
                accentColor={accentColor}
            />

            {/* 下部タイトルバー */}
            <TitleBar title={`Tip ${tipNumber}: ${title}`} accentColor={accentColor} />
        </AbsoluteFill>
    );
};

// ────────────────────────────────────────────
// メインコンポジション
// ────────────────────────────────────────────
export const AETipsVideo: React.FC = () => {
    const timings = getSceneTimings();

    return (
        <AbsoluteFill>
            {/* 背景 */}
            <Background />
            <Particles />

            {/* 各シーン */}
            {timings.map(({ scene, startFrame, durationFrames }) => (
                <Sequence
                    key={scene.id}
                    from={startFrame}
                    durationInFrames={durationFrames}
                >
                    {/* ナレーション音声 */}
                    <Audio src={staticFile(`audio/narration/${scene.audioFile}`)} />

                    {/* ビジュアル */}
                    {scene.id === "opening" ? (
                        <OpeningScene
                            title={scene.title}
                            subtitle={scene.subtitle}
                            accentColor={scene.accentColor}
                        />
                    ) : scene.id === "ending" ? (
                        <EndingScene
                            title={scene.title}
                            subtitle={scene.subtitle}
                            accentColor={scene.accentColor}
                        />
                    ) : (
                        <TipScene
                            tipNumber={scene.tipNumber!}
                            title={scene.title}
                            subtitle={scene.subtitle}
                            slideImage={scene.slideImage}
                            accentColor={scene.accentColor}
                        />
                    )}
                </Sequence>
            ))}
        </AbsoluteFill>
    );
};

export { AE_TIPS_VIDEO_DURATION } from "./data";
