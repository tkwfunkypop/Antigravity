import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig, Audio, staticFile } from "remotion";
import { LyricLine, lyrics as defaultLyrics } from "../data/lyrics";
import { EffectRouter } from "../components/EffectRouter";
import { NarrationAudio, NarrationTrackData } from "../components/NarrationAudio";
import { CyberpunkBackground } from "../components/CyberpunkBackground";

/**
 * AI自動生成動画のプロパティ
 */
export interface AIGeneratedVideoProps {
    /** 歌詞/テロップデータ（省略時はデフォルト使用） */
    lyrics?: LyricLine[];
    /** ナレーショントラック（オプション） */
    narrationTracks?: NarrationTrackData[];
    /** BGMファイル名（publicディレクトリからの相対パス） */
    bgmPath?: string;
    /** BGM音量（0-1） */
    bgmVolume?: number;
    /** 背景色 */
    backgroundColor?: string;
    /** サイバーパンク背景を使用するか */
    useCyberpunkBackground?: boolean;
}

/**
 * AI自動生成動画のデフォルト時間（30秒 @ 30fps）
 */
export const AI_GENERATED_VIDEO_DURATION = 900;

/**
 * AIGeneratedVideo - AI主導の動画生成テンプレート
 * 
 * 歌詞データ、ナレーション、BGMをpropsで受け取り、
 * 自動的にタイミングを計算してシーケンスを組み立てるデータ駆動型コンポジション。
 * 
 * @example
 * ```tsx
 * <AIGeneratedVideo 
 *   lyrics={myLyrics}
 *   narrationTracks={narrationData}
 *   bgmPath="audio/bgm.mp3"
 *   bgmVolume={0.3}
 * />
 * ```
 */
export const AIGeneratedVideo: React.FC<AIGeneratedVideoProps> = ({
    lyrics = defaultLyrics,
    narrationTracks = [],
    bgmPath,
    bgmVolume = 0.5,
    backgroundColor = "#0a0a0a",
    useCyberpunkBackground = true,
}) => {
    const { fps } = useVideoConfig();

    return (
        <AbsoluteFill style={{ backgroundColor }}>
            {/* 背景レイヤー */}
            {useCyberpunkBackground && <CyberpunkBackground />}

            {/* BGMレイヤー */}
            {bgmPath && (
                <Audio
                    src={staticFile(bgmPath)}
                    volume={bgmVolume}
                />
            )}

            {/* ナレーションレイヤー */}
            {narrationTracks.length > 0 && (
                <NarrationAudio tracks={narrationTracks} audioDirectory="audio/narration" />
            )}

            {/* 歌詞/テロップレイヤー */}
            <AbsoluteFill
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    paddingBottom: 100,
                }}
            >
                {lyrics.map((line, index) => {
                    const startFrame = Math.round(line.time * fps);
                    const durationFrames = Math.round(line.duration * fps);

                    return (
                        <Sequence
                            key={`lyric-${index}`}
                            from={startFrame}
                            durationInFrames={durationFrames}
                        >
                            <EffectRouter line={line} />
                        </Sequence>
                    );
                })}
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
