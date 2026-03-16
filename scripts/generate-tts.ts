import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const client = new ElevenLabsClient();
// Voice: Sarah (female, soft, conversational)
const VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

const SCRIPTS_DATA = {
    RenameLayerPromo: [
        "レイヤー名、一つずつ変更してませんか？",
        "RenameLayerなら、一覧表示でサクッとお名前変更。",
        "全レイヤーの名前をリスト形式で一括編集。",
        "Cmd Zで一発で元に戻せるから安心です。"
    ],
    RenameObjectPromo: [
        "SVG書き出し時、ID名が適当になってませんか？",
        "RenameObjectなら、一覧表示でサクッとお名前変更。",
        "選択したオブジェクトの名前をリスト形式で一括編集。",
        "クリーンなSVG書き出しにとっても便利。"
    ],
    SeparateToLayersPromo: [
        "IllustratorやAfter Effects用にレイヤー分割、手動でやってませんか？",
        "SeparateToLayersなら、選択オブジェクトを自動で個別レイヤーに。",
        "自動で連番などの名前を付けつつ、重複も回避。",
        "AEでのアニメーション制作が格段にスピードアップ。"
    ],
    FillingerPromo: [
        "パターン背景、手作業で並べてませんか？",
        "Fillingerなら、パス形状に合わせてオブジェクトを自動充填。",
        "サイズや回転、間隔もランダムに調整可能。",
        "複雑なテクスチャや背景があっという間に完成します。"
    ],
    MojiBunkaiPromo: [
        "文字アニメ用に1文字ずつ分解してませんか？",
        "MojiBunkaiなら、ワンクリックでテキストを分解。",
        "フォントと位置を維持したまま分解。",
        "テキストを選択して、一文字ずつ自動分解"
    ],
    // ── After Effects Scripts ──
    AEVisualBrowserPromo: [
        "AEで画像を直接プレビュー、ビジュアルブラウザ",
        "エクスプローラーから画像を探すの、面倒じゃないですか？",
        "AE内で画像をサムネイル表示。ワンクリックで読み込み。",
        "直感的なUIで素材管理を劇的に効率化。"
    ],
    AEFileCollectorPromo: [
        "プロジェクト素材を一括収集、ファイルコレクター",
        "納品時に素材のリンク切れ、困っていませんか？",
        "使用素材だけを自動でひとまとめに抽出。",
        "ワンクリックでクリーンなフォルダを生成。"
    ],
    DirectGIFExportPromo: [
        "ワンクリックで高画質GIF化、ダイレクトGIFエキスポート",
        "一度MP4で出してからGIF変換、面倒じゃないですか？",
        "AEから直接、高品質なGIFアニメを書き出せます。",
        "背景透過にも対応。SNS用素材作りに最適。"
    ],
    LayerSplitterPromo: [
        "設定した時間でレイヤー分割、レイヤースプリッター",
        "マーカー位置でイチイチ分割するの、疲れませんか？",
        "一定間隔やコンポマーカー位置で自動スライス。",
        "一括でサクッと分割完了。Vlog編集にも便利。"
    ],
    NeoUtilityPromo: [
        "かゆい所に手が届く便利ツールキット、ネオユーティリティ",
        "日々のちょっとした面倒な操作、自動化しませんか？",
        "レイヤー整列、アンカーポイント中央化など機能が多数。",
        "一つのパネルに必須機能がすべて集約されています。"
    ],
    SelectLayerAtPlayheadPromo: [
        "インジケーター位置のレイヤーを選択、セレクトレイヤーアットプレイヘッド",
        "タイムラインの今見ているレイヤー、探すのに手間取っていませんか？",
        "現在の時間にあるレイヤーだけを瞬時に一括選択。",
        "色変更やエフェクトの一括適用に手放せない機能。"
    ]
};

async function generateTTS() {
    console.log("Starting female TTS generation...");
    for (const [projectDir, scripts] of Object.entries(SCRIPTS_DATA)) {
        const outDir = path.join(process.cwd(), "public", "audio", "narration", projectDir);
        fs.mkdirSync(outDir, { recursive: true });

        for (let i = 0; i < scripts.length; i++) {
            const fileName = `cut_${String(i + 1).padStart(2, "0")}.mp3`;
            const filePath = path.join(outDir, fileName);

            if (fs.existsSync(filePath)) {
                console.log(`Skipping ${projectDir}/${fileName} - Already exists`);
                continue;
            }

            console.log(`Generating ${projectDir}/${fileName}...`);
            try {
                const audioStream = await client.textToSpeech.convert(VOICE_ID, {
                    text: scripts[i],
                    model_id: "eleven_multilingual_v2",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                        style: 0.3,
                        use_speaker_boost: true
                    }
                });

                const writeStream = fs.createWriteStream(filePath);
                for await (const chunk of audioStream) {
                    writeStream.write(chunk);
                }
                writeStream.end();
                console.log(`Saved ${filePath}`);
            } catch (error) {
                console.error(`Error generating audio for ${projectDir}/${fileName}:`, error);
            }
        }
    }
    console.log("TTS Generation Complete!");
}

generateTTS();
