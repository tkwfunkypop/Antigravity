---
name: ps-script-dev
description: Adobe Photoshopのエクステンション・プラグイン・スクリプト開発（UXP推奨）に関するベストプラクティスとテンプレート
metadata:
  tags: photoshop, uxp, plugin, extension, script, batchplay, adobe
---

# Photoshop プラグイン・スクリプト開発スキル

Adobe Photoshop のプラグイン・エクステンション・スクリプトを開発する際のベストプラクティスとテンプレートを提供する。
**推奨技術: UXP（Unified Extensibility Platform）** — Adobe が公式に推進する最新のプラットフォーム。

---

## 🔴 スクリプト作成時の必須条件

> [!CAUTION]
> **以下の6項目はプラグイン・スクリプト作成時に必ず遵守すること。1つでも欠けた成果物は不完全とみなす。**

### 条件1: インストーラーの必須作成

プラグイン・スクリプトを作成したら、**必ず「インストーラー.app」（Mac）と「インストーラー.bat」（Windows）** を作成する。素人がダブルクリックだけでインストールできること。

**配布パッケージ構成:**

```
配布パッケージ/
├── MyPlugin Installer.app     ← Mac用ダブルクリックインストーラー（AppleScript）
├── .install-mac.sh            ← 実際のインストール処理（隠しファイル）
├── install-win.bat            ← Windows用インストーラー
├── MyPlugin/                  ← UXPプラグイン本体
│   ├── manifest.json
│   ├── index.html
│   ├── index.js
│   └── styles.css
└── MyPlugin_Manual.pdf        ← マニュアル（PDF形式・拡張機能名_Manual）
```

**Mac インストーラー雛形（UXPプラグイン用 .install-mac.sh）:**

```bash
#!/bin/bash
set -e
cd "$(dirname "$0")"
SCRIPT_DIR="$(pwd)"
PLUGIN_NAME="MyPlugin"
PLUGIN_ID="com.yourname.my-plugin"

# ⚠️ clear は使わない（AppleScript do shell script 経由では TERM 未設定でエラーになる）
export TERM=xterm-256color

echo "========================================="
echo "  ${PLUGIN_NAME} インストーラー"
echo "========================================="

# [1] 旧バージョンの検出と削除（上書きインストール）
UXP_DIR="$HOME/Library/Application Support/Adobe/UXP/PluginsStorage/PS"
if [ -d "${UXP_DIR}" ]; then
    for OLD_DIR in "${UXP_DIR}"/*"${PLUGIN_ID}"*/; do
        if [ -d "${OLD_DIR}" ]; then
            echo "  🔄 旧バージョンを検出・削除中: $(basename "${OLD_DIR}")"
            rm -rf "${OLD_DIR}"
        fi
    done
fi

# [2] UXP プラグインのインストール
echo "  [1/2] プラグインをインストール中..."
DEST_DIR="$HOME/Library/Application Support/Adobe/UXP/Plugins/${PLUGIN_ID}"
mkdir -p "${DEST_DIR}"
cp -R "${SCRIPT_DIR}/${PLUGIN_NAME}/"* "${DEST_DIR}/"

echo "  [2/2] インストール完了！"
echo ""
echo "  📌 次の手順:"
echo "     1. Photoshop を再起動"
echo "     2. プラグイン → ${PLUGIN_NAME} で表示"
echo "     （UXP Developer Tool でロードも可能）"
echo "========================================="
```

**AppleScript .app ビルドコマンド:**

```bash
osacompile -o "${PKG_DIR}/${PLUGIN_NAME} Installer.app" -e '
try
    set scriptFolder to do shell script "dirname " & quoted form of POSIX path of (path to me)
    set installScript to scriptFolder & "/.install-mac.sh"
    do shell script "chmod +x " & quoted form of installScript
    set result to do shell script quoted form of installScript
    display dialog "✅ インストール完了！" & return & return & "Photoshop を再起動してください。" buttons {"OK"} default button "OK" with title "インストーラー" with icon note
on error errMsg number errNum
    display dialog "❌ エラー:" & return & errMsg buttons {"OK"} default button "OK" with title "インストール失敗" with icon stop
end try
'
```

