import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    Sequence,
} from "remotion";

// 機能データ
const features = [
    { icon: "📦", label: "自動収集", code: "AUTO_COLLECT", desc: "使用中フッテージを自動検出・収集" },
    { icon: "📂", label: "フォルダ整理", code: "ORGANIZE", desc: "IMAGE/MOVIE/AUDIO別に自動分類" },
    { icon: "🔗", label: "リンク維持", code: "LINK_SYNC", desc: "プロジェクト内リンクを自動更新" },
    { icon: "💾", label: "バックアップ", code: "BACKUP", desc: "オリジナルプロジェクトを安全に保存" },
    { icon: "📊", label: "レポート", code: "REPORT", desc: "フォント・欠落ファイル一覧を生成" },
    { icon: "🎯", label: "パネル整理", code: "PANEL_ORG", desc: "プロジェクトパネルを自動整理" },
];

// ターミナルライン
const TerminalLine: React.FC<{
    text: string;
    delay: number;
    color?: string;
}> = ({ text, delay, color = "#66ffaa" }) => {
    const frame = useCurrentFrame();
    const chars = text.length;
    const typedChars = Math.min(
        chars,
        Math.max(0, Math.floor((frame - delay) * 1.5))
    );
    const displayText = text.slice(0, typedChars);
    const showCursor = frame > delay && typedChars < chars;

    if (frame < delay) return null;

    return (
        <div style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 16,
            color: color,
            marginBottom: 4,
        }}>
            <span style={{ color: "#888" }}>{">"} </span>
            {displayText}
            {showCursor && <span style={{ opacity: frame % 10 > 5 ? 1 : 0 }}>▌</span>}
        </div>
    );
};

// 機能モジュールカード
const FeatureModule: React.FC<{
    feature: typeof features[0];
    index: number;
    startFrame: number;
}> = ({ feature, index, startFrame }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const moduleDelay = startFrame + index * 25;

    const progress = spring({
        frame: frame - moduleDelay,
        fps,
        config: { damping: 15, stiffness: 80 },
    });

    const loadProgress = interpolate(
        frame - moduleDelay,
        [0, 40],
        [0, 100],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    const isLoaded = loadProgress >= 100;
    const glowPulse = isLoaded ? 0.5 + Math.sin(frame * 0.15 + index) * 0.3 : 0;

    if (frame < moduleDelay - 5) return null;

    return (
        <div
            style={{
                width: 320,
                background: `
                    linear-gradient(180deg,
                        rgba(10, 20, 30, 0.95) 0%,
                        rgba(5, 15, 25, 0.98) 100%
                    )
                `,
                border: `1px solid ${isLoaded ? "#00ffaa40" : "#ffffff10"}`,
                borderRadius: 8,
                padding: 20,
                transform: `scale(${progress}) translateY(${(1 - progress) * 30}px)`,
                opacity: progress,
                boxShadow: isLoaded
                    ? `0 0 30px rgba(0, 255, 170, ${glowPulse * 0.3}), inset 0 0 20px rgba(0, 255, 170, 0.05)`
                    : "0 10px 30px rgba(0,0,0,0.3)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* ロードプログレスバー */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: `${loadProgress}%`,
                    height: 2,
                    background: isLoaded
                        ? "linear-gradient(90deg, #00ffaa, #00ddff)"
                        : "linear-gradient(90deg, #ffaa00, #ff6600)",
                    boxShadow: `0 0 10px ${isLoaded ? "#00ffaa" : "#ffaa00"}`,
                }}
            />

            {/* ヘッダー */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15,
                paddingBottom: 12,
                borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
                <div style={{
                    fontSize: 12,
                    fontFamily: "monospace",
                    color: isLoaded ? "#00ffaa" : "#ffaa00",
                    letterSpacing: 2,
                }}>
                    MODULE_{feature.code}
                </div>
                <div style={{
                    fontSize: 11,
                    fontFamily: "monospace",
                    color: isLoaded ? "#00ffaa" : "#888",
                    background: isLoaded ? "rgba(0,255,170,0.15)" : "rgba(255,170,0,0.15)",
                    padding: "3px 8px",
                    borderRadius: 3,
                }}>
                    {isLoaded ? "LOADED" : `${Math.floor(loadProgress)}%`}
                </div>
            </div>

            {/* アイコンとラベル */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 15,
                marginBottom: 12,
            }}>
                <div style={{
                    fontSize: 40,
                    filter: isLoaded ? "none" : "grayscale(0.5) opacity(0.6)",
                }}>
                    {feature.icon}
                </div>
                <div>
                    <div style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#ffffff",
                        fontFamily: "'Noto Sans JP', sans-serif",
                    }}>
                        {feature.label}
                    </div>
                    <div style={{
                        fontSize: 11,
                        color: "#66aaff",
                        fontFamily: "monospace",
                        letterSpacing: 1,
                    }}>
                        {feature.code}
                    </div>
                </div>
            </div>

            {/* 説明 */}
            <div style={{
                fontSize: 14,
                color: "rgba(200, 220, 255, 0.8)",
                fontFamily: "'Noto Sans JP', sans-serif",
                lineHeight: 1.5,
                opacity: isLoaded ? 1 : 0.5,
            }}>
                {feature.desc}
            </div>
        </div>
    );
};

