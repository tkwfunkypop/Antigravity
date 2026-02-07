import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

const folderStructure = [
    { name: "Collected_Project/", indent: 0, delay: 5 },
    { name: "├── Footage/", indent: 1, delay: 12 },
    { name: "│   ├── IMAGE/", indent: 2, delay: 19 },
    { name: "│   ├── MOVIE/", indent: 2, delay: 26 },
    { name: "│   ├── AUDIO/", indent: 2, delay: 33 },
    { name: "│   │   ├── SE/", indent: 3, delay: 40 },
    { name: "│   │   ├── BGM/", indent: 3, delay: 47 },
    { name: "│   │   └── NARR/", indent: 3, delay: 54 },
    { name: "│   └── 3D/", indent: 2, delay: 61 },
    { name: "├── _BackUP/", indent: 1, delay: 68 },
    { name: "└── Reports/", indent: 1, delay: 75 },
];

export const FolderStructureScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)",
                justifyContent: "center",
                alignItems: "center",
                padding: 80,
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 50,
                }}
            >
                {/* Title */}
                <div
                    style={{
                        fontSize: 56,
                        fontWeight: 900,
                        color: "#818cf8",
                        fontFamily: "'Noto Sans JP', sans-serif",
                        opacity: titleOpacity,
                        textShadow: "0 4px 30px rgba(129, 140, 248, 0.5)",
                    }}
                >
                    整理されたフォルダ構造
                </div>

                {/* Folder tree */}
                <div
                    style={{
                        background: "rgba(0,0,0,0.5)",
                        padding: "40px 60px",
                        borderRadius: 20,
                        border: "1px solid rgba(129,140,248,0.3)",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                    }}
                >
                    {folderStructure.map((item, index) => {
                        const itemProgress = spring({
                            frame: frame - item.delay,
                            fps,
                            config: { damping: 12, stiffness: 100 },
                        });

                        const itemX = interpolate(itemProgress, [0, 1], [-50, 0]);
                        const itemOpacity = interpolate(frame - item.delay, [0, 10], [0, 1], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        });

                        return (
                            <div
                                key={index}
                                style={{
                                    fontSize: 28,
                                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                    color: item.indent === 0 ? "#4ade80" :
                                        item.indent === 1 ? "#fbbf24" :
                                            item.indent === 2 ? "#60a5fa" : "#f472b6",
                                    opacity: itemOpacity,
                                    transform: `translateX(${itemX}px)`,
                                    padding: "6px 0",
                                }}
                            >
                                {item.name}
                            </div>
                        );
                    })}
                </div>
            </div>
        </AbsoluteFill>
    );
};
