

export type EffectType = "bounce" | "fade" | "glitch" | "typewriter" | "neon" | "drop";

export type LyricLine = {
    time: number; // Seconds
    text: string;
    duration: number; // Seconds
    type: "lyric" | "title" | "credit" | "section";
    effect: EffectType;
    style?: React.CSSProperties;
};

// Calibration:
// Start: 5.19s
// Chorus Start (Line 8): 40.07s
// Diff: 34.88s / 8 lines = 4.36s per line

export const lyrics: LyricLine[] = [
    // --- Verse 1 ---
    { time: 5.19, text: "錆びた街灯、揺れる影法師", duration: 3.8, type: "lyric", effect: "typewriter" },
    { time: 9.55, text: "背中合わせの嘘も今日の通行証", duration: 3.8, type: "lyric", effect: "typewriter" },
    { time: 13.91, text: "漂う虚ろ、日々は蜃気楼", duration: 3.8, type: "lyric", effect: "glitch" },
    { time: 18.27, text: "擦り切れた夢に愛を注ごう", duration: 3.8, type: "lyric", effect: "bounce" },

    { time: 22.63, text: "鏡越しの微笑みは蜃気楼", duration: 3.8, type: "lyric", effect: "glitch" },
    { time: 26.99, text: "誰かの目に映る僕の影、虚構", duration: 3.8, type: "lyric", effect: "typewriter" },
    { time: 31.35, text: "手のひらからこぼれる砂時計", duration: 3.8, type: "lyric", effect: "drop" },
    { time: 35.71, text: "消えゆく声だけが真実のフロー", duration: 3.8, type: "lyric", effect: "fade" },

    // --- Chorus 1 (Target: 40.07) ---
    { time: 40.07, text: "空蝉よ、儚く踊れ", duration: 3.8, type: "lyric", effect: "neon", style: { color: "#FF00FF" } },
    { time: 44.43, text: "夜を裂いて、明日を焦がせ", duration: 3.8, type: "lyric", effect: "neon", style: { color: "#00FFFF" } },
    { time: 48.79, text: "偽りの世界にただ一人", duration: 3.8, type: "lyric", effect: "neon" },
    { time: 53.15, text: "真実を探し続ける旅人", duration: 3.8, type: "lyric", effect: "neon", style: { fontSize: 120 } },

    // --- Verse 2 ---
    { time: 57.51, text: "流れる川は変わらぬ調べ", duration: 3.8, type: "lyric", effect: "typewriter" },
    { time: 61.87, text: "過去と現在を繋ぐ鎖の中で", duration: 3.8, type: "lyric", effect: "typewriter" },
    { time: 66.23, text: "抜け殻のままでも前に進め", duration: 3.8, type: "lyric", effect: "bounce" },
    { time: 70.59, text: "傷だらけでも、それが美学で", duration: 3.8, type: "lyric", effect: "glitch" },

    { time: 74.95, text: "深く吸い込む夜の香り", duration: 3.8, type: "lyric", effect: "fade" },
    { time: 79.31, text: "酸いも甘いも混ざるメロディ", duration: 3.8, type: "lyric", effect: "bounce" },
    { time: 83.67, text: "錆びた路地裏、月に問いかける", duration: 3.8, type: "lyric", effect: "typewriter" },
    { time: 88.03, text: "「この空蝉の心、どこへ行く？」", duration: 3.8, type: "lyric", effect: "drop", style: { color: "#FF4500" } },

    // --- Bridge ---
    { time: 92.39, text: "言葉の刃、音に刻むリズム", duration: 3.8, type: "lyric", effect: "glitch" },
    { time: 96.75, text: "椎名林檎のような毒とカリスマ", duration: 3.8, type: "lyric", effect: "neon", style: { color: "#8B0000" } },
    { time: 101.11, text: "吐き出すフレーズ、音のキャンバス", duration: 3.8, type: "lyric", effect: "typewriter" },
    { time: 105.47, text: "儚さも力に変えるアンサー", duration: 3.8, type: "lyric", effect: "bounce" },

    // --- Chorus 2 ---
    { time: 109.83, text: "空蝉よ、儚く歌え", duration: 3.8, type: "lyric", effect: "neon" },
    { time: 114.19, text: "夜を裂いて、夢を焦がせ", duration: 3.8, type: "lyric", effect: "neon" },
    { time: 118.55, text: "偽りの愛に溺れるなら", duration: 3.8, type: "lyric", effect: "neon" },
    { time: 122.91, text: "孤独な自由を抱きしめたい", duration: 3.8, type: "lyric", effect: "neon", style: { fontSize: 130 } },

    // --- Outro ---
    { time: 127.27, text: "空蝉は知ってる、終わりの足音", duration: 3.8, type: "lyric", effect: "typewriter" },
    { time: 131.63, text: "けれど消えない、胸の中の衝動", duration: 3.8, type: "lyric", effect: "glitch" },
    { time: 135.99, text: "月が沈むまで歌い続ける", duration: 3.8, type: "lyric", effect: "fade" },
    { time: 140.35, text: "真実はいつだって、この手にある", duration: 6.0, type: "lyric", effect: "neon", style: { fontSize: 100 } },
];
