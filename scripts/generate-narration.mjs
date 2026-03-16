/**
 * ElevenLabs ナレーション一括生成スクリプト
 * 
 * 全6動画×9カット = 54本の日本語ナレーションを生成
 * 
 * 使用法:
 *   node scripts/generate-narration.mjs
 *   node scripts/generate-narration.mjs --video RenameLayerPromo
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
    console.error("❌ ELEVENLABS_API_KEY が .env に設定されていません");
    process.exit(1);
}

// ── 設定 ──
const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Sarah (female, soft)
const MODEL_ID = "eleven_multilingual_v2";
const OUTPUT_BASE = path.join(__dirname, "..", "public", "audio", "narration");

// ── ナレーション原稿 ──
const NARRATION_SCRIPTS = {
    RenameLayerPromo: [
        "リネームレイヤー。レイヤー名の一括変更スクリプトです。",
        "レイヤー名、一つずつダブルクリックして変更していませんか？",
        "ダイアログで全レイヤー名を一覧で表示。",
        "テキストを直接編集して、OKで即反映されます。",
        "コマンドZで元に戻せるので安心です。",
        "シンプルなUIで、初めてでもすぐ使えます。",
        "レイヤーを選択、スクリプトを実行、名前を一括編集。たった3ステップ。",
        "無料で使える軽量スクリプト。すべてのバージョンに対応。",
        "今すぐダウンロード！プロフィールのリンクからどうぞ。",
    ],
    RenameObjectPromo: [
        "リネームオブジェクト。オブジェクト名の一括変更ツールです。",
        "SVG書き出し時にID名が適当になっていませんか？",
        "選択したオブジェクトの名前を一覧で確認できます。",
        "SVG書き出しのIDに直結するので、コードとの連携もスムーズ。",
        "アフターエフェクツとの連携にも便利です。",
        "直感的なUIで、オブジェクト名を一目で管理。",
        "オブジェクトを選択、スクリプトを実行、名前を一括編集。",
        "無料、軽量、すべてのバージョンに対応。",
        "今すぐダウンロード！プロフィールのリンクからどうぞ。",
    ],
    SeparateToLayersPromo: [
        "セパレートトゥレイヤーズ。レイヤー自動分割スクリプトです。",
        "アフターエフェクツ用にレイヤー分割、手動でやっていませんか？",
        "オブジェクトを個別のレイヤーに自動で分割します。",
        "自動で名前がつくので、重複の心配もありません。",
        "アフターエフェクツのアニメーション素材に最適です。",
        "ボタン一つで、複雑なレイヤー構造もすっきり整理。",
        "オブジェクトを選択、スクリプトを実行、自動でレイヤー分割。",
        "無料、軽量、すべてのバージョンに対応。",
        "今すぐダウンロード！プロフィールのリンクからどうぞ。",
    ],
    FillingerPromo: [
        "フィリンガー。パスにオブジェクトを自動充填するスクリプトです。",
        "パターン背景を手作業で並べていませんか？",
        "パス形状にオブジェクトを自動で充填します。",
        "サイズ、回転、間隔をランダムに調整できます。",
        "パターン背景やテクスチャ素材の作成に。",
        "直感的なUIで、複雑なパターンも簡単に作成。",
        "パスとオブジェクトを選択、スクリプトを実行、自動でパターン生成。",
        "無料、軽量、すべてのバージョンに対応。",
        "今すぐダウンロード！プロフィールのリンクからどうぞ。",
    ],
    MojiBunkaiPromo: [
        "モジブンカイ。テキストを1文字ずつ分解するスクリプトです。",
        "文字アニメーション用に、一文字ずつ手動で分解していませんか？",
        "テキストを1文字ずつ、自動で分解します。",
        "フォント、位置、書式をそのまま保持します。",
        "タイポグラフィ作品やAE素材の制作に。",
        "シンプルなUIで、複雑な文字分解も一瞬。",
        "テキストを選択、スクリプトを実行、一文字ずつ自動分解。",
        "無料、軽量、すべてのバージョンに対応。",
        "今すぐダウンロード！プロフィールのリンクからどうぞ。",
    ],
    SmartAutoCutPromo: [
        "スマートオートカット。AI搭載の自動編集ツールです。",
        "無音部分のカット、リテイク探し…面倒な作業に時間をかけていませんか？",
        "ウィスパーAIによる高精度な音声認識。",
        "無音や失敗テイクを自動で検出してカットします。",
        "ワンクリックで編集が完了。ボタン一つで全自動。",
        "AIが無音・失敗を自動検出。手作業は不要です。",
        "素材を読み込み、解析を実行、自動で編集完了。",
        "ウィスパーAI搭載、50ミリ秒の精度、プレミアプロ対応。",
        "今すぐダウンロード！プロフィールのリンクからどうぞ。",
    ],
};

// ── TTS生成関数 ──
async function generateSpeech(text, outputPath) {
    const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
            method: "POST",
            headers: {
                "xi-api-key": API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text,
                model_id: MODEL_ID,
                language_code: "ja",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.3,
                },
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    return buffer.length;
}

// ── メイン処理 ──
async function main() {
    const targetVideo = process.argv.find((arg) => arg.startsWith("--video="))
        ?.split("=")[1];

    const videos = targetVideo
        ? { [targetVideo]: NARRATION_SCRIPTS[targetVideo] }
        : NARRATION_SCRIPTS;

    if (targetVideo && !NARRATION_SCRIPTS[targetVideo]) {
        console.error(`❌ 不明な動画名: ${targetVideo}`);
        console.error(`   利用可能: ${Object.keys(NARRATION_SCRIPTS).join(", ")}`);
        process.exit(1);
    }

    let totalGenerated = 0;
    let totalSize = 0;

    for (const [videoName, scripts] of Object.entries(videos)) {
        const videoDir = path.join(OUTPUT_BASE, videoName);
        fs.mkdirSync(videoDir, { recursive: true });

        console.log(`\n🎬 ${videoName} (${scripts.length} cuts)`);
        console.log("─".repeat(50));

        for (let i = 0; i < scripts.length; i++) {
            const cutNum = String(i + 1).padStart(2, "0");
            const outputPath = path.join(videoDir, `cut_${cutNum}.mp3`);
            const text = scripts[i];

            // 既存ファイルはスキップ
            if (fs.existsSync(outputPath)) {
                const stat = fs.statSync(outputPath);
                if (stat.size > 1000) {
                    console.log(`  ⏭ Cut ${cutNum}: スキップ（既存）`);
                    continue;
                }
            }

            process.stdout.write(`  🔊 Cut ${cutNum}: "${text.slice(0, 30)}..." `);

            try {
                const size = await generateSpeech(text, outputPath);
                const sizeKB = (size / 1024).toFixed(1);
                console.log(`✅ (${sizeKB} KB)`);
                totalGenerated++;
                totalSize += size;
            } catch (err) {
                console.log(`❌ ${err.message}`);
            }

            // Rate limit対策: 0.5秒待機
            await new Promise((r) => setTimeout(r, 500));
        }
    }

    console.log(`\n${"═".repeat(50)}`);
    console.log(`✅ 完了！ ${totalGenerated} files generated (${(totalSize / 1024 / 1024).toFixed(1)} MB)`);
    console.log(`📁 出力先: ${OUTPUT_BASE}`);
}

main().catch(console.error);
