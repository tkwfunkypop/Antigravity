import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

// フォトリアルフォルダ構造
const folders = [
    { name: "Collected_Project", depth: 0, type: "root", color: "#00ffaa" },
    { name: "Footage", depth: 1, type: "folder", color: "#00ddff" },
    { name: "IMAGE", depth: 2, type: "sub", color: "#66aaff" },
    { name: "MOVIE", depth: 2, type: "sub", color: "#66aaff" },
    { name: "AUDIO", depth: 2, type: "sub", color: "#66aaff" },
    { name: "SE", depth: 3, type: "audio", color: "#ff88dd" },
    { name: "BGM", depth: 3, type: "audio", color: "#ff88dd" },
    { name: "_BackUP", depth: 1, type: "backup", color: "#ffaa66" },
    { name: "Reports", depth: 1, type: "report", color: "#aaff66" },
];

// メタリックフォルダアイコン
const MetallicFolder: React.FC<{ color: string; size: number }> = ({ color, size }) => {
    return (
        <div
            style={{
                width: size,
                height: size * 0.75,
                position: "relative",
            }}
        >
            {/* フォルダ本体 */}
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "85%",
                    bottom: 0,
                    borderRadius: `${size * 0.1}px`,
                    background: `
                        linear-gradient(180deg, 
                            ${color} 0%, 
                            ${color}cc 30%,
                            ${color}88 70%,
                            ${color}66 100%
                        )
                    `,
                    boxShadow: `
                        0 ${size * 0.15}px ${size * 0.3}px rgba(0, 0, 0, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.3),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                    `,
                }}
            />
            {/* フォルダタブ */}
            <div
                style={{
                    position: "absolute",
                    width: "45%",
                    height: "20%",
                    top: 0,
                    left: 0,
                    borderRadius: `${size * 0.08}px ${size * 0.08}px 0 0`,
                    background: `
                        linear-gradient(180deg, 
                            ${color} 0%, 
                            ${color}dd 100%
                        )
                    `,
                }}
            />
        </div>
    );
};

export const Folder3DScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleOpacity = interpolate(frame, [0, 25], [0, 1], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: `
                    radial-gradient(ellipse at 50% 30%, #081520 0%, #040a10 50%, #020508 100%)
                `,
                overflow: "hidden",
            }}
        >
            {/* 大気効果 */}
            <div
                style={{
                    position: "absolute",
                    width: 600,
                    height: 600,
                    left: "60%",
                    top: "40%",
                    borderRadius: "50%",
                    background: `
                        radial-gradient(ellipse at center, 
                            rgba(0, 255, 150, 0.08) 0%, 
                            transparent 60%
                        )
                    `,
                    filter: "blur(50px)",
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
                        linear-gradient(90deg, rgba(0, 255, 200, 0.04) 1px, transparent 1px),
                        linear-gradient(rgba(0, 255, 200, 0.04) 1px, transparent 1px)
                    `,
                    backgroundSize: "100px 100px",
                    maskImage: "linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%)",
                }}
            />

            {/* タイトル */}
            <div
                style={{
                    position: "absolute",
                    top: 60,
                    width: "100%",
                    textAlign: "center",
                    opacity: titleOpacity,
                }}
            >
                <div style={{
                    fontSize: 18,
                    color: "#66ffcc",
                    fontFamily: "monospace",
                    letterSpacing: 8,
                    marginBottom: 12,
                }}>
                    [ FILE SYSTEM ]
                </div>
                <div style={{
                    fontSize: 54,
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
                    filter: "drop-shadow(0 5px 20px rgba(0, 255, 150, 0.3))",
                }}>
                    整理されたフォルダ構造
                </div>
            </div>

            {/* フォルダツリー */}
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-60%, -35%)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                }}
            >
                {folders.map((folder, index) => {
                    const delay = 20 + index * 7;

                    const itemProgress = spring({
                        frame: frame - delay,
                        fps,
                        config: { damping: 14, stiffness: 90 },
                    });

                    return (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 15,
                                paddingLeft: folder.depth * 35,
                                transform: `translateX(${(1 - itemProgress) * -80}px)`,
                                opacity: itemProgress,
                            }}
                        >
                            {/* 接続ライン */}
                            {folder.depth > 0 && (
                                <div
                                    style={{
                                        width: 20,
                                        height: 2,
                                        background: `linear-gradient(90deg, ${folder.color}40, ${folder.color})`,
                                        marginRight: -10,
                                    }}
                                />
                            )}

                            {/* メタリックフォルダ */}
                            <MetallicFolder color={folder.color} size={28} />

                            {/* フォルダ名 */}
                            <div
                                style={{
                                    fontSize: 22,
                                    fontWeight: 600,
                                    color: folder.color,
                                    fontFamily: "'JetBrains Mono', monospace",
                                    textShadow: `0 0 20px ${folder.color}40`,
                                }}
                            >
                                {folder.name}/
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 情報パネル */}
            <div
                style={{
                    position: "absolute",
                    right: 80,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 260,
                    background: `
                        linear-gradient(180deg, 
                            rgba(20, 30, 40, 0.95) 0%, 
                            rgba(15, 25, 35, 0.95) 100%
                        )
                    `,
                    borderRadius: 12,
                    border: "1px solid rgba(0, 255, 200, 0.2)",
                    boxShadow: `
                        0 20px 40px rgba(0, 0, 0, 0.4),
                        0 0 30px rgba(0, 255, 200, 0.05),
                        inset 0 1px 0 rgba(255, 255, 255, 0.05)
                    `,
                    padding: 25,
                    opacity: interpolate(frame, [60, 80], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    }),
                }}
            >
                <div
                    style={{
                        fontSize: 14,
                        color: "#66ffcc",
                        fontFamily: "monospace",
                        marginBottom: 20,
                        letterSpacing: 2,
                        borderBottom: "1px solid rgba(0, 255, 200, 0.2)",
                        paddingBottom: 15,
                    }}
                >
                    SYSTEM STATUS
                </div>
                {[
                    { label: "FOLDERS", value: "9", color: "#00ffaa" },
                    { label: "STATUS", value: "ORGANIZED", color: "#66ff66" },
                    { label: "LINKS", value: "SYNCED", color: "#66ddff" },
                ].map((info, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 12,
                            fontSize: 14,
                            fontFamily: "monospace",
                        }}
                    >
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>{info.label}</span>
                        <span style={{ color: info.color, fontWeight: 600 }}>{info.value}</span>
                    </div>
                ))}
            </div>

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
