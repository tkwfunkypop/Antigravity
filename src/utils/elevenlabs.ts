/**
 * ElevenLabs AI音声生成ユーティリティ
 * 
 * 日本語ナレーション生成に最適化された設定
 */

// ElevenLabs API設定
export const ELEVENLABS_CONFIG = {
    // モデルID（日本語対応）
    modelId: "eleven_multilingual_v2",

    // 推奨ボイス設定
    voiceSettings: {
        // 安定性（0.0-1.0）: 高いほど一貫性のある音声
        stability: 0.5,
        // 明瞭さ（0.0-1.0）: 高いほどクリアな音声
        similarityBoost: 0.75,
        // スタイル誇張（0.0-1.0）: 高いほど感情表現が豊か
        styleExaggeration: 0.3,
    },

    // 出力形式
    outputFormat: "mp3_44100_128" as const,
};

/**
 * ナレーションスクリプトの行
 */
export interface NarrationScriptLine {
    /** テキスト内容 */
    text: string;
    /** 音声ファイル名（生成後に設定） */
    audioFilename?: string;
    /** 開始時間（秒） */
    startTime?: number;
    /** 推定再生時間（秒） */
    estimatedDuration?: number;
}

/**
 * テキストから推定再生時間を計算（日本語対応）
 * 
 * @param text ナレーションテキスト
 * @param wordsPerMinute 1分あたりの読み上げ文字数（日本語のデフォルト: 300文字/分）
 * @returns 推定再生時間（秒）
 */
export function estimateDuration(text: string, wordsPerMinute = 300): number {
    // 日本語は文字数でカウント
    const charCount = text.replace(/[^\S]/g, "").length;
    const durationInMinutes = charCount / wordsPerMinute;
    return Math.ceil(durationInMinutes * 60);
}

/**
 * 秒をフレーム数に変換
 * 
 * @param seconds 秒数
 * @param fps フレームレート（デフォルト: 30fps）
 * @returns フレーム数
 */
export function secondsToFrames(seconds: number, fps = 30): number {
    return Math.round(seconds * fps);
}

/**
 * フレーム数を秒に変換
 * 
 * @param frames フレーム数
 * @param fps フレームレート（デフォルト: 30fps）
 * @returns 秒数
 */
export function framesToSeconds(frames: number, fps = 30): number {
    return frames / fps;
}

/**
 * ナレーションスクリプトからタイミングデータを生成
 * 
 * @param script ナレーションスクリプト行の配列
 * @param fps フレームレート
 * @param gapBetweenLines 行間のギャップ（フレーム）
 * @returns タイミング情報付きのスクリプト
 */
export function generateNarrationTimings(
    script: NarrationScriptLine[],
    fps = 30,
    gapBetweenLines = 15
): NarrationScriptLine[] {
    let currentTime = 0;

    return script.map((line, index) => {
        const duration = line.estimatedDuration ?? estimateDuration(line.text);
        const result: NarrationScriptLine = {
            ...line,
            startTime: currentTime,
            estimatedDuration: duration,
            audioFilename: line.audioFilename ?? `narration_${String(index + 1).padStart(2, "0")}.mp3`,
        };

        currentTime += duration + (gapBetweenLines / fps);
        return result;
    });
}

/**
 * ElevenLabs API呼び出し用のリクエストボディを生成
 * 
 * @param text 音声化するテキスト
 * @param voiceId 使用するボイスID
 * @returns API リクエストボディ
 */
export function createTTSRequestBody(text: string, voiceId: string) {
    return {
        text,
        model_id: ELEVENLABS_CONFIG.modelId,
        voice_settings: {
            stability: ELEVENLABS_CONFIG.voiceSettings.stability,
            similarity_boost: ELEVENLABS_CONFIG.voiceSettings.similarityBoost,
            style: ELEVENLABS_CONFIG.voiceSettings.styleExaggeration,
        },
    };
}

/**
 * ElevenLabs APIのエンドポイントURL生成
 * 
 * @param voiceId 使用するボイスID
 * @returns API エンドポイントURL
 */
export function getElevenLabsEndpoint(voiceId: string): string {
    return `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
}
