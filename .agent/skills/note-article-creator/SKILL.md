---
name: note-article-creator
description: "「高橋帝国 放送部」のマスコットキャラクター「帝国ちゃん」として、X(Twitter)のトレンドからnote記事を自動生成・投稿したり、新しく作成したスクリプトや拡張機能の紹介記事を作成するスキルです。"
---

# note自動投稿 Skill (Note Article Creator)

このスキルは、クリエイティブ業界向けのトレンドリサーチから記事生成、アイキャッチ・挿絵の作成、そしてnoteへの自動投稿までを一貫して行うためのものです。また、ユーザーが新しく作成したツール（スクリプトやプラグイン）の紹介記事を自動で執筆する機能も持ちます。

## 🎯 目的
- X(Twitter)のトレンドから、クリエイター向けの有益な情報を抽出し、「帝国ちゃん」のキャラクター性で発信する。
- 高品質なフラットデザインのアニメスタイルのアイキャッチ画像と、記事本文に差し込む挿絵を自動生成し、視覚的に魅力的な記事を作る。
- 最新のツールやスクリプトを作成した翌日に、そのツールの使い方や魅力を紹介する記事を自動で生成・投稿し、PR活動を自動化する。
- 投稿した記事はDiscord（AI秘書と同じWebhook）に自動通知する。

## ⚙️ 基本パイプラインの使用方法 (Standard Pipeline)

トレンド調査から投稿・Discord通知までの基本フローは、`/Users/takahashikenta/projects/Antigravity/NoteAutoPost/pipeline.py` を実行することで完了します。

### コマンド例:
```bash
# 全自動でトレンドリサーチ〜記事生成〜公開〜Discord通知まで行う
python /Users/takahashikenta/projects/Antigravity/NoteAutoPost/pipeline.py

# 下書き状態でnoteに保存する（Discord通知も実行される）
python /Users/takahashikenta/projects/Antigravity/NoteAutoPost/pipeline.py --draft

# 記事生成まで行い、noteへの自動投稿はスキップする
python /Users/takahashikenta/projects/Antigravity/NoteAutoPost/pipeline.py --skip-post

# Discord通知をスキップする
python /Users/takahashikenta/projects/Antigravity/NoteAutoPost/pipeline.py --skip-notify
```

### パイプライン内で実行されるスクリプト:
1. **`research_trends.py`**: Xからトレンドを検索し、最適なネタを1つ選定します。テーマにはAfter Effects（目から鱗Tips、エクスプレッション、プラグイン等）を多めに、3DCG（Houdini/Blender/C4D）、CGworld、撮影機材、映像制作・アニメーション等を幅広くカバーします。
2. **`generate_article.py`**: ネタ情報を元に、Grok APIでマークダウン記事と画像プロンプトを生成し、Gemini APIでアイキャッチと挿絵を作成します。
3. **`post_to_note.py`**: Playwrightを使用して note.com にログインし、タイトル、本文（挿絵のアップロード含む）、アイキャッチ画像、タグを設定して公開（または下書き保存）します。投稿後、記事のURLを自動で記事データ（JSON）に保存します。
4. **`notify_discord.py`**: 投稿した記事のタイトル・URL・タグをDiscord（AI秘書と同じWebhook）に自動通知します。

---

## 🆕 新規スクリプト紹介記事の作成 (Tool Intro Article Workflow)

ユーザーから「昨日作成したツールの紹介記事を作って」「〇〇ツールの記事を生成して」と依頼された場合、または定期実行時に新規スクリプトが検出された場合は、通常のトレンドリサーチ（`research_trends.py`）を**スキップ**し、ツールの情報をもとに直接記事データを生成して投稿します。

### ⚠️ 超重要ルール: スクリプト紹介記事は専用記事にすること

スクリプトを開発した翌日は、**そのスクリプトを紹介する内容だけ**の専用記事を作成すること。通常のトレンドリサーチ記事と混ぜてはいけません。記事タイトルには必ず `【帝国式自作ツール】` をプレフィックスとして付けます。

記事は以下の方針で作成します:
- 誰にでもツールの素晴らしさがわかるように、図解や画像を多めに生成して挿入する（2〜3箇所の挿絵）
- 帝国ちゃんのキャラクター性を存分に出して、読者がファンになるような記事にする
- 初心者でも「これ使いたい！」と思えるよう、専門用語は噛み砕いて説明する
- ツールの機能紹介、使い方ガイド、帝国ちゃんの本音レビューなど、ツール1つだけにフォーカスした構成にする

