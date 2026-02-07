import { Audio, Sequence, staticFile } from "remotion";
import React from "react";

// シーンの開始フレーム（30fps基準）
const SCENE_START_FRAMES = {
    title: 0,           // 0秒
    problem: 90,        // 3秒
    features: 198,      // 6.6秒 (90+120-12)
    workflow: 486,      // 16.2秒 (198+300-12)
    folder: 624,        // 20.8秒 (486+150-12)
    cta: 732,           // 24.4秒 (624+120-12)
};

// シーンの尺
const SCENE_DURATIONS = {
    title: 90,        // 3秒
    problem: 120,     // 4秒
    features: 300,    // 10秒
    workflow: 150,    // 5秒
    folder: 120,      // 4秒
    cta: 120,         // 4秒
};

interface NarrationConfig {
    filename: string;
    startFrame: number;
    durationInFrames: number;
    volume?: number;
}

const NARRATION_TRACKS: NarrationConfig[] = [
    {
        filename: "01_title.mp3",
        startFrame: SCENE_START_FRAMES.title,
        durationInFrames: SCENE_DURATIONS.title,
        volume: 1.0,
    },
    {
        filename: "02_problem.mp3",
        startFrame: SCENE_START_FRAMES.problem,
        durationInFrames: SCENE_DURATIONS.problem,
        volume: 1.0,
    },
    {
        filename: "03_features.mp3",
        startFrame: SCENE_START_FRAMES.features,
        durationInFrames: SCENE_DURATIONS.features,
        volume: 1.0,
    },
    {
        filename: "04_workflow.mp3",
        startFrame: SCENE_START_FRAMES.workflow,
        durationInFrames: SCENE_DURATIONS.workflow,
        volume: 1.0,
    },
    {
        filename: "05_folder.mp3",
        startFrame: SCENE_START_FRAMES.folder,
        durationInFrames: SCENE_DURATIONS.folder,
        volume: 1.0,
    },
    {
        filename: "06_cta.mp3",
        startFrame: SCENE_START_FRAMES.cta,
        durationInFrames: SCENE_DURATIONS.cta,
        volume: 1.0,
    },
];

/**
 * ナレーション音声コンポーネント
 * 
 * 使用方法:
 * 1. ElevenLabsで音声ファイルを生成
 * 2. public/audio/ ディレクトリに音声ファイルを配置
 * 3. このコンポーネントをメインコンポジションにインポート
 * 
 * 例:
 * import { NarrationAudio } from "./narration/NarrationAudio";
 * 
 * export const AEFileCollectorPromo3D: React.FC = () => {
 *     return (
 *         <AbsoluteFill>
 *             <NarrationAudio />
 *             <TransitionSeries>
 *                 ...
 *             </TransitionSeries>
 *         </AbsoluteFill>
 *     );
 * };
 */
export const NarrationAudio: React.FC = () => {
    return (
        <>
            {NARRATION_TRACKS.map((track, index) => (
                <Sequence
                    key={index}
                    from={track.startFrame}
                    durationInFrames={track.durationInFrames}
                >
                    <Audio
                        src={staticFile(`audio/${track.filename}`)}
                        volume={track.volume ?? 1.0}
                    />
                </Sequence>
            ))}
        </>
    );
};

/**
 * BGM用コンポーネント（オプション）
 * 
 * BGMファイルを public/audio/bgm.mp3 に配置して使用
 */
export const BackgroundMusic: React.FC<{
    filename?: string;
    volume?: number;
    startFrom?: number;
}> = ({
    filename = "bgm.mp3",
    volume = 0.3,
    startFrom = 0
}) => {
        return (
            <Audio
                src={staticFile(`audio/${filename}`)}
                volume={volume}
                startFrom={startFrom}
            />
        );
    };

/**
 * 効果音用コンポーネント
 */
export const SoundEffect: React.FC<{
    filename: string;
    startFrame: number;
    volume?: number;
}> = ({ filename, startFrame, volume = 0.8 }) => {
    return (
        <Sequence from={startFrame} durationInFrames={60}>
            <Audio
                src={staticFile(`audio/sfx/${filename}`)}
                volume={volume}
            />
        </Sequence>
    );
};
