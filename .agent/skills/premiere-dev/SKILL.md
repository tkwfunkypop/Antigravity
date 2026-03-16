---
name: premiere-dev
description: Adobe Premiere Proのエクステンション（UXP推奨）・プラグイン・スクリプト（CEP/ExtendScript）開発のベストプラクティスとテンプレート
metadata:
  tags: premiere-pro, uxp, cep, extendscript, plugin, extension, adobe, automation, video-editing
---

# Adobe Premiere Pro 開発スキル

Premiere Pro向けのプラグイン（UXP）、エクステンション（CEP）、およびスクリプト開発を包括的にカバーするスキル。

---

## 🔴 スクリプト作成時の必須条件

> [!CAUTION]
> **以下の6項目はスクリプト・プラグイン作成時に必ず遵守すること。1つでも欠けた成果物は不完全とみなす。**

### 条件1: インストーラーの必須作成

スクリプト・プラグインを作成したら、**必ず「インストーラー.app」（Mac）と「インストーラー.bat」（Windows）** を作成する。素人がダブルクリックだけでインストールできること。

**Mac インストーラー構成（AppleScript .app ラッパー方式）:**

```
配布パッケージ/
├── MyPlugin Installer.app    ← ダブルクリック用（AppleScript）
├── .install-mac.sh            ← 実際のインストール処理（隠しファイル）
├── MyPlugin/                  ← プラグイン本体
│   ├── manifest.json
│   ├── index.html
│   ├── index.js
│   └── styles.css
├── install-win.bat            ← Windows用インストーラー
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

# [1] 既存バージョンの検出と削除（上書きインストール）
UXP_DIR="$HOME/Library/Application Support/Adobe/UXP/PluginsStorage/PPRO"
if [ -d "${UXP_DIR}" ]; then
    for OLD_DIR in "${UXP_DIR}"/*"${PLUGIN_ID}"*/; do
        if [ -d "${OLD_DIR}" ]; then
            echo "  🔄 旧バージョンを検出・削除中: $(basename "${OLD_DIR}")"
            rm -rf "${OLD_DIR}"
        fi
    done
fi

# CEP版の旧ファイルも削除（移行対応）
CEP_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions"
if [ -d "${CEP_DIR}/${PLUGIN_ID}" ] || [ -L "${CEP_DIR}/${PLUGIN_ID}" ]; then
    echo "  🔄 旧CEPバージョンを削除中..."
    rm -rf "${CEP_DIR}/${PLUGIN_ID}"
fi

# [2] CEP デバッグモードの有効化（CEP版互換のため）
echo "  [1/3] CEP デバッグモード有効化中..."
for ver in 8 9 10 11 12 13; do
    defaults write com.adobe.CSXS.$ver PlayerDebugMode 1 2>/dev/null || true
done

# [3] UXP プラグインのインストール
echo "  [2/3] プラグインをインストール中..."
DEST_DIR="$HOME/Library/Application Support/Adobe/UXP/Plugins/${PLUGIN_ID}"
mkdir -p "${DEST_DIR}"
cp -R "${SCRIPT_DIR}/${PLUGIN_NAME}/"* "${DEST_DIR}/"

echo "  [3/3] インストール完了！"
echo ""
echo "  📌 次の手順:"
echo "     1. Premiere Pro を再起動"
echo "     2. ウィンドウ → UXP Plugins から ${PLUGIN_NAME} を表示"
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
    display dialog "✅ インストール完了！" & return & return & "Premiere Pro を再起動してください。" buttons {"OK"} default button "OK" with title "インストーラー" with icon note
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

:: [1] CEP デバッグモード有効化
echo   [1/3] CEP デバッグモード有効化中...
for %%v in (8 9 10 11 12 13) do (
    reg add "HKCU\Software\Adobe\CSXS.%%v" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
)

:: [2] 旧バージョンの削除（上書きインストール）
set "UXP_DIR=%APPDATA%\Adobe\UXP\Plugins\%PLUGIN_ID%"
if exist "%UXP_DIR%" (
    echo   🔄 旧バージョンを削除中...
    rmdir /s /q "%UXP_DIR%"
)
set "CEP_DIR=%APPDATA%\Adobe\CEP\extensions\%PLUGIN_ID%"
if exist "%CEP_DIR%" (
    echo   🔄 旧CEPバージョンを削除中...
    rmdir /s /q "%CEP_DIR%"
)

:: [3] プラグインのインストール
echo   [2/3] プラグインをインストール中...
if not exist "%UXP_DIR%" mkdir "%UXP_DIR%"
xcopy "%SCRIPT_DIR%%PLUGIN_NAME%" "%UXP_DIR%\" /E /I /Y >nul

echo   [3/3] インストール完了！
echo.
echo   📌 Premiere Pro を再起動してください
echo =========================================
pause
```

### 条件2: 配布対応エラーフリーインストーラー

インストーラーは **誰がインストールしてもエラーが出ない** ように以下を必ず実装する:

| チェック項目 | Mac | Windows |
|-------------|-----|---------|
| Adobeバージョン自動検出 | `/Applications/Adobe*/` ワイルドカード | `for /d` でProgram Files探索 |
| パス内スペース対応 | ダブルクォート必須 | ダブルクォート必須 |
| 権限エラー対策 | `chmod +x` 自動付与 | 管理者権限プロンプト |
| 文字化け防止 | UTF-8デフォルト | `chcp 65001 > nul` |
| TERM未設定対策 | `export TERM=xterm-256color` | N/A |
| `clear` 使用禁止 | ✅ 使わない | N/A |
| エラー即停止 | `set -e` | N/A |
| 進捗表示 | ステップ番号付き `echo` | ステップ番号付き `echo` |
| 完了/失敗通知 | `display dialog` (AppleScript) | `echo` + `pause` |

