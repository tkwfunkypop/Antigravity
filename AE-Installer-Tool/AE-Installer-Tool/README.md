# 🔧 AE Installer Tool

After Effects のスクリプト・プラグイン・プリセットを、指定したAEバージョンの**正しいディレクトリに自動振り分け**するMac専用ツール。

README / マニュアルファイルを読み取り、**製品名・ベンダー名・対応AEバージョン・ファイル種類**を自動検出します。

---

## ✨ 特徴

- **AEバージョン自動検出** — `/Applications/` 内のインストール済みAEを一覧表示
- **README/マニュアル自動解析** — `.md`, `.txt`, `.pdf` から製品情報を抽出
- **ファイル種類の自動判別** — 拡張子とファイル内容から振り分け先を決定
- **GUI & CLI** — ダブルクリックでGUI起動、ターミナルからCLI操作も可能
- **ドライラン** — 実際にコピーせず振り分け結果を確認できる

---

## 📂 対応ファイル

| 拡張子 | 種類 | インストール先 |
|--------|------|---------------|
| `.plugin` | プラグイン (Mac) | `Plug-ins/{ベンダー名}/` |
| `.jsx` | スクリプト | `Scripts/ScriptUI Panels/` |
| `.jsxbin` | コンパイル済スクリプト | `Scripts/ScriptUI Panels/` |
| `.ffx` | プリセット | `Presets/` |
| `.jsxinc` | スクリプトライブラリ | `Scripts/ScriptUI Panels/` |
| `.aex` | プラグイン (Win) | ⚠️ Macでは無効（自動スキップ） |
| CSXS フォルダ | CEP Extension | `~/Library/.../CEP/extensions/` |

---

## 🚀 使い方

### GUI モード（推奨）

```bash
# 直接実行
python3 ae_installer.py

# または .app をダブルクリック
open "AE Installer Tool.app"
```

1. **AEバージョン** をドロップダウンから選択
2. **「フォルダを選択」** でプラグイン/スクリプトが入ったフォルダを指定
3. 自動的にREADMEを解析し、ファイルの振り分け結果を表示
4. **ベンダー名** を確認・修正（プラグインのフォルダ名に使用）
5. **「🚀 インストール実行」** をクリック

### CLI モード

```bash
# ドライラン（実際にはコピーしない）
python3 ae_installer.py --dry-run /path/to/plugin-folder --version 2026

# 実行
python3 ae_installer.py /path/to/plugin-folder --version 2026

# 最新バージョンに自動インストール
python3 ae_installer.py /path/to/plugin-folder
```

---

## 🛠 ビルド

`.app` バンドルを再ビルドする場合：

```bash
bash build_app.sh
```

---

## 📁 ファイル構成

```
AE-Installer-Tool/
├── ae_installer.py       ← メインアプリ（GUI + CLI）
├── installer_core.py     ← ファイル振り分けコアロジック
├── readme_parser.py      ← README/マニュアル解析エンジン
├── build_app.sh          ← .app ビルドスクリプト
├── AE Installer Tool.app ← 生成された Mac アプリ
└── README.md             ← このファイル
```

---

## 📋 動作環境

- **OS**: macOS 12 以降
- **Python**: 3.8 以降
- **tkinter**: Python に同梱されたもの
- **AE**: After Effects 2020 以降（`/Applications/Adobe After Effects*/`）

---

## 👨‍💻 作者

- **Name**: 高橋 健太
- **Contact / X (Twitter)**: [@tkwfunkypop](https://x.com/tkwfunkypop)