**Windows インストーラー雛形（install-win.bat）:**

```batch
@echo off
chcp 65001 > nul
set "PLUGIN_NAME=MyPlugin"
set "PLUGIN_ID=com.yourname.my-plugin"
set "SCRIPT_DIR=%~dp0"

echo =========================================
echo   %PLUGIN_NAME% インストーラー
echo =========================================

:: [1] 旧バージョンの削除（上書きインストール）
set "UXP_DIR=%APPDATA%\Adobe\UXP\Plugins\%PLUGIN_ID%"
if exist "%UXP_DIR%" (
    echo   🔄 旧バージョンを削除中...
    rmdir /s /q "%UXP_DIR%"
)

:: [2] プラグインのインストール
echo   [1/2] プラグインをインストール中...
if not exist "%UXP_DIR%" mkdir "%UXP_DIR%"
xcopy "%SCRIPT_DIR%%PLUGIN_NAME%" "%UXP_DIR%\" /E /I /Y >nul

echo   [2/2] インストール完了！
echo.
echo   📌 Photoshop を再起動してください
echo =========================================
pause
```

### 条件2: 配布対応エラーフリーインストーラー

インストーラーは **誰がインストールしてもエラーが出ない** ように以下を必ず実装する:

| チェック項目 | Mac | Windows |
|-------------|-----|---------|
| UXPパス自動設定 | `~/Library/Application Support/Adobe/UXP/Plugins/` | `%APPDATA%\Adobe\UXP\Plugins\` |
| パス内スペース対応 | ダブルクォート必須 | ダブルクォート必須 |
| 権限エラー対策 | `chmod +x` 自動付与 | 管理者権限プロンプト |
| 文字化け防止 | UTF-8デフォルト | `chcp 65001 > nul` |
| TERM未設定対策 | `export TERM=xterm-256color` | N/A |
| `clear` 使用禁止 | ✅ 使わない | N/A |
| エラー即停止 | `set -e` | N/A |
| 進捗表示 | ステップ番号付き `echo` | ステップ番号付き `echo` |
| 完了/失敗通知 | `display dialog` (AppleScript) | `echo` + `pause` |

### 条件3: マニュアル（PDF形式）の必須作成

プラグイン作成時は **必ず PDF形式のマニュアル** を同梱する。`tool-manual-creator` スキルのフォーマットに準拠し、以下を含めること：

**ファイル名規則:** `{拡張機能のファイル名}_Manual.pdf` で統一（例: `BatchResize_Manual.pdf`、`LayerTools_Manual.pdf`）

**デザイン・レイアウトの必須要件:**
- **図解を積極的に使用**: UIのスクリーンショット、操作フロー図、ワークフロー図解などを挿入し、視覚的に分かりやすくすること
- **見やすいデザイン**: 見出し・区切り線・アイコン・色分けなどを活用し、プロフェッショナルで読みやすいレイアウトにすること
- **情報の階層化**: セクションごとに明確な見出しと余白を設け、スキャンしやすい構成にすること

**必須コンテンツ:**

1. **概要**: ツールの目的と特徴（1〜2文）
2. **動作環境**: 対応Photoshopバージョン、OS要件
3. **インストール手順**: Mac/Win両方をステップバイステップ解説（図解付き）
   - 「ZIPを展開」→「インストーラーをダブルクリック」→「Photoshopを再起動」→「プラグインを表示」
4. **使い方**: 各機能の使用方法をスクリーンショット・図解付きで解説
5. **UIの説明**: 各ボタン・入力欄の役割（UI図解付き）
6. **トラブルシューティング**: よくある問題と解決法（開発者モードの有効化など）
7. **アンインストール方法**
8. **更新履歴**
9. **作者情報（以下で固定）**:
   ```
   ## 👨‍💻 作者 (Author)
   - **Name**: 高橋 健太
   - **Contact / X (Twitter)**: [@tkwfunkypop](https://x.com/tkwfunkypop)
   ```

**PDF生成方法（ビルド時）:**

マニュアルは **PDF のみ** で作成する（`.md` ファイルは不要）。

```bash
# pandoc を使用して直接 PDF を生成（ファイル名は拡張機能名_Manual）
pandoc Manual.md -o {拡張機能名}_Manual.pdf \
  --pdf-engine=lualatex \
  -V documentclass=ltjsarticle \
  -V geometry:margin=2cm \
  -V mainfont="Hiragino Kaku Gothic ProN" \
  --toc

# pandoc が未インストールの場合
brew install pandoc
brew install --cask mactex-no-gui
```

> [!IMPORTANT]
> - 配布パッケージには **`{拡張機能名}_Manual.pdf` のみ** を同梱すること（`.md` は不要）
> - ファイル名は `{拡張機能のファイル名}_Manual.pdf` で統一すること
> - PDFには日本語フォントを埋め込み、Win/Mac両方で文字化けしないようにすること
> - 図解・スクリーンショットを必ず含め、デザインを見やすく工夫すること

### 条件4: Win/Mac クロスプラットフォーム互換チェック

プラグイン作成完了時に以下のチェックリストを **すべて確認** すること：

- [ ] パス区切り文字: Mac(`/`) と Win(`\`)の両方で動作するか
- [ ] 改行コード: LF（`\n`）で統一されているか（`.bat`ファイルのみCRLF可）
- [ ] 文字エンコーディング: UTF-8（BOMなし）で統一されているか
- [ ] パス内の日本語・スペース: ダブルクォートで囲んでいるか
- [ ] ファイル名の大文字小文字を考慮しているか
- [ ] `.install-mac.sh` に実行権限付与済みか
- [ ] Windows `.bat` の先頭に `chcp 65001 > nul` があるか
- [ ] UXPプラグインパスが正しいか（Mac / Win）
- [ ] `.app` ラッパーがAppleScriptで正しく生成されるか
- [ ] `manifest.json` が正しいManifest Version / API Versionか

### 条件5: UIパネル形式（他パネルとのドッキング対応）

すべてのプラグインは **UIパネル形式** で作成し、他のパネルとドッキングできるようにする：

| 技術 | パネル形式の実装方法 |
|------|---------------------|
| **UXP Plugin** | `manifest.json` の `entrypoints[].type` を `"panel"` に設定 + `preferredDockedSize` を指定 |
| **UXP Script** | パネル不要の場合のみ `.psjs` 形式（ただし可能な限り Plugin パネル形式を優先） |

> [!IMPORTANT]
> - `entrypoints` の `type` は必ず `"panel"` にすること（`"command"` はドッキング不可）
> - `minimumSize` / `preferredDockedSize` / `preferredFloatingSize` を必ず設定すること

### 条件6: 上書きインストール（旧バージョン自動削除）

インストーラーは以下の仕様を必ず実装する：

1. **既存バージョンの検出**: UXP Plugins フォルダに同一IDのプラグインが存在するかチェック
2. **旧ファイルの完全削除**: 存在する場合は `rm -rf`（Mac）/ `rmdir /s /q`（Win）で削除
3. **関連ファイルの削除**: `PluginsStorage` 内のキャッシュも検出して削除
4. **新バージョンのコピー**: 削除後に新しいファイルをコピー
5. **ユーザー設定の保持**: `~/Library/Application Support/` 内のユーザー設定ファイルは保持

---

## 1. スクリプティング方式の選択

| 方式 | ファイル拡張子 | 用途 | 推奨度 |
|------|-------------|------|--------|
| **UXP Plugin** | `manifest.json` + `.js` + `.html` | フルUI パネル、永続ツール、外部API連携 | ⭐⭐⭐ **最推奨** |
| **UXP Script** | `.psjs` | UIなし/簡易ダイアログの自動化 | ⭐⭐⭐ |
| ExtendScript | `.jsx` | レガシー互換、シンプル自動化 | ⭐（非推奨・移行推奨） |

> **判断基準**: 新規開発はすべて **UXP** を使う。ExtendScript は既存スクリプトの保守のみ。

---

## 2. UXP Plugin テンプレート（フルUI パネル）

### 2.1 ディレクトリ構成

```
my-ps-plugin/
├── manifest.json      # プラグイン定義（必須）
├── index.html         # パネル UI
├── index.js           # メインロジック
├── styles.css         # スタイル
└── icons/
    ├── icon@1x.png    # 24x24
    └── icon@2x.png    # 48x48
```

### 2.2 manifest.json

```json
{
  "id": "com.yourname.myplugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "main": "index.html",
  "host": [
    {
      "app": "PS",
      "minVersion": "24.0.0"
    }
  ],
  "manifestVersion": 5,
  "entrypoints": [
    {
      "type": "panel",
      "id": "mainPanel",
      "label": {
        "default": "My Plugin"
      },
      "minimumSize": { "width": 230, "height": 200 },
      "maximumSize": { "width": 600, "height": 1200 },
      "preferredDockedSize": { "width": 230, "height": 300 },
      "preferredFloatingSize": { "width": 300, "height": 400 }
    }
  ],
  "icons": [
    { "width": 24, "height": 24, "path": "icons/icon@1x.png" },
    { "width": 48, "height": 48, "path": "icons/icon@2x.png" }
  ]
}
```

### 2.3 index.html（パネル UI）

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <sp-heading size="S">My Plugin</sp-heading>
  <sp-body size="S" id="status">準備完了</sp-body>

  <sp-action-button id="btnExecute">実行</sp-action-button>

  <script src="index.js"></script>
</body>
</html>
```

### 2.4 index.js（メインロジック）

```javascript
const { app, core } = require("photoshop");
const { executeAsModal } = core;
const { batchPlay } = require("photoshop").action;

// --- ボタンイベント ---
document.getElementById("btnExecute").addEventListener("click", async () => {
  const statusEl = document.getElementById("status");
  try {
    statusEl.textContent = "処理中...";
    await executeAsModal(mainProcess, {
      commandName: "My Plugin Action",
    });
    statusEl.textContent = "完了！";
  } catch (e) {
    statusEl.textContent = `エラー: ${e.message}`;
    console.error(e);
  }
});

// --- メイン処理（executeAsModal 内で実行） ---
async function mainProcess(executionContext) {
  const hostControl = executionContext.hostControl;
  const doc = app.activeDocument;
  if (!doc) {
    throw new Error("ドキュメントが開かれていません。");
  }

  // History（元に戻す）の一括管理
  const suspensionID = await hostControl.suspendHistory({
    documentID: doc.id,
    name: "My Plugin Action",
  });

  try {
    // --- ここに実際の処理を記述 ---
    // 例: アクティブレイヤーの不透明度を変更
    const layer = doc.activeLayers[0];
    if (layer) {
      layer.opacity = 50;
    }
  } finally {
    // History の再開（必須）
    await hostControl.resumeHistory(suspensionID);
  }
}
```

### 2.5 styles.css

```css
:root {
  --bg-color: #2b2b2b;
  --text-color: #e0e0e0;
}

body {
  margin: 8px;
  font-family: "Adobe Clean", sans-serif;
  background: var(--bg-color);
  color: var(--text-color);
}

sp-action-button {
  margin-top: 8px;
  width: 100%;
}
```

---

## 3. UXP Script テンプレート（`.psjs`）

UIなし・簡易ダイアログで自動化を行う場合のテンプレート。

```javascript
// ファイル名: my-script.psjs

const { app, core } = require("photoshop");
const { executeAsModal } = core;

async function run() {
  const doc = app.activeDocument;
  if (!doc) {
    await app.showAlert("ドキュメントを開いてください。");
    return;
  }

  await executeAsModal(
    async (executionContext) => {
      const hostControl = executionContext.hostControl;
      const suspensionID = await hostControl.suspendHistory({
        documentID: doc.id,
        name: "UXP Script Action",
      });

      try {
        // --- 処理を記述 ---
        const layers = doc.layers;
        for (const layer of layers) {
          console.log(`レイヤー: ${layer.name}, 種類: ${layer.kind}`);
        }
      } finally {
        await hostControl.resumeHistory(suspensionID);
      }
    },
    { commandName: "UXP Script Action" }
  );
}

run();
```

---

## 4. batchPlay API（高度な操作）

UXP DOM に直接メソッドがないPhotoshop機能には `batchPlay` を使う。

### 4.1 基本構文

```javascript
const { action } = require("photoshop");

async function applyGaussianBlur(radius) {
  const result = await action.batchPlay(
    [
      {
        _obj: "gaussianBlur",
        radius: {
          _unit: "pixelsUnit",
          _value: radius,
        },
        _options: { dialogOptions: "dontDisplay" },
      },
    ],
    { synchronousExecution: false }
  );
  return result;
}
```

### 4.2 Action Descriptor の取得方法

1. Photoshop で **開発者モード** を有効にする
2. メニュー: **プラグイン > 開発 > アクションコマンドを記録...**
3. 操作を実行すると JSON が生成される → そのまま `batchPlay` に渡す

### 4.3 よく使う batchPlay パターン

```javascript
// ドキュメント情報の取得
const docInfo = await action.batchPlay(
  [{ _obj: "get", _target: [{ _ref: "document", _enum: "ordinal", _value: "targetEnum" }] }],
  {}
);

// 選択範囲の作成（矩形）
await action.batchPlay(
  [{
    _obj: "set",
    _target: [{ _ref: "channel", _property: "selection" }],
    to: {
      _obj: "rectangle",
      top: { _unit: "pixelsUnit", _value: 0 },
      left: { _unit: "pixelsUnit", _value: 0 },
      bottom: { _unit: "pixelsUnit", _value: 100 },
      right: { _unit: "pixelsUnit", _value: 100 },
    },
  }],
  {}
);

// フィルターの適用（アンシャープマスク）
await action.batchPlay(
  [{
    _obj: "unsharpMask",
    amount: { _unit: "percentUnit", _value: 150 },
    radius: { _unit: "pixelsUnit", _value: 1.5 },
    threshold: 0,
    _options: { dialogOptions: "dontDisplay" },
  }],
  {}
);
```

---

## 5. 開発のベストプラクティス

### 5.1 executeAsModal の徹底

ドキュメントやアプリケーションの状態を変更するすべての操作は `executeAsModal` 内で実行する。これを怠ると実行時エラーになる。

```javascript
// ✅ 正しい
await core.executeAsModal(async () => {
  doc.activeLayers[0].opacity = 80;
}, { commandName: "Change Opacity" });

// ❌ エラーになる
doc.activeLayers[0].opacity = 80;
```

### 5.2 suspendHistory / resumeHistory（Undo 管理）

複数の操作を1つのUndo単位にまとめる。`try-finally` で必ず `resumeHistory` を呼ぶ。

### 5.3 ドキュメント・レイヤーの事前チェック

```javascript
// ドキュメントの存在確認
if (!app.activeDocument) {
  await app.showAlert("ドキュメントを開いてください。");
  return;
}

// レイヤー選択の確認
const selectedLayers = app.activeDocument.activeLayers;
if (selectedLayers.length === 0) {
  await app.showAlert("レイヤーを選択してください。");
  return;
}

// レイヤー種類の確認
const layer = selectedLayers[0];
if (layer.kind !== "pixel") {
  await app.showAlert("ピクセルレイヤーを選択してください。");
  return;
}
```

### 5.4 カラーモード・ビット深度

```javascript
const doc = app.activeDocument;
console.log(`モード: ${doc.mode}`);       // "RGBColorMode", "CMYKColorMode" 等
console.log(`ビット: ${doc.bitsPerChannel}`); // 8, 16, 32
console.log(`解像度: ${doc.resolution}`);     // DPI 値
```

### 5.5 パフォーマンス最適化

- **バッチ操作**: 複数の `batchPlay` コマンドは1つの配列にまとめて一括実行する
- **dialogOptions**: フィルター適用時は `"dontDisplay"` を指定してダイアログを非表示にする
- **不要な再描画の回避**: 大量のレイヤー操作時はパネル更新を最小限にする

### 5.6 UI コンポーネント（Spectrum Web Components）

UXP Plugin のUIには Adobe の Spectrum Web Components を使用する。

```html
<!-- ボタン -->
<sp-action-button>実行</sp-action-button>
<sp-action-button variant="cta">メインアクション</sp-action-button>

<!-- テキスト入力 -->
<sp-textfield placeholder="値を入力..."></sp-textfield>

<!-- チェックボックス -->
<sp-checkbox checked>オプション A</sp-checkbox>

<!-- ドロップダウン -->
<sp-picker>
  <sp-menu>
    <sp-menu-item value="1">選択肢 1</sp-menu-item>
    <sp-menu-item value="2">選択肢 2</sp-menu-item>
  </sp-menu>
</sp-picker>

<!-- スライダー -->
<sp-slider min="0" max="100" value="50"></sp-slider>

<!-- プログレスバー -->
<sp-progressbar value="75" max="100"></sp-progressbar>
```

---

## 6. ファイル操作

UXP のファイルシステム API を使用する。

```javascript
const fs = require("uxp").storage.localFileSystem;

// ファイル選択ダイアログ
const file = await fs.getFileForOpening({
  types: ["png", "jpg", "psd"],
});

// フォルダ選択ダイアログ
const folder = await fs.getFolder();

// ファイルの読み書き
const entry = await folder.createFile("output.txt", { overwrite: true });
await entry.write("テスト出力");

const content = await entry.read();
console.log(content);
```

---

## 7. 開発環境セットアップ

### 7.1 必須ツール

1. **UXP Developer Tool (UDT)**: Creative Cloud デスクトップアプリからインストール
2. **Node.js**: 依存パッケージ管理用
3. **VS Code**: 推奨エディタ

### 7.2 開発者モード有効化

Photoshop メニュー: **環境設定 > プラグイン > 「開発者モードを有効にする」** にチェック

### 7.3 デバッグ

1. UDT でプラグインをロード
2. UDT の「デバッグ」ボタンで Chrome DevTools が起動
3. `console.log()` で変数検査、ブレークポイント設定が可能

### 7.4 プラグインの配布

```bash
# UDT の「パッケージ」機能で .ccx ファイルを生成
# Creative Cloud マーケットプレイスまたは直接配布
```

---

## 8. トラブルシューティング

### 8.1 よくあるエラー

| エラー | 原因 | 解決策 |
|--------|------|--------|
| `executeAsModal is required` | Modal外でのドキュメント変更 | `executeAsModal` で囲む |
| `No active document` | ドキュメント未オープン | 事前チェックを追加 |
| `batchPlay failed` | 不正な Action Descriptor | Photoshop記録機能で正しいJSON生成 |
| `Plugin not showing` | manifest.json の設定ミス | `id`, `host`, `entrypoints` を確認 |
| `CORS / Network error` | 外部API呼び出し制限 | manifest.json の `permissions` に追加 |

### 8.2 manifest.json の permissions（外部通信）

```json
{
  "requiredPermissions": {
    "network": {
      "domains": ["https://api.example.com"]
    },
    "localFileSystem": "fullAccess"
  }
}
```

### 8.3 ExtendScript → UXP 移行チェックリスト

- [ ] `$.writeln()` → `console.log()`
- [ ] `app.activeDocument` → `app.activeDocument`（同じだが非同期注意）
- [ ] `executeAction()` → `batchPlay()`
- [ ] `ScriptUI` → HTML/CSS + Spectrum Web Components
- [ ] `File` オブジェクト → UXP `storage` API
- [ ] 同期処理 → `async/await` パターン
- [ ] `.jsx` → `.psjs`（UXP Script）または Plugin 構成

---

このSkillはPhotoshopプラグイン・エクステンション・スクリプト関連のコード生成・修正・パッケージ生成の際に基準として利用されます。