export const Features3DScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleOpacity = interpolate(frame, [0, 25], [0, 1], {
        extrapolateRight: "clamp",
    });

    // 全モジュールロード完了チェック
    const allLoaded = frame > 200;
    const systemGlow = allLoaded ? 0.4 + Math.sin(frame * 0.1) * 0.2 : 0;

    return (
        <AbsoluteFill
            style={{
                background: `
                    radial-gradient(ellipse at 50% 20%, #081520 0%, #040a12 50%, #020508 100%)
                `,
                overflow: "hidden",
            }}
        >
            {/* 背景グロー */}
            <div
                style={{
                    position: "absolute",
                    width: 1000,
                    height: 600,
                    left: "50%",
                    top: "45%",
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    background: `
                        radial-gradient(ellipse at center,
                            rgba(0, 255, 170, ${systemGlow * 0.1}) 0%,
                            transparent 60%
                        )
                    `,
                    filter: "blur(60px)",
                }}
            />

            {/* グリッド床 */}
            <div
                style={{
                    position: "absolute",
                    width: 4000,
                    height: 2000,
                    left: "50%",
                    bottom: -500,
                    transform: "translateX(-50%) rotateX(75deg)",
                    background: `
                        linear-gradient(90deg, rgba(0, 255, 170, 0.03) 1px, transparent 1px),
                        linear-gradient(rgba(0, 255, 170, 0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: "100px 100px",
                    maskImage: "linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%)",
                }}
            />

            {/* ターミナルヘッダー */}
            <div
                style={{
                    position: "absolute",
                    top: 50,
                    left: 80,
                    opacity: titleOpacity,
                }}
            >
                <div style={{
                    fontSize: 14,
                    color: "#00ffaa",
                    fontFamily: "monospace",
                    marginBottom: 8,
                    letterSpacing: 2,
                }}>
                    AE_FILE_COLLECTOR v3.0
                </div>
                <TerminalLine text="Initializing system modules..." delay={10} color="#888" />
                <TerminalLine text="Loading core capabilities..." delay={30} />
                <TerminalLine text="6 modules detected" delay={50} color="#66aaff" />
            </div>

            {/* タイトル */}
            <div
                style={{
                    position: "absolute",
                    top: 50,
                    width: "100%",
                    textAlign: "center",
                    opacity: titleOpacity,
                }}
            >
                <div style={{
                    fontSize: 56,
                    fontWeight: 800,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    background: `
                        linear-gradient(180deg,
                            #ffffff 0%,
                            #aaffdd 50%,
                            #66ddaa 100%
                        )
                    `,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 5px 20px rgba(0, 255, 170, 0.3))",
                }}>
                    6つの強力な機能
                </div>
                <div style={{
                    fontSize: 16,
                    color: "#66ffaa",
                    fontFamily: "monospace",
                    marginTop: 10,
                    letterSpacing: 4,
                }}>
                    [ SYSTEM MODULES ]
                </div>
            </div>

            {/* 機能モジュールグリッド */}
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: 100,
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 25,
                        maxWidth: 1100,
                    }}
                >
                    {features.map((feature, index) => (
                        <FeatureModule
                            key={index}
                            feature={feature}
                            index={index}
                            startFrame={60}
                        />
                    ))}
                </div>
            </div>

            {/* システムステータス */}
            {allLoaded && (
                <div
                    style={{
                        position: "absolute",
                        bottom: 60,
                        width: "100%",
                        textAlign: "center",
                    }}
                >
                    <div style={{
                        fontSize: 18,
                        color: "#00ffaa",
                        fontFamily: "monospace",
                        letterSpacing: 4,
                        textShadow: "0 0 20px rgba(0, 255, 170, 0.5)",
                        opacity: 0.5 + Math.sin(frame * 0.1) * 0.3,
                    }}>
                        ✓ ALL MODULES LOADED - SYSTEM READY
                    </div>
                </div>
            )}

            {/* ビネット */}
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
