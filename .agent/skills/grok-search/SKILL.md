---
description: Search X (Twitter) posts in real-time using xAI Grok API. Use when the user wants to search for tweets, X posts, trending topics, or real-time information from X/Twitter.
---

# Grok Search — X (Twitter) リアルタイム検索

xAI Grok API を使って、X (Twitter) の投稿をリアルタイムで検索・要約するスキルです。

## 前提条件

- xAI API キーが必要です（[https://console.x.ai/](https://console.x.ai/) で取得）
- Python 3.10+ がインストールされていること

## セットアップ（初回のみ）

1. 環境変数を設定:
```bash
cd /Users/takahashikenta/projects/Antigravity/GrokSearch
cp .env.example .env
# .env ファイルを編集して XAI_API_KEY を設定
```

2. 依存パッケージをインストール:
```bash
pip3 install -r /Users/takahashikenta/projects/Antigravity/GrokSearch/requirements.txt
```

## 使い方

### CLIから実行
```bash
cd /Users/takahashikenta/projects/Antigravity/GrokSearch

# テキスト形式で検索
python3 grok_search.py "検索したいキーワード"

# 結果数を指定
python3 grok_search.py "Remotion 最新情報" --max-results 10

# JSON 形式で出力
python3 grok_search.py "AI エージェント" --format json

# 英語で検索結果を取得
python3 grok_search.py "Claude Code tips" --lang en
```

### Antigravity から呼び出す場合

ユーザーが X/Twitter の投稿を検索したい場合、以下のコマンドを実行してください:

```bash
cd /Users/takahashikenta/projects/Antigravity/GrokSearch && python3 grok_search.py "検索クエリ"
```

JSON 形式で取得し、結果を構造化して提示する場合:
```bash
cd /Users/takahashikenta/projects/Antigravity/GrokSearch && python3 grok_search.py "検索クエリ" --format json
```

## ファイル構成

- `grok_search.py` — メイン検索スクリプト
- `.env` — API キー設定（gitignored）
- `.env.example` — 環境変数テンプレート
- `requirements.txt` — Python 依存パッケージ

## トラブルシューティング

- **API キーエラー**: `.env` ファイルに正しい `XAI_API_KEY` が設定されているか確認
- **モデルエラー**: `grok_search.py` 内の `DEFAULT_MODEL` を利用可能なモデルに変更
- **レート制限**: xAI のレート制限に達した場合、少し待ってから再試行
