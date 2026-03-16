import React from "react";
import { Sequence, Audio, staticFile, Img, AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { NARRATION_DURATIONS } from "./audioDurations";

// ─── Duration exports ───
export const RENAME_LAYER_DURATION = NARRATION_DURATIONS["RenameLayerPromo"].reduce((a, b) => a + b, 0);
export const RENAME_OBJECT_DURATION = NARRATION_DURATIONS["RenameObjectPromo"].reduce((a, b) => a + b, 0);
export const SEPARATE_TO_LAYERS_DURATION = NARRATION_DURATIONS["SeparateToLayersPromo"].reduce((a, b) => a + b, 0);
export const FILLINGER_DURATION = NARRATION_DURATIONS["FillingerPromo"].reduce((a, b) => a + b, 0);
export const MOJI_BUNKAI_DURATION = NARRATION_DURATIONS["MojiBunkaiPromo"].reduce((a, b) => a + b, 0);

// ─── Props ───
interface SingleScriptCompositionProps {
    icon: string;
    title: string;
    subtitle: string;
    features: string[];
    color: string;
    problemText: string;
    workflowSteps?: string[];
    narrationDir?: string;
    cutDurations: number[];
    conceptImage?: string;
}

function getCutStartFrames(durations: number[]): number[] {
    const starts: number[] = [0];
    for (let i = 0; i < durations.length - 1; i++) {
        starts.push(starts[i] + durations[i]);
    }
    return starts;
}

// ─── Animated floating particles background ───
const FloatingParticles: React.FC<{ color: string; count?: number }> = ({ color, count = 12 }) => {
    const frame = useCurrentFrame();
    return (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            {Array.from({ length: count }).map((_, i) => {
                const x = (i * 173 + 50) % 100;
                const baseY = (i * 137 + 20) % 100;
                const y = baseY + Math.sin((frame + i * 30) * 0.02) * 8;
                const size = 3 + (i % 4) * 2;
                const opacity = 0.08 + (i % 3) * 0.06;
                return (
                    <div key={i} style={{
                        position: "absolute", left: `${x}%`, top: `${y}%`,
                        width: size, height: size, borderRadius: "50%",
                        background: color, opacity,
                        transform: `scale(${1 + Math.sin((frame + i * 40) * 0.03) * 0.3})`,
                    }} />
                );
            })}
        </div>
    );
};

// ─── Animated glowing line accent ───
const GlowLine: React.FC<{ color: string; position?: "top" | "bottom" }> = ({ color, position = "bottom" }) => {
    const frame = useCurrentFrame();
    const progress = interpolate(frame, [0, 40], [0, 100], { extrapolateRight: "clamp" });
    return (
        <div style={{
            position: "absolute", left: 0, right: 0, [position]: 0, height: 3,
            background: `linear-gradient(90deg, transparent 0%, ${color} ${progress}%, transparent ${Math.min(100, progress + 20)}%)`,
            boxShadow: `0 0 20px ${color}66`,
        }} />
    );
};

// ═══════════════════════════════════════════
// Cut 1: タイトル — ツール名を印象的に表示
// ═══════════════════════════════════════════
const TitleScene: React.FC<{ icon: string; title: string; subtitle: string; color: string; conceptImage?: string }> = ({
    icon, title, subtitle, color, conceptImage,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Icon bounces in first
    const iconScale = spring({ frame, fps, config: { damping: 8, mass: 0.6 } });
    const iconRotate = interpolate(iconScale, [0, 1], [180, 0]);

    // Title slides up with spring (delayed 8 frames)
    const titleSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 12 } });
    const titleY = interpolate(titleSpring, [0, 1], [60, 0]);
    const titleOpacity = interpolate(frame, [8, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Subtitle fades in later (delayed 20 frames)
    const subOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const subY = interpolate(frame, [20, 35], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Background image slowly zooms in
    const imgScale = interpolate(frame, [0, 120], [1, 1.15], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill style={{
            background: `radial-gradient(ellipse at 30% 40%, ${color}18 0%, #080808 70%)`,
            justifyContent: "center", alignItems: "center",
            fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
        }}>
            <FloatingParticles color={color} />
            <GlowLine color={color} position="bottom" />

            {conceptImage && (
                <div style={{
                    position: "absolute", right: 60, bottom: 40, opacity: 0.12,
                    transform: `scale(${imgScale})`,
                }}>
                    <Img src={staticFile(conceptImage)} style={{ width: 480, height: 480, objectFit: "contain" }} />
                </div>
            )}

            <div style={{ textAlign: "center", zIndex: 1 }}>
                <div style={{
                    fontSize: 120, marginBottom: 24,
                    transform: `scale(${iconScale}) rotate(${iconRotate}deg)`,
                    filter: `drop-shadow(0 0 30px ${color}88)`,
                }}>{icon}</div>

                <h1 style={{
                    fontSize: 88, margin: 0, fontWeight: 900, color: "white",
                    textShadow: `0 0 60px ${color}55, 0 4px 20px rgba(0,0,0,0.8)`,
                    transform: `translateY(${titleY}px)`, opacity: titleOpacity,
                    letterSpacing: -1,
                }}>{title}</h1>

                <p style={{
                    fontSize: 34, marginTop: 18, color: "#aaa", fontWeight: 500,
                    transform: `translateY(${subY}px)`, opacity: subOpacity,
                    letterSpacing: 2,
                }}>{subtitle}</p>
            </div>
        </AbsoluteFill>
    );
};

// ═══════════════════════════════════════════
// Cut 2: 課題提起 — ユーザーの悩みに共感
// ═══════════════════════════════════════════
const ProblemSceneAnimated: React.FC<{ problemText: string; color: string; conceptImage?: string }> = ({
    problemText, color, conceptImage,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Card slides up with bounce
    const cardSpring = spring({ frame, fps, config: { damping: 10, mass: 0.8 } });
    const cardY = interpolate(cardSpring, [0, 1], [80, 0]);

    // Emoji shakes
    const emojiRotate = Math.sin(frame * 0.15) * 5;

    // Text types in character by character
    const charsToShow = Math.floor(interpolate(frame, [15, 60], [0, problemText.length], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));
    const displayText = problemText.slice(0, charsToShow);

    // Pulsing underline
    const pulseOpacity = 0.4 + Math.sin(frame * 0.08) * 0.3;

    return (
        <AbsoluteFill style={{
            background: `linear-gradient(160deg, #0c0c0c 0%, ${color}08 100%)`,
            justifyContent: "center", alignItems: "center",
            fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif", padding: "0 80px",
        }}>
            <FloatingParticles color={color} count={8} />

            {conceptImage && (
                <div style={{ position: "absolute", left: 60, top: "50%", transform: "translateY(-50%)", opacity: 0.08 }}>
                    <Img src={staticFile(conceptImage)} style={{ width: 380, height: 380, objectFit: "contain" }} />
                </div>
            )}

            <div style={{
                transform: `translateY(${cardY}px)`,
                background: `linear-gradient(145deg, ${color}15, ${color}08)`,
                padding: "55px 75px", borderRadius: 28,
                border: `1.5px solid ${color}40`,
                boxShadow: `0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 ${color}20`,
                maxWidth: 1100, textAlign: "center", zIndex: 1,
            }}>
                <div style={{
                    fontSize: 56, marginBottom: 24,
                    transform: `rotate(${emojiRotate}deg)`,
                }}>🤔</div>

                <p style={{
                    fontSize: 46, fontWeight: 700, color: "white", margin: 0,
                    lineHeight: 1.5, minHeight: "1.5em",
                }}>
                    {displayText}
                    <span style={{ opacity: frame % 20 < 10 ? 1 : 0, color }}>|</span>
                </p>

                <div style={{
                    marginTop: 20, height: 3, borderRadius: 2,
                    background: color, opacity: pulseOpacity,
                    width: `${interpolate(frame, [15, 60], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%`,
                    transition: "width 0.1s",
                }} />
            </div>
        </AbsoluteFill>
    );
};

// ═══════════════════════════════════════════
// Cut 3: 機能紹介 — 特徴を順番にアニメーション
// ═══════════════════════════════════════════
const FeatureSceneAnimated: React.FC<{ icon: string; title: string; features: string[]; color: string; conceptImage?: string }> = ({
    icon, title, features, color, conceptImage,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Header slides in from left
    const headerSpring = spring({ frame, fps, config: { damping: 14 } });
    const headerX = interpolate(headerSpring, [0, 1], [-100, 0]);

    // Image slides in from right
    const imgSpring = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 14 } });
    const imgX = interpolate(imgSpring, [0, 1], [100, 0]);
    const imgRotate = interpolate(imgSpring, [0, 1], [10, 0]);

    return (
        <AbsoluteFill style={{
            background: "#0a0a0a",
            fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
            display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center",
            padding: "0 90px", gap: 70,
        }}>
            <FloatingParticles color={color} count={10} />
            <GlowLine color={color} position="top" />

            {/* Left: Features list */}
            <div style={{ flex: 1, maxWidth: 850, zIndex: 1 }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: 16, marginBottom: 36,
                    transform: `translateX(${headerX}px)`,
                }}>
                    <span style={{ fontSize: 56 }}>{icon}</span>
                    <span style={{ fontSize: 38, fontWeight: 800, color: "white" }}>{title}</span>
                </div>

                {features.map((feat, i) => {
                    const delay = 12 + i * 15;
                    const featSpring = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12 } });
                    const featX = interpolate(featSpring, [0, 1], [60, 0]);
                    const featOpacity = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

                    // Check mark animation
                    const checkScale = spring({ frame: Math.max(0, frame - delay - 5), fps, config: { damping: 8 } });

                    return (
                        <div key={i} style={{
                            transform: `translateX(${featX}px)`,
                            opacity: featOpacity,
                            fontSize: 34, color: "#e0e0e0", padding: "16px 20px",
                            marginBottom: 8,
                            borderLeft: `3px solid ${color}`,
                            background: `linear-gradient(90deg, ${color}10, transparent)`,
                            borderRadius: "0 12px 12px 0",
                            display: "flex", alignItems: "center", gap: 14,
                        }}>
                            <span style={{
                                color, fontSize: 22, fontWeight: 900,
                                transform: `scale(${checkScale})`,
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                width: 32, height: 32, borderRadius: "50%",
                                background: `${color}22`, border: `1.5px solid ${color}55`,
                            }}>✓</span>
                            {feat}
                        </div>
                    );
                })}
            </div>

            {/* Right: Concept image */}
            {conceptImage && (
                <div style={{
                    flex: "0 0 380px", zIndex: 1,
                    transform: `translateX(${imgX}px) rotate(${imgRotate}deg)`,
                }}>
                    <Img src={staticFile(conceptImage)} style={{
                        width: 380, height: 380, objectFit: "contain", borderRadius: 24,
                        boxShadow: `0 0 80px ${color}33, 0 20px 40px rgba(0,0,0,0.6)`,
                        border: `1px solid ${color}30`,
                    }} />
                </div>
            )}
        </AbsoluteFill>
    );
};

