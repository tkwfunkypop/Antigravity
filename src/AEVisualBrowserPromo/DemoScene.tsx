import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    interpolate,
    spring,
    useVideoConfig,
} from "remotion";

/** デモ風UIモックアップシーン */
export const DemoScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const panelSpring = spring({
        frame,
        fps,
        config: { damping: 15, stiffness: 80 },
    });

    // Mock thumbnails data
    const thumbs = [
        { name: "City_Shot.mov", type: "video", color: "#2a4a6a" },
        { name: "Logo_Comp", type: "comp", color: "#4a2a6a" },
        { name: "Texture_BG.png", type: "image", color: "#2a5a4a" },
        { name: "Ocean_Clip.mp4", type: "video", color: "#2a3a5a" },
        { name: "Title_Card", type: "comp", color: "#5a3a4a" },
        { name: "Dust_FX.mov", type: "video", color: "#3a3a3a" },
        { name: "BG_Gradient.psd", type: "image", color: "#4a4a2a" },
        { name: "Main_Comp", type: "comp", color: "#3a2a5a" },
        { name: "SFX_Impact.wav", type: "audio", color: "#2a4a4a" },
    ];

    // Selection box animation
    const selectionBoxProgress = interpolate(frame, [70, 110], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Selected items highlight
    const selectedIndices = [3, 4, 5, 7]; // items that get selected by the box
    const selectionActive = frame > 110;

    // Search animation
    const searchText = "Logo";
    const searchChars = Math.min(
        Math.floor(interpolate(frame, [130, 155], [0, searchText.length], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })),
        searchText.length
    );

    const showSearchResults = frame > 155;

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #0a0a20 0%, #0f1030 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
            }}
        >
            {/* AE-style panel mockup */}
            <div
                style={{
                    transform: `scale(${panelSpring * 0.95 + 0.05})`,
                    width: 900,
                    background: "#1e1e2e",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 20px 80px rgba(0,0,0,0.6), 0 0 40px rgba(100,120,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.08)",
                }}
            >
                {/* Panel header */}
                <div
                    style={{
                        background: "#292940",
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    <div
                        style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#a0a8c0",
                        }}
                    >
                        🖼 AE Visual Browser
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f5f" }} />
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffbd2e" }} />
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
                    </div>
                </div>

                {/* Search bar */}
                <div
                    style={{
                        padding: "10px 14px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    <div
                        style={{
                            background: "#14142a",
                            borderRadius: 8,
                            padding: "8px 14px",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            border: frame > 125 ? "1px solid rgba(100,150,255,0.5)" : "1px solid rgba(255,255,255,0.08)",
                        }}
                    >
                        <span style={{ color: "#666", fontSize: 14 }}>🔍</span>
                        <span
                            style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 14,
                                color: frame > 125 ? "#a0c0ff" : "#555",
                            }}
                        >
                            {frame > 125 ? searchText.slice(0, searchChars) : "検索..."}
                            {frame > 125 && frame < 160 && frame % 15 < 8 && (
                                <span style={{ color: "#5080ff" }}>|</span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Breadcrumb */}
                <div style={{ padding: "6px 14px", display: "flex", gap: 6 }}>
                    <span style={{ color: "#5080ff", fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
                        Root
                    </span>
                    <span style={{ color: "#444", fontSize: 13 }}>›</span>
                    <span style={{ color: "#888", fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
                        Footage
                    </span>
                </div>

                {/* Thumbnail grid */}
                <div
                    style={{
                        padding: "8px 14px 16px",
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 10,
                        position: "relative",
                    }}
                >
                    {thumbs.map((t, i) => {
                        const thumbDelay = 10 + i * 4;
                        const thumbOpacity = interpolate(frame - thumbDelay, [0, 10], [0, 1], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        });
                        const isSelected = selectionActive && selectedIndices.includes(i);
                        const isSearchResult = showSearchResults && t.name.includes("Logo");

                        // Dim non-results during search
                        const searchDim = showSearchResults && !isSearchResult ? 0.3 : 1;

                        return (
                            <div
                                key={i}
                                style={{
                                    opacity: thumbOpacity * searchDim,
                                    background: t.color,
                                    borderRadius: 8,
                                    aspectRatio: "16/10",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: isSelected
                                        ? "2px solid #5090ff"
                                        : isSearchResult
                                            ? "2px solid #50ff90"
                                            : "1px solid rgba(255,255,255,0.06)",
                                    boxShadow: isSelected
                                        ? "0 0 16px rgba(80,144,255,0.4)"
                                        : isSearchResult
                                            ? "0 0 16px rgba(80,255,144,0.3)"
                                            : "none",
                                    transition: "border 0.3s, box-shadow 0.3s",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                {/* Type badge */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 4,
                                        right: 4,
                                        background: "rgba(0,0,0,0.5)",
                                        borderRadius: 4,
                                        padding: "1px 5px",
                                        fontSize: 10,
                                        color: "#aaa",
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                >
                                    {t.type === "video" ? "🎬" : t.type === "comp" ? "🎨" : t.type === "audio" ? "🔊" : "🖼"}
                                </div>

                                <div
                                    style={{
                                        fontFamily: "'Inter', sans-serif",
                                        fontSize: 11,
                                        color: "rgba(255,255,255,0.8)",
                                        textAlign: "center",
                                        padding: "0 8px",
                                        marginTop: 30,
                                    }}
                                >
                                    {t.name}
                                </div>
                            </div>
                        );
                    })}

                    {/* Selection box overlay */}
                    {frame >= 70 && frame <= 115 && (
                        <div
                            style={{
                                position: "absolute",
                                left: `${30 + selectionBoxProgress * 10}%`,
                                top: `${15}%`,
                                width: `${selectionBoxProgress * 55}%`,
                                height: `${selectionBoxProgress * 70}%`,
                                border: "1px solid rgba(80,144,255,0.7)",
                                background: "rgba(80,144,255,0.1)",
                                borderRadius: 2,
                                pointerEvents: "none",
                            }}
                        />
                    )}
                </div>

                {/* Status bar */}
                <div
                    style={{
                        padding: "8px 14px",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        display: "flex",
                        justifyContent: "space-between",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 12,
                        color: "#666",
                    }}
                >
                    <span>
                        {showSearchResults
                            ? "🔍 2 件見つかりました"
                            : selectionActive
                                ? "🔲 4 items selected"
                                : "9 items"}
                    </span>
                    <span>Footage</span>
                </div>
            </div>

            {/* Floating label */}
            {frame >= 70 && frame <= 120 && (
                <div
                    style={{
                        position: "absolute",
                        top: 120,
                        right: 200,
                        background: "rgba(80,144,255,0.9)",
                        color: "#fff",
                        padding: "10px 20px",
                        borderRadius: 10,
                        fontFamily: "'Noto Sans JP', sans-serif",
                        fontSize: 22,
                        fontWeight: 700,
                        opacity: interpolate(frame, [70, 80, 115, 120], [0, 1, 1, 0], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        }),
                    }}
                >
                    ドラッグで範囲選択！
                </div>
            )}

            {frame > 125 && (
                <div
                    style={{
                        position: "absolute",
                        top: 120,
                        right: 200,
                        background: "rgba(80,255,144,0.9)",
                        color: "#1a3a1a",
                        padding: "10px 20px",
                        borderRadius: 10,
                        fontFamily: "'Noto Sans JP', sans-serif",
                        fontSize: 22,
                        fontWeight: 700,
                        opacity: interpolate(frame, [130, 140, 175, 180], [0, 1, 1, 0], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        }),
                    }}
                >
                    リアルタイム検索！
                </div>
            )}
        </AbsoluteFill>
    );
};
