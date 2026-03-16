import React from "react";
import { SingleScriptComposition } from "../IlScriptsPromo/SingleScriptComposition";
import { NARRATION_DURATIONS } from "../IlScriptsPromo/audioDurations";

export const AE_VISUAL_BROWSER_DURATION = NARRATION_DURATIONS["AEVisualBrowserPromo"].reduce((a, b) => a + b, 0);
export const AE_FILE_COLLECTOR_DURATION = NARRATION_DURATIONS["AEFileCollectorPromo"].reduce((a, b) => a + b, 0);
export const DIRECT_GIF_EXPORT_DURATION = NARRATION_DURATIONS["DirectGIFExportPromo"].reduce((a, b) => a + b, 0);
export const LAYER_SPLITTER_DURATION = NARRATION_DURATIONS["LayerSplitterPromo"].reduce((a, b) => a + b, 0);
export const NEO_UTILITY_DURATION = NARRATION_DURATIONS["NeoUtilityPromo"].reduce((a, b) => a + b, 0);
export const SELECT_LAYER_AT_PLAYHEAD_DURATION = NARRATION_DURATIONS["SelectLayerAtPlayheadPromo"].reduce((a, b) => a + b, 0);

export const AEVisualBrowserPromoNew: React.FC = () => (
    <SingleScriptComposition
        icon="🖼️" title="AE-VisualBrowser" subtitle="画像・映像ソースの視覚管理"
        features={["AE内で画像をサムネイル表示", "ワンクリックでコンポへ読み込み", "ドッキング可能なネイティブUI"]}
        color="#8A2BE2" problemText="エクスプローラーから画像を探すの、面倒じゃないですか？"
        workflowSteps={["フォルダを選択", "サムネイル確認", "ダブルクリックで配置"]}
        narrationDir="AEVisualBrowserPromo" cutDurations={NARRATION_DURATIONS["AEVisualBrowserPromo"]}
        conceptImage="images/promo/ae_visual_browser.webp"
    />
);

export const AEFileCollectorPromoNew: React.FC = () => (
    <SingleScriptComposition
        icon="📁" title="AEFileCollector" subtitle="使用素材の一括収集"
        features={["タイムライン上の使用素材だけを抽出", "ワンクリックでクリーンなフォルダ生成", "リンク切れ防止に最適"]}
        color="#2196F3" problemText="納品時に素材のリンク切れ、困っていませんか？"
        workflowSteps={["コンポを選択", "収集実行", "クリーンフォルダ完成"]}
        narrationDir="AEFileCollectorPromo" cutDurations={NARRATION_DURATIONS["AEFileCollectorPromo"]}
        conceptImage="images/promo/ae_file_collector.webp"
    />
);

export const DirectGIFExportPromoNew: React.FC = () => (
    <SingleScriptComposition
        icon="🎞️" title="DirectGIFExport" subtitle="ワンクリック高画質GIF出力"
        features={["AEから直接高品質なGIFアニメを出力", "FFmpegパレット最適化", "背景透過（アルファ）にも対応"]}
        color="#FF5722" problemText="一度MP4で出してからGIF変換、面倒じゃないですか？"
        workflowSteps={["コンポを選択", "画質設定", "ワンクリックでGIF出力"]}
        narrationDir="DirectGIFExportPromo" cutDurations={NARRATION_DURATIONS["DirectGIFExportPromo"]}
        conceptImage="images/promo/direct_gif_export.webp"
    />
);

export const LayerSplitterPromoNew: React.FC = () => (
    <SingleScriptComposition
        icon="✂️" title="LayerSplitter" subtitle="自動レイヤー分割"
        features={["一定間隔やマーカー位置で自動スライス", "面倒な手動分割作業を全自動化", "Vlog編集や動画スライドショーに便利"]}
        color="#F44336" problemText="マーカー位置でイチイチ分割するの、疲れませんか？"
        workflowSteps={["レイヤーを選択", "分割ルール設定", "自動スライス実行"]}
        narrationDir="LayerSplitterPromo" cutDurations={NARRATION_DURATIONS["LayerSplitterPromo"]}
        conceptImage="images/promo/layer_splitter.webp"
    />
);

export const NeoUtilityPromoNew: React.FC = () => (
    <SingleScriptComposition
        icon="🧰" title="NeoUtility" subtitle="AE用万能ツールキット"
        features={["アンカーポイント中央化等の必須機能集約", "1つのパネルで完結する設計", "かゆいところに手が届く便利機能"]}
        color="#4CAF50" problemText="日々のちょっとした面倒な操作、自動化しませんか？"
        workflowSteps={["レイヤーを選択", "パネルから機能を選ぶ", "瞬時に適用"]}
        narrationDir="NeoUtilityPromo" cutDurations={NARRATION_DURATIONS["NeoUtilityPromo"]}
        conceptImage="images/promo/neo_utility.webp"
    />
);

export const SelectLayerAtPlayheadPromoNew: React.FC = () => (
    <SingleScriptComposition
        icon="🎯" title="Select Layer At Playhead" subtitle="インジケーター位置のレイヤー選択"
        features={["現在の時間にあるレイヤーだけを瞬時に一括選択", "色変更やエフェクトの一括適用に最適", "タイムラインの迷子を防止"]}
        color="#FFEB3B" problemText="タイムラインの今見ているレイヤー、探すのに手間取っていませんか？"
        workflowSteps={["時間を合わせる", "ショートカット実行", "対象レイヤーのみ選択完了"]}
        narrationDir="SelectLayerAtPlayheadPromo" cutDurations={NARRATION_DURATIONS["SelectLayerAtPlayheadPromo"]}
        conceptImage="images/promo/select_layer_playhead.webp"
    />
);
