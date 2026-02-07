import React from "react";
import { Sequence, Audio, staticFile } from "remotion";

/**
 * ナレーショントラックのデータ型
 */
export interface NarrationTrackData {
    /** ファイル名（publicディレクトリからの相対パス） */
    filename: string;
    /** 開始フレーム */
    startFrame: number;
    /** 再生時間（フレーム） */
    durationInFrames: number;
    /** 音量（0-1、デフォルト: 1） */
    volume?: number;
}

interface NarrationAudioProps {
    /** ナレーショントラックの配列 */
    tracks: NarrationTrackData[];
    /** 音声ファイルのベースディレクトリ（publicからの相対パス） */
    audioDirectory?: string;
}

/**
 * NarrationAudio - ナレーション音声シーケンス管理コンポーネント
 * 
 * 複数のナレーション音声ファイルを指定したタイミングで再生するRemotionコンポーネント。
 * ElevenLabsなどで生成した音声ファイルを動画内で正確に配置するために使用。
 * 
 * @example
 * ```tsx
 * const tracks: NarrationTrackData[] = [
 *   { filename: "intro.mp3", startFrame: 0, durationInFrames: 90 },
 *   { filename: "section1.mp3", startFrame: 100, durationInFrames: 150 },
 * ];
 * 
 * <NarrationAudio tracks={tracks} audioDirectory="audio/narration" />
 * ```
 */
export const NarrationAudio: React.FC<NarrationAudioProps> = ({
    tracks,
    audioDirectory = "audio",
}) => {
    return (
        <>
            {tracks.map((track, index) => {
                const audioPath = audioDirectory
                    ? `${audioDirectory}/${track.filename}`
                    : track.filename;

                return (
                    <Sequence
                        key={`narration-${index}-${track.filename}`}
                        from={track.startFrame}
                        durationInFrames={track.durationInFrames}
                    >
                        <Audio
                            src={staticFile(audioPath)}
                            volume={track.volume ?? 1}
                        />
                    </Sequence>
                );
            })}
        </>
    );
};

/**
 * トラックデータを秒単位からフレーム単位に変換するヘルパー
 * 
 * @param tracksInSeconds 秒単位のトラックデータ
 * @param fps フレームレート
 * @returns フレーム単位のトラックデータ
 */
export function convertTracksToFrames(
    tracksInSeconds: Array<{
        filename: string;
        startTime: number;
        duration: number;
        volume?: number;
    }>,
    fps = 30
): NarrationTrackData[] {
    return tracksInSeconds.map((track) => ({
        filename: track.filename,
        startFrame: Math.round(track.startTime * fps),
        durationInFrames: Math.round(track.duration * fps),
        volume: track.volume,
    }));
}