// ═══════════════════════════════════════════
// Cut 4: ワークフロー — 3ステップを順に表示
// ═══════════════════════════════════════════
const WorkflowSceneAnimated: React.FC<{ steps: string[]; color: string; icon: string; conceptImage?: string }> = ({
    steps, color, icon, conceptImage,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Title fades in
    const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    return (
        <AbsoluteFill style={{
            background: `linear-gradient(180deg, #0c0c0c 0%, ${color}08 100%)`,
            fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
            justifyContent: "center", alignItems: "center",
        }}>
            <FloatingParticles color={color} count={6} />
            <GlowLine color={color} position="top" />

            {conceptImage && (
                <div style={{ position: "absolute", right: 50, bottom: 50, opacity: 0.06 }}>
                    <Img src={staticFile(conceptImage)} style={{ width: 320, height: 320, objectFit: "contain" }} />
                </div>
            )}

            <div style={{ textAlign: "center", zIndex: 1 }}>
                <p style={{
                    fontSize: 30, color: "#888", marginBottom: 50, fontWeight: 600,
                    opacity: titleOpacity, letterSpacing: 4,
                    textTransform: "uppercase",
                }}>使い方はとっても簡単</p>

                <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
                    {steps.map((step, i) => {
                        const delay = 10 + i * 20;
                        const stepSpring = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 10, mass: 0.7 } });
                        const stepY = interpolate(stepSpring, [0, 1], [50, 0]);
                        const stepOpacity = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

                        // Arrow
                        const arrowDelay = delay - 8;
                        const arrowOpacity = interpolate(frame, [arrowDelay, arrowDelay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                        const arrowX = interpolate(frame, [arrowDelay, arrowDelay + 10], [-20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

                        // Active glow for current step (based on time)
                        const isActive = frame > delay + 15;
                        const glowIntensity = isActive ? 0.3 + Math.sin((frame - delay) * 0.08) * 0.15 : 0;

                        return (
                            <React.Fragment key={i}>
                                {i > 0 && (
                                    <span style={{
                                        fontSize: 36, color,
                                        opacity: arrowOpacity,
                                        transform: `translateX(${arrowX}px)`,
                                        filter: `drop-shadow(0 0 8px ${color}66)`,
                                    }}>→</span>
                                )}
                                <div style={{
                                    transform: `translateY(${stepY}px)`, opacity: stepOpacity,
                                    background: `${color}12`,
                                    border: `1.5px solid ${color}${isActive ? "88" : "44"}`,
                                    borderRadius: 20, padding: "28px 36px", minWidth: 200,
                                    boxShadow: isActive ? `0 0 30px ${color}${Math.floor(glowIntensity * 255).toString(16).padStart(2, "0")}` : "none",
                                    transition: "box-shadow 0.3s",
                                }}>
                                    <div style={{
                                        fontSize: 14, color, fontWeight: 900, marginBottom: 10,
                                        letterSpacing: 3, textTransform: "uppercase",
                                    }}>STEP {i + 1}</div>
                                    <div style={{ fontSize: 28, color: "white", fontWeight: 600 }}>{step}</div>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </AbsoluteFill>
    );
};

// ═══════════════════════════════════════════
// Main Composition (4 cuts, no CTA)
// ═══════════════════════════════════════════
export const SingleScriptComposition: React.FC<SingleScriptCompositionProps> = ({
    icon, title, subtitle, features, color, problemText,
    workflowSteps = ["選択", "実行", "完了"],
    narrationDir, cutDurations, conceptImage,
}) => {
    const starts = getCutStartFrames(cutDurations);

    return (
        <>
            {/* ── ナレーション音声トラック ── */}
            {narrationDir &&
                cutDurations.map((dur, i) => (
                    <Sequence key={`narration-${i}`} from={starts[i]} durationInFrames={dur}>
                        <Audio
                            src={staticFile(`audio/narration/${narrationDir}/cut_${String(i + 1).padStart(2, "0")}.mp3`)}
                            volume={1}
                        />
                    </Sequence>
                ))}

            {/* Cut 1: Title + Concept Image */}
            <Sequence from={starts[0]} durationInFrames={cutDurations[0]}>
                <TitleScene icon={icon} title={title} subtitle={subtitle} color={color} conceptImage={conceptImage} />
            </Sequence>

            {/* Cut 2: Problem */}
            <Sequence from={starts[1]} durationInFrames={cutDurations[1]}>
                <ProblemSceneAnimated problemText={problemText} color={color} conceptImage={conceptImage} />
            </Sequence>

            {/* Cut 3: Features + Image */}
            <Sequence from={starts[2]} durationInFrames={cutDurations[2]}>
                <FeatureSceneAnimated icon={icon} title={title} features={features} color={color} conceptImage={conceptImage} />
            </Sequence>

            {/* Cut 4: Workflow */}
            <Sequence from={starts[3]} durationInFrames={cutDurations[3]}>
                <WorkflowSceneAnimated steps={workflowSteps} color={color} icon={icon} conceptImage={conceptImage} />
            </Sequence>
        </>
    );
};

// ─── Individual Script Compositions (Illustrator) ───

export const RenameLayerPromo: React.FC = () => (
    <SingleScriptComposition
        icon="✏️" title="Rename Layer" subtitle="レイヤー名一括変更"
        features={["ダイアログで全レイヤー名を一覧表示", "一括編集してOKで即反映", "Cmd+Z で元に戻せる"]}
        color="#4CAF50" problemText="レイヤー名、一つずつ変更してませんか？"
        workflowSteps={["レイヤーを選択", "スクリプト実行", "名前を一括編集"]}
        narrationDir="RenameLayerPromo" cutDurations={NARRATION_DURATIONS["RenameLayerPromo"]}
        conceptImage="images/promo/rename_layer.webp"
    />
);

export const RenameObjectPromo: React.FC = () => (
    <SingleScriptComposition
        icon="🏷" title="Rename Object" subtitle="オブジェクト名一括変更"
        features={["選択オブジェクトの名前を一覧表示", "SVG書き出し時の ID に直結", "After Effects 連携にも便利"]}
        color="#00BCD4" problemText="SVG書き出し時、ID名が適当になってませんか？"
        workflowSteps={["オブジェクトを選択", "スクリプト実行", "名前を一括編集"]}
        narrationDir="RenameObjectPromo" cutDurations={NARRATION_DURATIONS["RenameObjectPromo"]}
        conceptImage="images/promo/rename_object.webp"
    />
);

export const SeparateToLayersPromo: React.FC = () => (
    <SingleScriptComposition
        icon="📑" title="Separate To Layers" subtitle="レイヤー分割"
        features={["オブジェクトを個別レイヤーに分割", "自動命名＋重複回避", "AEアニメーション素材に最適"]}
        color="#9C27B0" problemText="AE用にレイヤー分割、手動でやってませんか？"
        workflowSteps={["オブジェクトを選択", "スクリプト実行", "自動レイヤー分割"]}
        narrationDir="SeparateToLayersPromo" cutDurations={NARRATION_DURATIONS["SeparateToLayersPromo"]}
        conceptImage="images/promo/separate_layers.webp"
    />
);

export const FillingerPromo: React.FC = () => (
    <SingleScriptComposition
        icon="🔲" title="Fillinger" subtitle="パス充填"
        features={["パス形状にオブジェクトを自動充填", "サイズ・回転・間隔をランダム調整", "パターン背景やテクスチャに"]}
        color="#E91E63" problemText="パターン背景、手作業で並べてませんか？"
        workflowSteps={["パスとオブジェクトを選択", "スクリプト実行", "自動パターン生成"]}
        narrationDir="FillingerPromo" cutDurations={NARRATION_DURATIONS["FillingerPromo"]}
        conceptImage="images/promo/fillinger.webp"
    />
);

export const MojiBunkaiPromo: React.FC = () => (
    <SingleScriptComposition
        icon="🔤" title="Moji Bunkai" subtitle="文字を分解する"
        features={["テキストを1文字ずつ分解", "フォント・位置・書式を保持", "タイポグラフィ作品や AE 素材に"]}
        color="#FFC107" problemText="文字アニメ用に1文字ずつ分解してませんか？"
        workflowSteps={["テキストを選択", "スクリプト実行", "1文字ずつ自動分解"]}
        narrationDir="MojiBunkaiPromo" cutDurations={NARRATION_DURATIONS["MojiBunkaiPromo"]}
        conceptImage="images/promo/moji_bunkai.webp"
    />
);