### 条件3: マニュアル（PDF形式）の必須作成

スクリプト作成時は **必ず PDF形式のマニュアル** を同梱する。`tool-manual-creator` スキルのフォーマットに準拠し、以下を含めること：

**ファイル名規則:** `{拡張機能のファイル名}_Manual.pdf` で統一（例: `PP-AutoCut_Manual.pdf`、`PP-Transcriber_Manual.pdf`）

**デザイン・レイアウトの必須要件:**
- **図解を積極的に使用**: UIのスクリーンショット、操作フロー図、ワークフロー図解などを挿入し、視覚的に分かりやすくすること
- **見やすいデザイン**: 見出し・区切り線・アイコン・色分けなどを活用し、プロフェッショナルで読みやすいレイアウトにすること
- **情報の階層化**: セクションごとに明確な見出しと余白を設け、スキャンしやすい構成にすること

**必須コンテンツ:**

1. **概要**: ツールの目的と特徴（1〜2文）
2. **動作環境**: 対応Adobeバージョン、OS要件
3. **インストール手順**: Mac/Win両方をステップバイステップ解説（図解付き）
   - 「ZIPを展開」→「インストーラーをダブルクリック」→「Adobeを再起動」→「パネルを表示」
4. **使い方**: 各機能の使用方法をスクリーンショット・図解付きで解説
5. **UIの説明**: 各ボタン・入力欄の役割（UI図解付き）
6. **トラブルシューティング**: よくある問題と解決法
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

スクリプト作成完了時に以下のチェックリストを **すべて確認** すること：

