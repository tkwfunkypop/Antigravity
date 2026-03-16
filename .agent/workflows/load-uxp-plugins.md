---
description: UXPプラグインをPremiere Proにロードする手順
---

# UXPプラグインのロード手順

// turbo-all

## 事前準備

1. Premiere Pro 2026で開発者モードを有効化
   - Premiere Pro → 設定 → プラグイン → 「開発者モードを有効にする」にチェック
   - Premiere Proを再起動

## プラグインのロード

1. Adobe UXP Developer Toolsを起動
   - `/Applications/Adobe UXP Developer Tools/Adobe UXP Developer Tools.app`

2. Premiere Pro 2026を起動して、プロジェクトを開く

3. UDTの「Developer Workspace」で「Add Plugin」をクリック

4. プラグインフォルダを選択:
   - PP-AutoCut: `/Users/takahashikenta/projects/Premiere/Plugin/PP-AutoCut-UXP/manifest.json`
   - PP-Caption: `/Users/takahashikenta/projects/Premiere/Plugin/PP-Caption-UXP/manifest.json`
   - PP-Transcriber: `/Users/takahashikenta/projects/Premiere/Plugin/PP-Transcriber-UXP/manifest.json`
   - PP-AnchorPoint: `/Users/takahashikenta/projects/Premiere/Plugin/PP-AnchorPoint-UXP/manifest.json`

5. 各プラグインの「Load & Watch」をクリック

6. Premiere Pro → ウィンドウ → UXP Plugins からプラグインパネルを表示

## バックエンドサーバー（PP-AutoCut/Transcriber用）

```bash
cd /Users/takahashikenta/projects/remotion-video/PremiereTools/backend
source venv/bin/activate
python server.py
```

## トラブルシューティング

- **プラグインが表示されない**: Premiere Proの開発者モードが有効になっているか確認
- **「Load」できない**: manifest.jsonのpathが正しいか確認
- **APIエラー**: Premiere Pro 2026 (v26.0) が必要