### 🤖 Agent（あなた）が実行するステップ:

1. **新規ツールの検索・ネタ生成**: `check_new_scripts.py` を実行して、ユーザーのプロジェクトディレクトリをスキャンし、直近で更新・作成されたツールの `README.md` などを読み込んで `topic.json` 形式で出力させます。
   ```bash
   python /Users/takahashikenta/projects/Antigravity/NoteAutoPost/check_new_scripts.py -o articles/tool_topic.json
   ```
2. **記事と画像の生成**: 作成された `tool_topic.json` を指定して `generate_article.py` を実行します。ツール紹介記事の場合、自動的に専用プロンプト（帝国ちゃんの個性全開＋図解寄りの構成）が選択されます。
   ```bash
   python /Users/takahashikenta/projects/Antigravity/NoteAutoPost/generate_article.py -i articles/tool_topic.json -o articles/tool_article.json
   ```
3. **noteへ投稿**: 生成された記事データを使って `post_to_note.py` を実行し、noteへ自動投稿します（必要に応じて `--draft` を付けて下書き保存します）。
   ```bash
   python /Users/takahashikenta/projects/Antigravity/NoteAutoPost/post_to_note.py -i articles/tool_article.json --draft
   ```
4. **Discord通知**: 投稿後、`notify_discord.py` で記事の情報をDiscordに通知します。
   ```bash
   python /Users/takahashikenta/projects/Antigravity/NoteAutoPost/notify_discord.py -i articles/tool_article.json
   ```

## 🖼️ 画像生成について (Image Generation)

- `generate_article.py` を実行すると、Grok APIで記事本文と画像プロンプト（アイキャッチ用と挿絵用）が生成され、その後Gemini APIを利用して画像が生成されます。
- 画像のスタイルは、**「高品質なフラットデザインのアニメスタイル（High-quality flat design anime style, solid colors, clean lines）」**で統一されており、キャラクター性（帝国ちゃん）を常に維持します。
- `post_to_note.py` は、記事の先頭に見出し画像としてアイキャッチを設定し、本文の `[ILLUSTRATION_PLACEHOLDER]` マーカーを検知して挿絵をアップロードします。
- 過去の記事画像を一括設定するには `python update_old_articles.py` を実行します。
- ツール紹介記事では図解的な挿絵（ツールの使い方イメージ、ビフォーアフター等）が2〜3箇所挿入されます。

## 📢 Discord通知について (Discord Notification)

- `notify_discord.py` は、AI秘書（`/Users/takahashikenta/projects/Antigravity/AISecretary/config.yaml`）と同じDiscord Webhook URLを使用します。
- 投稿した記事のタイトル、URL、タグを自動で通知します。
- `pipeline.py` を使えば投稿後に自動実行されますが、`--skip-notify` で省略可能です。

## 📝 記事の品質ルール (Article Quality Rules)

- 記事内はファクトチェックを絶対に怠らず、不確かな情報や誤解を招く表現は一切使用しない
- 記事内で「**」（太字・ボールド装飾）は使用しない
- 専門用語は初出時に「～（かんたんに言うと○○のこと）」のように丁寧に説明する
- 初心者でも楽しくわかりやすく読める文体を維持する
- 過去の関連記事がある場合はリンク付きで言及する（`generate_article.py` が自動で処理）

## 🤖 AIエージェント（あなた）への注意事項 (Instructions for Agent)

- 記事の本文は必ず「帝国ちゃん」のキャラクター（明るく元気、丁寧な言葉遣い、絵文字多用）で生成されるようにプロンプトが調整されています。
- 画像は `[ILLUSTRATION_PLACEHOLDER]` のマーカー位置に Playwright によってインラインでアップロードされます。
- `pipeline.py` を実行する際は時間がかかる（3〜5分程度）ので、タイムアウトに注意しつつプロセスの完了を待機するか、バックグラウンドコマンドとして実行してください。
- ユーザーから特定のテーマでの執筆を依頼された場合は、`research_trends.py` を直接実行するのではなく、上記「ツール紹介」と同じように自前で `topic.json` を構築し、ステップ2以降を実行することで確実に対応できます。
- 投稿後は必ず `notify_discord.py` でDiscordに通知してください。