- [ ] パス区切り文字: Mac(`/`) と Win(`\`)の両方で動作するか
- [ ] 改行コード: LF（`\n`）で統一されているか（`.bat`ファイルのみCRLF可）
- [ ] 文字エンコーディング: UTF-8（BOMなし）で統一されているか
- [ ] パス内の日本語・スペース: ダブルクォートで囲んでいるか
- [ ] ファイル名の大文字小文字: Mac(大文字小文字区別なし) / Win(区別なし) / Linux(区別あり) を考慮
- [ ] インストーラーの Mac `.install-mac.sh` に実行権限付与済みか
- [ ] Windows `.bat` の先頭に `chcp 65001 > nul` があるか
- [ ] Mac インストール先パスの自動検出が正しいか
- [ ] Windows インストール先パスの自動検出が正しいか
- [ ] `.app` ラッパーがAppleScriptで正しく生成されるか

### 条件5: UIパネル形式（他パネルとのドッキング対応）

すべてのスクリプト・プラグインは **UIパネル形式** で作成し、他のパネルとドッキングできるようにする：

| 技術 | パネル形式の実装方法 |
|------|---------------------|
| **UXP Plugin** | `manifest.json` の `entrypoints[].type` を `"panel"` に設定 + `preferredDockedSize` を指定 |
| **CEP Extension** | `manifest.xml` の `<UI><Type>Panel</Type></UI>` を設定 |
| **ExtendScript** | `ScriptUI Panels` フォルダに配置 + `(thisObj instanceof Panel)` パターンで Dockable Panel 対応 |

> [!IMPORTANT]
> `"dialog"` や `"modalDialog"` 形式は使用禁止。必ず `"panel"` 形式にすること。

### 条件6: 上書きインストール（旧バージョン自動削除）

インストーラーは以下の仕様を必ず実装する：

1. **既存バージョンの検出**: インストール先フォルダにプラグイン/スクリプトが既に存在するかチェック
2. **旧ファイルの完全削除**: 存在する場合は `rm -rf`（Mac）/ `rmdir /s /q`（Win）で削除
3. **関連ファイルの削除**: 旧バージョンに紐づく設定ファイル以外の関連ファイルも削除
4. **新バージョンのコピー**: 削除後に新しいファイルをコピー
5. **ユーザー設定の保持**: `~/Library/Application Support/` 内のユーザー設定ファイルは保持

```bash
# Mac: 上書きインストールの基本パターン
DEST_DIR="/path/to/install"
if [ -d "${DEST_DIR}" ] || [ -L "${DEST_DIR}" ]; then
    echo "  🔄 旧バージョンを削除中..."
    rm -rf "${DEST_DIR}"
fi
mkdir -p "${DEST_DIR}"
cp -R "${SOURCE_DIR}/"* "${DEST_DIR}/"
```

```batch
:: Windows: 上書きインストールの基本パターン
if exist "%DEST_DIR%" (
    echo   旧バージョンを削除中...
    rmdir /s /q "%DEST_DIR%"
)
mkdir "%DEST_DIR%"
xcopy "%SOURCE_DIR%" "%DEST_DIR%\" /E /I /Y >nul
```

---

## 1. 開発アプローチの選択ガイド

| アプローチ | 技術 | パフォーマンス | UI | 適用場面 |
|---|---|---|---|---|
| **UXP プラグイン** ⭐推奨 | Modern JS (ES6+) + UXP API | ◎◎ | Adobe Spectrum | 新規開発すべて |
| **CEP エクステンション** | HTML5 + JS + ExtendScript | ◎ | 自由HTML5パネル | レガシー互換・v24以前対応 |
| **ExtendScript スクリプト** | JSX (ES3) | ○ | ScriptUI | CEPホストスクリプト |

### 最適解の判断基準
- **Premiere Pro v25.0以降が対象** → UXP プラグイン一択（最高性能、Adobe公式推奨）
- **v24以前との互換性が必要** → CEP エクステンション
- **CEPのホスト側ロジック** → ExtendScript（CEP内部で使用）

### UXP vs CEP 比較

| 項目 | CEP | UXP |
|------|-----|-----|
| API | ExtendScript (ES3) | Modern JS (ES6+) |
| 通信 | `csInterface.evalScript()` | 直接APIコール `require("premierepro")` |
| 処理 | 同期（UIブロック） | 非同期（async/await） |
| UI | 完全自由（HTML/CSS） | Adobe Spectrum Web Components 推奨 |
| 将来性 | 廃止予定 | Adobe公式推奨 |
| 時間単位 | Ticks (`254016000000/秒`) | `TickTime.createWithSeconds()` |
| トランザクション | なし | `project.executeTransaction()` |

---

## 2. UXP プラグイン開発（推奨）

### 2.1 ディレクトリ構成

```
MyPlugin-UXP/
├── manifest.json      # プラグイン定義（必須）
├── index.html         # パネルUI（Spectrum Web Components）
├── index.js           # ロジック（UXP API）
└── styles.css         # スタイル
```

### 2.2 manifest.json テンプレート

```json
{
    "id": "com.yourname.my-plugin",
    "name": "My Plugin",
    "version": "1.0.0",
    "main": "index.html",
    "host": [
        {
            "app": "premierepro",
            "minVersion": "25.0"
        }
    ],
    "manifestVersion": 6,
    "apiVersion": 2,
    "entrypoints": [
        {
            "type": "panel",
            "id": "my-plugin-panel",
            "label": {
                "default": "My Plugin",
                "ja": "マイプラグイン"
            },
            "minimumSize": {
                "width": 280,
                "height": 400
            },
            "maximumSize": {
                "width": 600,
                "height": 1200
            },
            "preferredDockedSize": {
                "width": 320,
                "height": 600
            },
            "preferredFloatingSize": {
                "width": 320,
                "height": 600
            }
        }
    ],
    "requiredPermissions": {
        "network": {
            "domains": [
                "http://localhost:5050",
                "http://127.0.0.1:5050"
            ]
        },
        "localFileSystem": "fullAccess",
        "clipboard": "readAndWrite"
    }
}
```

**manifest.json の重要なフィールド:**
- `apiVersion`: `2`（Premiere Pro UXP API v2を使用）
- `manifestVersion`: `6`（2025年現在の最新）
- `host.app`: `"premierepro"`（固定文字列）
- `host.minVersion`: `"25.0"`（Premiere Pro 2025 = v25）
- `requiredPermissions.network`: バックエンドサーバーと通信する場合に必要
- `requiredPermissions.localFileSystem`: `"fullAccess"` でファイルI/O可能

### 2.3 HTML パネル テンプレート（Spectrum Web Components）

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="styles.css">
</head>

<body>
    <div id="app">
        <!-- ヘッダー -->
        <div class="header">
            <sp-heading size="M">🛠 My Plugin</sp-heading>
            <sp-body size="S" class="subtitle">プラグインの説明</sp-body>
        </div>

        <!-- ステータス表示 -->
        <div class="status-bar" id="statusBar">
            <div id="statusText" class="status-text">📋 準備完了</div>
        </div>

        <sp-divider size="S"></sp-divider>

        <!-- メインセクション -->
        <div class="section">
            <sp-heading size="XS">操作</sp-heading>

            <!-- テキスト入力 -->
            <sp-textfield id="inputField" placeholder="入力..." style="width: 100%;"></sp-textfield>

            <!-- ドロップダウン -->
            <sp-picker id="modeSelect" size="M" style="width: 100%;">
                <sp-menu-item value="option1">オプション1</sp-menu-item>
                <sp-menu-item value="option2" selected>オプション2</sp-menu-item>
            </sp-picker>

            <!-- ボタン -->
            <sp-button variant="accent" id="btnExecute" size="M" style="width: 100%;">
                ▶ 実行
            </sp-button>

            <!-- ボタングループ -->
            <div style="display: flex; gap: 4px;">
                <sp-button variant="secondary" id="btnAction1" size="S" style="flex: 1;">
                    アクション1
                </sp-button>
                <sp-button variant="secondary" id="btnAction2" size="S" style="flex: 1;">
                    アクション2
                </sp-button>
            </div>

            <!-- トグルボタン -->
            <div class="setting-row">
                <sp-body size="S">モード:</sp-body>
                <div class="template-toggle">
                    <sp-button variant="secondary" id="btnMode1" size="S" selected>モード1</sp-button>
                    <sp-button variant="secondary" id="btnMode2" size="S">モード2</sp-button>
                </div>
            </div>
        </div>

        <!-- プログレスバー -->
        <div id="progressSection" style="display: none;">
            <sp-progressbar id="progressBar" value="0" max="100" size="M"
                style="width: 100%;"></sp-progressbar>
        </div>
    </div>

    <script src="index.js"></script>
</body>

</html>
```

**Spectrum Web Components 主要タグ:**
- `<sp-heading size="M|S|XS">` — 見出し
- `<sp-body size="M|S|XS">` — テキスト
- `<sp-button variant="accent|cta|secondary" size="M|S">` — ボタン（`accent`=青, `cta`=プライマリ, `secondary`=グレー）
- `<sp-textfield>` — テキスト入力
- `<sp-picker>` + `<sp-menu-item>` — ドロップダウン
- `<sp-checkbox>` — チェックボックス
- `<sp-divider size="S">` — 区切り線
- `<sp-progressbar>` — プログレスバー
- `<sp-slider min="0" max="100" value="50">` — スライダー
- `selected` 属性 — ボタンの選択状態（`setAttribute("selected", "")` / `removeAttribute("selected")`）

### 2.4 CSS テンプレート

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: "Adobe Clean", "Segoe UI", "Meiryo", sans-serif;
    font-size: 12px;
    color: #e0e0e0;
    background-color: #323232;
    padding: 8px;
}

