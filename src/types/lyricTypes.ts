import React from "react";

/**
 * テキストエフェクトの種類
 * - bounce: バウンスアニメーション
 * - fade: フェードイン/アウト
 * - glitch: グリッチエフェクト
 * - typewriter: タイプライター風
 * - neon: ネオン発光
 * - drop: 落下エフェクト
 * - wave: 波状アニメーション
 * - shake: 揺れエフェクト
 * - scalePop: ポップスケール
 */
export type EffectType =
    | "bounce"
    | "fade"
    | "glitch"
    | "typewriter"
    | "neon"
    | "drop"
    | "wave"
    | "shake"
    | "scalePop";

/**
 * テロップ・歌詞の行データ
 */
export type LyricLine = {
    /** 開始時間（秒） */
    time: number;
    /** 表示テキスト */
    text: string;
    /** 表示時間（秒） */
    duration: number;
    /** 行の種類 */
    type: "lyric" | "title" | "credit" | "section" | "narration";
    /** 適用するエフェクト */
    effect: EffectType;
    /** カスタムスタイル（オプション） */
    style?: React.CSSProperties;
};

/**
 * ナレーションオーディオトラック
 */
export type NarrationTrack = {
    /** ファイル名 */
    filename: string;
    /** 開始フレーム */
    startFrame: number;
    /** 再生時間（フレーム） */
    durationInFrames: number;
    /** 音量（0-1） */
    volume?: number;
};

/**
 * AI生成動画の入力データ
 */
export type AIVideoInput = {
    /** 歌詞/テロップデータ */
    lyrics: LyricLine[];
    /** ナレーショントラック（オプション） */
    narrationTracks?: NarrationTrack[];
    /** BGMファイルパス（オプション） */
    bgmPath?: string;
    /** 動画設定 */
    config?: {
        /** フレームレート */
        fps?: number;
        /** 動画時間（秒） */
        durationInSeconds?: number;
        /** 幅 */
        width?: number;
        /** 高さ */
        height?: number;
    };
};
