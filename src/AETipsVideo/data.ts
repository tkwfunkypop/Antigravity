/**
 * AE Tips Video — シーンデータ定義
 *
 * 各シーンのナレーション、テロップ、スライド画像、タイミング情報を一元管理。
 * 音声ファイルは ElevenLabs バッチ生成 → ffmpeg 無音分割で作成。
 */

export interface SceneData {
    /** シーンID */
    id: string;
    /** テロップに表示するタイトル */
    title: string;
    /** テロップサブテキスト（短い説明） */
    subtitle: string;
    /** ナレーション音声ファイル名 */
    audioFile: string;
    /** 音声の長さ（秒） */
    audioDuration: number;
    /** スライド画像パス（staticFileからの相対パス） */
    slideImage?: string;
    /** テクニック番号（1〜5, null = オープニング/エンディング） */
    tipNumber?: number;
    /** アクセントカラー */
    accentColor: string;
}

/** シーン間のバッファ（フレーム数） */
export const SCENE_GAP_FRAMES = 10;

/** FPS */
export const VIDEO_FPS = 30;

/**
 * 全シーンデータ
 * 音声の長さは ffmpeg での分割結果に基づく実測値
 */
export const scenes: SceneData[] = [
    {
        id: "opening",
        title: "After Effects 便利テクニック 5選",
        subtitle: "プロが使う時短ワザを一挙公開！",
        audioFile: "narration_01.mp3",
        audioDuration: 8.46,
        accentColor: "#00d4ff",
    },
    {
        id: "tip-shortcuts",
        title: "ショートカットキー",
        subtitle: "U / J / K キーで作業スピード倍増",
        audioFile: "narration_02.mp3",
        audioDuration: 11.96,
        slideImage: "images/ae-tips/tip_01_shortcuts.png",
        tipNumber: 1,
        accentColor: "#00d4ff",
    },
    {
        id: "tip-precompose",
        title: "プリコンポーズ",
        subtitle: "レイヤーをまとめてスッキリ管理",
        audioFile: "narration_03.mp3",
        audioDuration: 8.39,
        slideImage: "images/ae-tips/tip_02_precompose.png",
        tipNumber: 2,
        accentColor: "#a855f7",
    },
    {
        id: "tip-expressions",
        title: "エクスプレッション",
        subtitle: "loopOut() と wiggle() で自動アニメーション",
        audioFile: "narration_04.mp3",
        audioDuration: 8.15,
        slideImage: "images/ae-tips/tip_03_expressions.png",
        tipNumber: 3,
        accentColor: "#22c55e",
    },
    {
        id: "tip-proxy",
        title: "プロキシの活用",
        subtitle: "重い素材でもサクサクプレビュー",
        audioFile: "narration_05.mp3",
        audioDuration: 8.07,
        slideImage: "images/ae-tips/tip_04_proxy.png",
        tipNumber: 4,
        accentColor: "#f59e0b",
    },
    {
        id: "tip-3d-mesh",
        title: "AE 2025 新機能",
        subtitle: "ネイティブ 3D メッシュでプラグイン不要",
        audioFile: "narration_06.mp3",
        audioDuration: 14.71,
        slideImage: "images/ae-tips/tip_05_3d_mesh.png",
        tipNumber: 5,
        accentColor: "#ec4899",
    },
    {
        id: "ending",
        title: "5つのテクニックで効率UP！",
        subtitle: "チャンネル登録もお願いします！",
        audioFile: "narration_07.mp3",
        audioDuration: 7.47,
        accentColor: "#00d4ff",
    },
];

/**
 * 全体の尺を計算（フレーム数）
 */
export function calculateTotalFrames(): number {
    const totalAudioSeconds = scenes.reduce((sum, s) => sum + s.audioDuration, 0);
    const totalGapSeconds = (scenes.length - 1) * (SCENE_GAP_FRAMES / VIDEO_FPS);
    return Math.ceil((totalAudioSeconds + totalGapSeconds) * VIDEO_FPS);
}

/**
 * 各シーンの開始フレームを計算
 */
export function getSceneTimings(): Array<{
    scene: SceneData;
    startFrame: number;
    durationFrames: number;
}> {
    let currentFrame = 0;
    return scenes.map((scene) => {
        const durationFrames = Math.ceil(scene.audioDuration * VIDEO_FPS);
        const result = { scene, startFrame: currentFrame, durationFrames };
        currentFrame += durationFrames + SCENE_GAP_FRAMES;
        return result;
    });
}

/** 動画の合計フレーム数 */
export const AE_TIPS_VIDEO_DURATION = calculateTotalFrames();
