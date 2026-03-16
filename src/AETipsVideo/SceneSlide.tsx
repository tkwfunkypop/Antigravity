import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";

interface SceneSlideProps {
    imagePath: string;
}

/**
 * AI生成画像をメインエリアに表示するスライドコンポーネント
 * フェードイン + 微妙なズームイン（Ken Burns 風）
 * TipCard（上部）とTitleBar（下部）の間に収まるよう配置
 */
export const SceneSlide: React.FC<SceneSlideProps> = ({ imagePath }) => {
    const frame = useCurrentFrame();

    const opacity = interpolate(frame, [0, 15], [0, 1], {
        extrapolateRight: "clamp",
    });

    // ゆっくりズームイン (Ken Burns effect)
    const scale = interpolate(frame, [0, 300], [1.0, 1.06], {
        extrapolateRight: "clamp",
    });

    return (
        <div
            style={{
                position: "absolute",
                top: "12%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "92%",
                height: "72%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity,
                overflow: "hidden",
                borderRadius: 16,
                boxShadow: "0 16px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
            }}
        >
            <Img
                src={staticFile(imagePath)}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    transform: `scale(${scale})`,
                }}
            />
        </div>
    );
};