#app {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.header {
    text-align: center;
    padding: 8px 0;
}

.subtitle {
    color: #888;
    margin-top: 2px;
}

.status-bar {
    background: #2a2a2a;
    border-radius: 6px;
    padding: 8px 10px;
}

.status-text {
    font-size: 11px;
    color: #ccc;
    white-space: pre-wrap;
    word-break: break-word;
}

.section {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.setting-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.template-toggle {
    display: flex;
    gap: 4px;
}

sp-divider {
    margin: 4px 0;
}

.hint {
    color: #888;
    font-size: 10px;
}
```

### 2.5 JavaScript ロジック テンプレート

```javascript
/**
 * My Plugin UXP
 * プラグインの説明
 */

const ppro = require("premierepro");

// UXP ファイルシステム（ファイルI/Oが必要な場合）
// const uxpFs = require("uxp").storage.localFileSystem;

let isProcessing = false;
const elements = {};

document.addEventListener("DOMContentLoaded", () => {
    initElements();
    initEventListeners();
});

function initElements() {
    elements.statusText = document.getElementById("statusText");
    elements.btnExecute = document.getElementById("btnExecute");
    // 他のUI要素を登録
}

function initEventListeners() {
    elements.btnExecute.addEventListener("click", executeMain);
    // 他のイベントリスナーを登録
}

function updateStatus(message) {
    elements.statusText.textContent = message;
}

/**
 * メイン処理
 */
async function executeMain() {
    if (isProcessing) return;
    isProcessing = true;

    try {
        updateStatus("⏳ 処理中...");

        // 1. プロジェクト・シーケンスの取得
        const project = await ppro.Project.getActiveProject();
        if (!project) {
            updateStatus("❌ プロジェクトが開かれていません");
            return;
        }

        const sequence = await project.getActiveSequence();
        if (!sequence) {
            updateStatus("❌ シーケンスが選択されていません");
            return;
        }

        // 2. 実処理（トランザクション内で変更を実行）
        await project.executeTransaction((compoundAction) => {
            // アクションを追加
            // compoundAction.addAction(action);
        });

        updateStatus("✅ 完了！");
    } catch (e) {
        console.error("Error:", e);
        updateStatus(`❌ エラー: ${e.message}`);
    } finally {
        isProcessing = false;
    }
}
```

---

## 3. UXP API v2 リファレンス

### 3.1 主要オブジェクト階層

```
ppro (require("premierepro"))
├── Project.getActiveProject()
│   ├── getActiveSequence() → Sequence
│   ├── getRootItem() → ProjectItem
│   ├── importFiles([paths])
│   └── executeTransaction(callback)
│
├── Sequence
│   ├── name
│   ├── getVideoTrackCount() / getVideoTrack(index)
│   ├── getAudioTrackCount() / getAudioTrack(index)
│   ├── getCaptionTrackCount() / getCaptionTrack(index)
│   └── getPlayerPosition()
│
├── Track (VideoTrack / AudioTrack)
│   ├── getTrackItems(type, includeEmpty)
│   └── razor(timeTicks)  ※利用可能な場合
│
├── TrackItem
│   ├── getName()
│   ├── getStartTime() / getEndTime() → TickTime
│   ├── getInPoint() / getOutPoint()
│   ├── getProjectItem() → ProjectItem
│   ├── getComponentChain() → ComponentChain
│   └── remove()
│
├── ProjectItem
│   ├── name / type
│   ├── getMediaFilePath()
│   ├── getItems() — ビン内のアイテム
│   ├── createBinAction(name, unique)
│   └── createMoveItemAction(item, targetBin)
│
├── Markers
│   └── getMarkers(sequence)
│       ├── createAddMarkerAction(name, type, start, duration, comment)
│       └── getMarkerCount()
│
├── TickTime
│   ├── createWithSeconds(seconds) — 秒からTickTimeを生成
│   ├── createWithTicks(ticks) — Ticksから生成
│   ├── seconds — 秒数を取得
│   └── ticks — Ticks値を取得
│
├── Constants
│   └── TrackItemType.CLIP — クリップタイプのフィルター
│
└── ComponentChain → Component → Property
    ├── getComponentCount()
    ├── getComponentAtIndex(i) → Component
    │   ├── getMatchName()
    │   ├── getPropertyCount()
    │   └── getProperty(i) → Property
    │       ├── displayName / name
    │       ├── getValue()
    │       └── setValue(value)
```

### 3.2 時間管理

UXP API v2 では `TickTime` オブジェクトを使用する。

```javascript
// 秒 → TickTime
const tickTime = ppro.TickTime.createWithSeconds(10.5);

// TickTime → 秒
const seconds = tickTime.seconds;

// Ticks 直接指定（1秒 = 254016000000 ticks）
const TICKS_PER_SECOND = 254016000000;
const tickTimeFromTicks = ppro.TickTime.createWithTicks(5 * TICKS_PER_SECOND);

// マーカー挿入用（時間ゼロのduration）
const zeroDuration = ppro.TickTime.createWithSeconds(0);
```

**重要**: Premiere Pro の内部時間は **Ticks** 単位（`254016000000 ticks/秒`）。比較やレンジチェックでは Ticks で計算する。

### 3.3 トランザクション（変更操作の必須パターン）

UXP APIでシーケンスやプロジェクトに変更を加える場合、**`executeTransaction()`** 内で実行する必要がある。

```javascript
const project = await ppro.Project.getActiveProject();

// マーカー挿入の例
const sequence = await project.getActiveSequence();
const markers = await ppro.Markers.getMarkers(sequence);

await project.executeTransaction((compoundAction) => {
    for (const seg of segments) {
        const start = ppro.TickTime.createWithSeconds(seg.start);
        const duration = ppro.TickTime.createWithSeconds(0);
        const action = markers.createAddMarkerAction(
            seg.text,        // マーカー名
            "Comment",       // マーカータイプ
            start,           // 開始時間
            duration,        // 持続時間
            seg.text         // コメント
        );
        compoundAction.addAction(action);
    }
});

// ビン作成の例
const rootItem = await project.getRootItem();
await project.executeTransaction((ca) => {
    const action = rootItem.createBinAction("MyBin", true);
    ca.addAction(action);
});
```

### 3.4 トラック・クリップ操作

```javascript
const project = await ppro.Project.getActiveProject();
const sequence = await project.getActiveSequence();
const TIT = ppro.Constants.TrackItemType;

// ビデオトラック走査
const videoTrackCount = await sequence.getVideoTrackCount();
for (let v = 0; v < videoTrackCount; v++) {
    const track = await sequence.getVideoTrack(v);
    const trackItems = await track.getTrackItems(TIT.CLIP, false);

    for (const item of trackItems) {
        const name = await item.getName();
        const startTime = await item.getStartTime();  // TickTime
        const endTime = await item.getEndTime();       // TickTime
        const duration = endTime.seconds - startTime.seconds;

        // プロジェクトアイテム取得
        const projectItem = await item.getProjectItem();
        if (projectItem) {
            const mediaPath = await projectItem.getMediaFilePath();
        }

        // コンポーネント（エフェクト・プロパティ）操作
        const chain = await item.getComponentChain();
        const compCount = await chain.getComponentCount();
        for (let c = 0; c < compCount; c++) {
            const comp = await chain.getComponentAtIndex(c);
            const matchName = await comp.getMatchName();
            const propCount = await comp.getPropertyCount();
            for (let p = 0; p < propCount; p++) {
                const prop = await comp.getProperty(p);
                const val = await prop.getValue();
                // prop.setValue(newValue) で変更可能
            }
        }
    }
}
```

### 3.5 バックエンド連携パターン（fetch API）

UXP環境では `fetch()` が利用可能。Pythonバックエンドとの通信パターン：

```javascript
const BACKEND_URL = "http://localhost:5050";

async function callBackend(endpoint, data) {
    try {
        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error(`サーバーエラー: ${response.status}`);

        const result = await response.json();
        if (result.error) throw new Error(result.error);
        return result;
    } catch (e) {
        if (e.message.includes("Failed to fetch")) {
            throw new Error("バックエンドサーバーに接続できません。server.py を起動してください。");
        }
        throw e;
    }
}
```

**注意**: `manifest.json` の `requiredPermissions.network.domains` に通信先URLを追加することが必須。

### 3.6 ファイル I/O（UXP File System）

```javascript
const uxpFs = require("uxp").storage.localFileSystem;

// ファイルを開く
const file = await uxpFs.getFileForOpening({ types: ["srt", "txt", "json"] });
if (file) {
    const content = await file.read();
    const fileName = file.name;
    const nativePath = file.nativePath;
}

// フォルダを選択
const folder = await uxpFs.getFolder();

// 一時フォルダに書き込み
const tempFolder = await uxpFs.getTemporaryFolder();
const newFile = await tempFolder.createFile("output.txt", { overwrite: true });
await newFile.write("ファイル内容");

// クリップボード
await navigator.clipboard.writeText("テキスト");
const text = await navigator.clipboard.readText();
```

### 3.7 カット実行パターン（Back-to-Front）

タイムライン操作では**後ろから前へ（降順）**処理することが必須。前から処理するとインデックスがずれる。

```javascript
async function executeCuts(regions) {
    const project = await ppro.Project.getActiveProject();
    const sequence = await project.getActiveSequence();
    const TIT = ppro.Constants.TrackItemType;

    // 後ろから順にソート（必須）
    const sorted = [...regions].sort((a, b) => b.start - a.start);

    const ticksPerSecond = 254016000000;
    const tolerance = ticksPerSecond * 0.05;  // 50ms tolerance

    for (const region of sorted) {
        const startTicks = Math.round(region.start * ticksPerSecond);
        const endTicks = Math.round(region.end * ticksPerSecond);

        // 全トラックでrazor
        const vCount = await sequence.getVideoTrackCount();
        for (let v = 0; v < vCount; v++) {
            const track = await sequence.getVideoTrack(v);
            if (typeof track.razor === "function") {
                await track.razor(startTicks);
                await track.razor(endTicks);
            }
        }

        // 区間内クリップを削除（tolerance付きレンジチェック）
        for (let v = 0; v < vCount; v++) {
            const track = await sequence.getVideoTrack(v);
            const items = await track.getTrackItems(TIT.CLIP, false);
            for (const item of items) {
                const iStart = item.startTime.ticks;
                const iEnd = item.endTime.ticks;
                if (Math.abs(iStart - startTicks) < tolerance &&
                    Math.abs(iEnd - endTicks) < tolerance) {
                    await item.remove();
                }
            }
        }
    }
}
```

---

## 4. CEP エクステンション開発（レガシー互換）

### 4.1 ディレクトリ構成

```
MyExtension/
├── .debug                    # デバッグ設定（オプション）
├── CSXS/
│   └── manifest.xml          # エクステンション定義
├── client/
│   ├── index.html            # パネルUI
│   └── libs/
│       └── CSInterface.js    # Adobe提供の通信ライブラリ
└── host/
    └── hostscript.jsx        # ExtendScript ホストスクリプト
```

### 4.2 manifest.xml テンプレート

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ExtensionManifest Version="7.0"
    ExtensionBundleId="com.yourname.extensionid"
    ExtensionBundleVersion="1.0.0"
    ExtensionBundleName="My Extension"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <ExtensionList>
        <Extension Id="com.yourname.extensionid.panel" Version="1.0.0"/>
    </ExtensionList>
    <ExecutionEnvironment>
        <HostList>
            <Host Name="PPRO" Version="[23.0,99.9]"/>
        </HostList>
        <LocaleList>
            <Locale Code="All"/>
        </LocaleList>
        <RequiredRuntimeList>
            <RequiredRuntime Name="CSXS" Version="9.0"/>
        </RequiredRuntimeList>
    </ExecutionEnvironment>
    <DispatchInfoList>
        <Extension Id="com.yourname.extensionid.panel">
            <DispatchInfo>
                <Resources>
                    <MainPath>./client/index.html</MainPath>
                    <ScriptPath>./host/hostscript.jsx</ScriptPath>
                    <CEFCommandLine>
                        <Parameter>--enable-nodejs</Parameter>
                        <Parameter>--mixed-context</Parameter>
                    </CEFCommandLine>
                </Resources>
                <Lifecycle>
                    <AutoVisible>true</AutoVisible>
                </Lifecycle>
                <UI>
                    <Type>Panel</Type>
                    <Menu>My Extension</Menu>
                    <Geometry>
                        <Size>
                            <Height>450</Height>
                            <Width>350</Width>
                        </Size>
                        <MinSize>
                            <Height>350</Height>
                            <Width>280</Width>
                        </MinSize>
                    </Geometry>
                </UI>
            </DispatchInfo>
        </Extension>
    </DispatchInfoList>
</ExtensionManifest>
```

**Host Name の主要値:**
- `PPRO` = Premiere Pro
- `AEFT` = After Effects
- `PHXS` / `PHSP` = Photoshop
- `ILST` = Illustrator

### 4.3 CEP → ExtendScript 通信パターン

```html
<!-- client/index.html -->
<script src="libs/CSInterface.js"></script>
<script>
    var csInterface = new CSInterface();

    function runScript(funcCall, callback) {
        csInterface.evalScript(funcCall, function(result) {
            try {
                var res = JSON.parse(result);
                if (res.success) {
                    callback(null, res);
                } else {
                    callback(res.message || "Unknown error");
                }
            } catch (e) {
                if (result === "EvalScript error." || result === "undefined") {
                    callback("スクリプト実行エラー");
                } else {
                    callback(null, result);
                }
            }
        });
    }

    // 使用例
    document.getElementById("btnAction").addEventListener("click", function() {
        runScript('myAction("arg1")', function(err, result) {
            if (err) { alert("エラー: " + err); return; }
            // 成功時の処理
        });
    });
</script>
```

### 4.4 ExtendScript ホストスクリプト テンプレート（Premiere Pro用）

```javascript
// host/hostscript.jsx

// JSON ポリフィル（ExtendScript は ES3 ベースのため必須）
if (typeof JSON === "undefined") { JSON = {}; }
if (typeof JSON.stringify !== "function") {
    JSON.stringify = function(obj) {
        if (obj === null) return "null";
        if (typeof obj === "undefined") return undefined;
        if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
        if (typeof obj === "string") {
            return '"' + obj.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
                            .replace(/\n/g, "\\n").replace(/\r/g, "\\r") + '"';
        }
        if (obj instanceof Array) {
            var a = [];
            for (var i = 0; i < obj.length; i++) { a.push(JSON.stringify(obj[i])); }
            return "[" + a.join(",") + "]";
        }
        if (typeof obj === "object") {
            var p = [];
            for (var k in obj) {
                if (obj.hasOwnProperty(k)) {
                    p.push('"' + k + '":' + JSON.stringify(obj[k]));
                }
            }
            return "{" + p.join(",") + "}";
        }
        return String(obj);
    };
}

/**
 * シーケンス情報を取得する
 */
function getSequenceInfo() {
    try {
        var seq = app.project.activeSequence;
        if (!seq) {
            return JSON.stringify({ success: false, message: "シーケンスがありません" });
        }
        return JSON.stringify({
            success: true,
            data: {
                name: seq.name,
                videoTrackCount: seq.videoTracks.numTracks,
                audioTrackCount: seq.audioTracks.numTracks,
                frameSizeH: seq.frameSizeHorizontal,
                frameSizeV: seq.frameSizeVertical
            }
        });
    } catch (e) {
        return JSON.stringify({ success: false, message: "エラー: " + e.message });
    }
}

/**
 * カット実行（CEPバージョン / QE DOM対応）
 */
function executeCuts(jsonStr) {
    try {
        var data = eval("(" + jsonStr + ")");
        var seq = app.project.activeSequence;
        if (!seq) {
            return JSON.stringify({ success: false, message: "シーケンスがありません" });
        }

        // QE DOMを有効化（低レベルAPIアクセス用）
        app.enableQE();

        var ticksPerSecond = 254016000000;
        var regions = data.regions || [];

        // 後ろから順に処理（必須）
        regions.sort(function(a, b) { return b.start - a.start; });

        var cutCount = 0;
        for (var i = 0; i < regions.length; i++) {
            var region = regions[i];
            var startTicks = String(Math.round(region.start * ticksPerSecond));
            var endTicks = String(Math.round(region.end * ticksPerSecond));

            // 全ビデオトラックでrazor
            for (var v = 0; v < seq.videoTracks.numTracks; v++) {
                seq.videoTracks[v].razorClipAtTime(startTicks);
                seq.videoTracks[v].razorClipAtTime(endTicks);
            }
            // 全オーディオトラックでrazor
            for (var a = 0; a < seq.audioTracks.numTracks; a++) {
                seq.audioTracks[a].razorClipAtTime(startTicks);
                seq.audioTracks[a].razorClipAtTime(endTicks);
            }

            // 区間内クリップのみ削除
            var tolerance = ticksPerSecond * 0.05;
            for (var v2 = 0; v2 < seq.videoTracks.numTracks; v2++) {
                var clips = seq.videoTracks[v2].clips;
                for (var c = clips.numItems - 1; c >= 0; c--) {
                    var clip = clips[c];
                    var cs = Number(clip.start.ticks);
                    var ce = Number(clip.end.ticks);
                    if (Math.abs(cs - Number(startTicks)) < tolerance &&
                        Math.abs(ce - Number(endTicks)) < tolerance) {
                        clip.remove(false, false);
                        cutCount++;
                    }
                }
            }
        }

        return JSON.stringify({ success: true, message: cutCount + "クリップを削除しました" });
    } catch (e) {
        return JSON.stringify({ success: false, message: "カットエラー: " + e.message + " (行:" + e.line + ")" });
    }
}
```

### 4.5 CEP 開発環境セットアップ

```bash
# デバッグモードを有効化（必須）
for ver in 8 9 10 11 12 13; do
    defaults write com.adobe.CSXS.$ver PlayerDebugMode 1 2>/dev/null || true
done

# エクステンションをシンボリックリンクでインストール（開発中）
ln -s /path/to/MyExtension "$HOME/Library/Application Support/Adobe/CEP/extensions/com.yourname.extensionid"

# Premiere Proを再起動後、ウィンドウ → エクステンション で表示
```

---

## 5. 開発のベストプラクティス

### 5.1 事前チェック・防御プログラミング

```javascript
// UXP版
async function safeExecute() {
    const project = await ppro.Project.getActiveProject();
    if (!project) { updateStatus("❌ プロジェクトが開かれていません"); return; }

    const sequence = await project.getActiveSequence();
    if (!sequence) { updateStatus("❌ シーケンスが選択されていません"); return; }

    // トラックにクリップがあるか確認
    const vCount = await sequence.getVideoTrackCount();
    if (vCount === 0) { updateStatus("❌ ビデオトラックがありません"); return; }
}
```

### 5.2 Back-to-Front 処理（タイムライン操作の鉄則）

タイムラインのクリップを削除・分割する場合は、**必ず後ろから前へ処理**する。前から処理すると、削除や分割によって後続クリップの時間座標がずれる。

```javascript
// ✅ 正しい: 後ろから順にソート
const sorted = [...regions].sort((a, b) => b.start - a.start);

// ❌ 間違い: 前から順にソート
// const sorted = [...regions].sort((a, b) => a.start - b.start);
```

### 5.3 50ms Tolerance パターン

クリップの開始・終了が完全一致しないことがある。レンジチェックには **±50ms (0.05秒)** のトレランスを設ける。

```javascript
const TICKS_PER_SECOND = 254016000000;
const TOLERANCE = TICKS_PER_SECOND * 0.05;  // 50ms

function isInRange(clipStart, clipEnd, targetStart, targetEnd) {
    return Math.abs(clipStart - targetStart) < TOLERANCE &&
           Math.abs(clipEnd - targetEnd) < TOLERANCE;
}
```

### 5.4 isProcessing ガード

ボタン連打による重複実行を防止：

```javascript
let isProcessing = false;

async function myAction() {
    if (isProcessing) return;
    isProcessing = true;
    try {
        // 処理
    } finally {
        isProcessing = false;
    }
}
```

### 5.5 ProjectItem 探索フォールバックパターン

UXP APIではタイムラインクリップからProjectItemへのリンクが切れることがある。複数パターンで探索する：

```javascript
async function getMediaPath(trackItem) {
    let mediaPath = "";

    // パターン1: 直接プロパティ
    try {
        const pi = trackItem.projectItem;
        if (pi) mediaPath = await pi.getMediaPath();
    } catch (e) { }

    // パターン2: getProjectItem() → getMediaFilePath()
    if (!mediaPath) {
        try {
            const pi = await trackItem.getProjectItem();
            if (pi && pi.name) {
                const project = await ppro.Project.getActiveProject();
                const rootItem = await project.getRootItem();
                const children = await rootItem.getItems();
                for (const child of children) {
                    if (child.name === pi.name && typeof child.getMediaFilePath === "function") {
                        mediaPath = await child.getMediaFilePath();
                        break;
                    }
                }
            }
        } catch (e) { }
    }

    return mediaPath;
}
```

---

## 6. UXP プラグインのセットアップとデプロイ

### 6.1 開発環境セットアップ

1. **UXP Developer Tool のインストール**: Creative Cloud デスクトップアプリ → 「すべてのアプリ」→ 「UXP Developer Tool」
2. **開発者モードの有効化**: Premiere Pro → 設定 → プラグイン → 「開発者モードを有効にする」✅ → 再起動
3. **プラグインのロード**: UXP Developer Tool → 「Create Plugin」→ プラグインフォルダを選択 → 「Load & Watch」
4. **パネルの表示**: Premiere Pro → ウィンドウ → UXP Plugins

### 6.2 プラグインのロード手順（ワークフロー）

```bash
# ワークフロー /load-uxp-plugins を参照
# 1. Premiere Pro を開発者モードで起動
# 2. UXP Developer Tool を起動
# 3. 各プラグインフォルダを追加してLoad
```

### 6.3 パッケージング

配布用パッケージ（.ccx）の作成は UXP Developer Tool の「Package」機能を使用。

---

## 7. トラブルシューティング

### 7.1 UXP プラグインが読み込まれない
1. Premiere Pro の開発者モードが有効か確認（設定 → プラグイン）
2. `manifest.json` の `host.minVersion` がインストール済みバージョン以下か確認
3. `manifest.json` の構文エラーを確認（JSON lint）
4. UXP Developer Tool のログでエラーメッセージを確認

### 7.2 CEP パネルが表示されない
1. `PlayerDebugMode` が有効か: `defaults read com.adobe.CSXS.12 PlayerDebugMode`
2. `manifest.xml` の `ExtensionBundleId` とフォルダ名が一致していない
3. `CSInterface.js` が破損（10KB未満の場合は破損の可能性）
4. `Host Version` 範囲にPremiere Proのバージョンが含まれていない

### 7.3 EvalScript error（CEP）
- `hostscript.jsx` の ES3 構文違反（`let`/`const`、アロー関数、テンプレートリテラルは使用不可）
- `ScriptPath` のパスが不正
- 関数名のタイプミス

### 7.4 全クリップが消えた（AutoCut系）
- **原因**: レンジチェックが不正確で、意図しないクリップを削除
- **対策**: 50ms tolerance パターン（セクション5.3）を必ず使用
- **確認**: Cmd+Z（Undo）で復元後、Cut対象のマーカー位置を確認

### 7.5 キャプション・テキストレイヤー配置の失敗
- PSD/PNG/JPGファイルが`TextTemplate`として誤認識される → 画像ファイルを除外するフィルターを追加
- Essential Graphics のプロパティ構造が異なる → `getComponentChain()` でプロパティ名を探索

### 7.6 バックエンドサーバー接続エラー
```bash
# ヘルスチェック
curl http://localhost:5050/health

# サーバーを強制終了して再起動
lsof -ti:5050 | xargs kill -9
cd /path/to/backend && source venv/bin/activate && python server.py
```

### 7.7 `manifest.json` の `requiredPermissions` 未設定
- ネットワークアクセスや`localFileSystem`を使用する場合、`requiredPermissions` に明示的に記述しないと**サイレントに失敗**する

---

## 8. コーディング規約

### ファイルヘッダー（必須）
```javascript
/**
 * PluginName UXP Plugin / CEP Extension
 * 機能の説明
 *
 * UXP API v2 対応 / CEP + ExtendScript 対応
 */
```

### 命名規則
- **プラグインID**: `com.yourname.plugin-name`（ケバブケース）
- **ファイル名**: `index.js`、`manifest.json`（UXP標準）
- **関数名**: camelCase (`getClipInfo`, `executeMain`)
- **定数**: UPPER_SNAKE_CASE (`BACKEND_URL`, `TICKS_PER_SECOND`)
- **UI要素オブジェクト**: `elements.btnAction`, `elements.statusText`

### エラーメッセージ
- ユーザー向けステータスは **日本語 + 絵文字** で記述（`✅ 完了`, `❌ エラー`, `⏳ 処理中`, `⚠️ 警告`）
- コンソールログは英語（`console.error("Error:", e)`）
- エラー時は **原因と解決法** の両方を含める

---

## 9. 既存プロジェクトリファレンス

### UXP プラグイン（推奨）
- **PP-AutoCut UXP**: `/Users/takahashikenta/projects/Premiere/Plugin/PP-AutoCut-UXP/`
- **PP-Caption UXP**: `/Users/takahashikenta/projects/Premiere/Plugin/PP-Caption-UXP/`
- **PP-AnchorPoint UXP**: `/Users/takahashikenta/projects/Premiere/Plugin/PP-AnchorPoint-UXP/`
- **PP-Transcriber UXP**: `/Users/takahashikenta/projects/Premiere/Plugin/PP-Transcriber-UXP/`
- **README**: `/Users/takahashikenta/projects/Premiere/Plugin/PP-UXP-README.md`

### CEP エクステンション（レガシー）
- **PP-AutoCut CEP**: `/Users/takahashikenta/projects/remotion-video/PremiereTools/PP-AutoCut/`
- **PP-Caption CEP**: `/Users/takahashikenta/projects/remotion-video/PremiereTools/PP-Caption/`
- **PP-Transcriber CEP**: `/Users/takahashikenta/projects/remotion-video/PremiereTools/PP-Transcriber/`

### バックエンドサーバー
- **UXP版**: `/Users/takahashikenta/projects/Premiere/Plugin/backend/`
- **CEP版**: `/Users/takahashikenta/projects/remotion-video/PremiereTools/backend/`

---

このスキルはPremiere Proのプラグイン・エクステンション・スクリプト関連のコード生成・修正・パッケージ作成・トラブルシューティングの際に基準として利用されます。
