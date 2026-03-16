---
name: illustrator-dev
description: Adobe Illustratorのエクステンション（CEP）・プラグイン・スクリプト（ExtendScript）開発のベストプラクティスとテンプレート
metadata:
  tags: illustrator, cep, extendscript, jsx, plugin, extension, adobe, automation
---

# Adobe Illustrator 開発スキル

Illustrator向けのエクステンション（CEP）、スクリプト（ExtendScript）、およびプラグイン開発を包括的にカバーするスキル。

---

## 🔴 スクリプト作成時の必須条件

> [!CAUTION]
> **以下の6項目はスクリプト・エクステンション作成時に必ず遵守すること。1つでも欠けた成果物は不完全とみなす。**

### 条件1: インストーラーの必須作成

スクリプト・エクステンションを作成したら、**必ず「インストーラー.app」（Mac）と「インストーラー.bat」（Windows）** を作成する。素人がダブルクリックだけでインストールできること。

**配布パッケージ構成:**

```
配布パッケージ/
├── MyExtension Installer.app  ← Mac用ダブルクリックインストーラー（AppleScript）
├── .install-mac.sh            ← 実際のインストール処理（隠しファイル）
├── install-win.bat            ← Windows用インストーラー
├── MyExtension/               ← CEPエクステンション本体
│   ├── CSXS/manifest.xml
│   ├── index.html
│   ├── jsx/hostscript.jsx
│   └── js/CSInterface.js
└── MyExtension_Manual.pdf     ← マニュアル（PDF形式・拡張機能名_Manual）
```

**Mac インストーラー雛形（CEPエクステンション用 .install-mac.sh）:**

```bash
#!/bin/bash
set -e
cd "$(dirname "$0")"
SCRIPT_DIR="$(pwd)"
EXT_NAME="MyExtension"
EXT_ID="com.yourname.extensionid"
CEP_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions"

# ⚠️ clear は使わない（AppleScript do shell script 経由では TERM 未設定でエラーになる）
export TERM=xterm-256color

echo "========================================="
echo "  ${EXT_NAME} インストーラー"
echo "========================================="

# [1] CEP デバッグモード有効化
echo "  [1/3] CEP デバッグモード有効化中..."
for ver in 8 9 10 11 12 13; do
    defaults write com.adobe.CSXS.$ver PlayerDebugMode 1 2>/dev/null || true
done

# [2] 旧バージョンの完全削除（上書きインストール）
echo "  [2/3] エクステンションをインストール中..."
mkdir -p "${CEP_DIR}"
if [ -d "${CEP_DIR}/${EXT_ID}" ] || [ -L "${CEP_DIR}/${EXT_ID}" ]; then
    echo "  🔄 旧バージョンを検出・削除中..."
    rm -rf "${CEP_DIR}/${EXT_ID}"
fi

# [3] 新バージョンのコピー
cp -R "${SCRIPT_DIR}/${EXT_NAME}" "${CEP_DIR}/${EXT_ID}"

echo "  [3/3] インストール完了！"
echo ""
echo "  📌 次の手順:"
echo "     1. Illustrator を再起動"
echo "     2. ウィンドウ → エクステンション → ${EXT_NAME}"
echo "========================================="
```

**AppleScript .app ビルドコマンド:**

```bash
osacompile -o "${PKG_DIR}/${EXT_NAME} Installer.app" -e '
try
    set scriptFolder to do shell script "dirname " & quoted form of POSIX path of (path to me)
    set installScript to scriptFolder & "/.install-mac.sh"
    do shell script "chmod +x " & quoted form of installScript
    set result to do shell script quoted form of installScript
    display dialog "✅ インストール完了！" & return & return & "Illustrator を再起動してください。" buttons {"OK"} default button "OK" with title "インストーラー" with icon note
on error errMsg number errNum
    display dialog "❌ エラー:" & return & errMsg buttons {"OK"} default button "OK" with title "インストール失敗" with icon stop
end try
'
```

**Windows インストーラー雛形（install-win.bat）:**

```batch
@echo off
chcp 65001 > nul
set "EXT_NAME=MyExtension"
set "EXT_ID=com.yourname.extensionid"
set "CEP_DIR=%APPDATA%\Adobe\CEP\extensions"
set "SCRIPT_DIR=%~dp0"

echo =========================================
echo   %EXT_NAME% インストーラー
echo =========================================

:: [1] CEP デバッグモード有効化
echo   [1/3] CEP デバッグモード有効化中...
for %%v in (8 9 10 11 12 13) do (
    reg add "HKCU\Software\Adobe\CSXS.%%v" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
)

:: [2] 旧バージョンの削除（上書きインストール）
if exist "%CEP_DIR%\%EXT_ID%" (
    echo   🔄 旧バージョンを削除中...
    rmdir /s /q "%CEP_DIR%\%EXT_ID%"
)

:: [3] エクステンションのインストール
echo   [2/3] エクステンションをインストール中...
if not exist "%CEP_DIR%" mkdir "%CEP_DIR%"
xcopy "%SCRIPT_DIR%%EXT_NAME%" "%CEP_DIR%\%EXT_ID%\" /E /I /Y >nul

echo   [3/3] インストール完了！
echo.
echo   📌 Illustrator を再起動してください
echo =========================================
pause
```

### 条件2: 配布対応エラーフリーインストーラー

インストーラーは **誰がインストールしてもエラーが出ない** ように以下を必ず実装する:

| チェック項目 | Mac | Windows |
|-------------|-----|---------|
| CEPパス自動設定 | `~/Library/Application Support/Adobe/CEP/extensions/` | `%APPDATA%\Adobe\CEP\extensions\` |
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

**ファイル名規則:** `{拡張機能のファイル名}_Manual.pdf` で統一（例: `PathOptimizer_Manual.pdf`、`ColorSwapper_Manual.pdf`）

**デザイン・レイアウトの必須要件:**
- **図解を積極的に使用**: UIのスクリーンショット、操作フロー図、ワークフロー図解などを挿入し、視覚的に分かりやすくすること
- **見やすいデザイン**: 見出し・区切り線・アイコン・色分けなどを活用し、プロフェッショナルで読みやすいレイアウトにすること
- **情報の階層化**: セクションごとに明確な見出しと余白を設け、スキャンしやすい構成にすること

**必須コンテンツ:**

1. **概要**: ツールの目的と特徴（1〜2文）
2. **動作環境**: 対応Illustratorバージョン、OS要件
3. **インストール手順**: Mac/Win両方をステップバイステップ解説（図解付き）
   - 「ZIPを展開」→「インストーラーをダブルクリック」→「Illustratorを再起動」→「エクステンションを表示」
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
- [ ] ファイル名の大文字小文字を考慮しているか
- [ ] `.install-mac.sh` に実行権限付与済みか
- [ ] Windows `.bat` の先頭に `chcp 65001 > nul` があるか
- [ ] CEPパスが正しいか（Mac: `~/Library/Application Support/Adobe/CEP/extensions/`）
- [ ] CEPパスが正しいか（Win: `%APPDATA%\Adobe\CEP\extensions\`）
- [ ] `.app` ラッパーがAppleScriptで正しく生成されるか
- [ ] ExtendScript: ES3制約（`var`のみ、`for`ループのみ等）を遵守しているか

### 条件5: UIパネル形式（他パネルとのドッキング対応）

すべてのスクリプト・エクステンションは **UIパネル形式** で作成し、他のパネルとドッキングできるようにする：

| 技術 | パネル形式の実装方法 |
|------|---------------------|
| **CEP Extension** | `manifest.xml` の `<UI><Type>Panel</Type></UI>` を設定 |
| **ExtendScript** | `(thisObj instanceof Panel) ? thisObj : new Window("dialog", ...)` パターンで Dockable Panel 対応 |

> [!IMPORTANT]
> - CEP: `<Type>Dialog</Type>` は禁止。必ず `<Type>Panel</Type>` にすること
> - ExtendScript 単体スクリプトでも `ScriptUI Panels` に配置しドッキング可能にすること

### 条件6: 上書きインストール（旧バージョン自動削除）

インストーラーは以下の仕様を必ず実装する：

1. **既存バージョンの検出**: CEP extensions フォルダに同一IDのエクステンションが存在するかチェック
2. **旧ファイルの完全削除**: 存在する場合は `rm -rf`（Mac）/ `rmdir /s /q`（Win）で削除
3. **関連ファイルの削除**: シンボリックリンクも検出して削除（`[ -L ... ]`）
4. **新バージョンのコピー**: 削除後に新しいファイルをコピー
5. **ユーザー設定の保持**: `~/Library/Application Support/` 内のユーザー設定ファイルは保持

---

## 1. 開発アプローチの選択ガイド

| アプローチ | 技術 | パフォーマンス | UI | 適用場面 |
|---|---|---|---|---|
| **CEP エクステンション** ⭐推奨 | HTML5 + JS + ExtendScript | ◎ | リッチHTML5パネル | パネル付きツール全般 |
| **ExtendScript スクリプト** | JSX (ES3) | ○ | ScriptUI | 単発自動化・バッチ処理 |
| **C++ プラグイン** | C++ SDK | ◎◎ | ネイティブ | 描画・フィルター・ファイル形式の拡張 |
| **UXP プラグイン** | JS (ES6+) | ◎◎ | Spectrum | ❌ 2026年現在サードパーティ非公開 |

### 最適解の判断基準
- **UIパネルが必要** → CEP エクステンション（HTML5で自由度最高）
- **シンプルな自動化** → ExtendScript スクリプト（最速で開発可能）
- **ネイティブ性能が必要（フィルター・描画エンジン等）** → C++ プラグイン
- **将来性を重視** → CEPで構築し、UXP公開時に移行

---

## 2. CEP エクステンション開発（推奨）

### 2.1 ディレクトリ構成

```
MyExtension/
├── CSXS/
│   └── manifest.xml          # エクステンション定義
├── index.html                 # パネルUI（HTML5 + CSS）
├── js/
│   └── CSInterface.js         # Adobe提供の通信ライブラリ
├── jsx/
│   ├── hostscript.jsx         # ExtendScript ホストスクリプト
│   └── (追加スクリプト).jsx    # 機能別ExtendScript
└── css/ (任意)
    └── style.css
```

### 2.2 manifest.xml テンプレート

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ExtensionManifest Version="6.0"
    ExtensionBundleId="com.yourname.extensionid"
    ExtensionBundleName="MyExtension"
    ExtensionBundleVersion="1.0.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <ExtensionList>
        <Extension Id="com.yourname.extensionid.panel" Version="1.0.0" />
    </ExtensionList>
    <ExecutionEnvironment>
        <HostList>
            <!-- ILST = Illustrator。バージョン17.0（CC）以降を対象 -->
            <Host Name="ILST" Version="[17.0,99.9]" />
        </HostList>
        <LocaleList>
            <Locale Code="All" />
        </LocaleList>
        <RequiredRuntimeList>
            <RequiredRuntime Name="CSXS" Version="6.0" />
        </RequiredRuntimeList>
    </ExecutionEnvironment>
    <DispatchInfoList>
        <Extension Id="com.yourname.extensionid.panel">
            <DispatchInfo>
                <Resources>
                    <MainPath>./index.html</MainPath>
                    <ScriptPath>./jsx/hostscript.jsx</ScriptPath>
                </Resources>
                <Lifecycle>
                    <AutoVisible>true</AutoVisible>
                </Lifecycle>
                <UI>
                    <Type>Panel</Type>
                    <Menu>My Extension Name</Menu>
                    <Geometry>
                        <Size>
                            <Height>420</Height>
                            <Width>280</Width>
                        </Size>
                        <MinSize>
                            <Height>300</Height>
                            <Width>220</Width>
                        </MinSize>
                    </Geometry>
                </UI>
            </DispatchInfo>
        </Extension>
    </DispatchInfoList>
</ExtensionManifest>
```

**Host Name の主要値:**
- `ILST` = Illustrator
- `PHXS` / `PHSP` = Photoshop
- `AEFT` = After Effects
- `PPRO` = Premiere Pro

### 2.3 HTML5 パネル テンプレート（index.html）

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>My Extension</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: "Segoe UI", "Meiryo", sans-serif;
            font-size: 12px;
            color: #e0e0e0;
            background-color: #323232;
            padding: 10px;
            user-select: none;
        }
        .panel-title {
            font-size: 13px; font-weight: bold; color: #fff;
            text-align: center; padding: 6px 0 10px;
            border-bottom: 1px solid #4a4a4a; margin-bottom: 10px;
        }
        .section {
            background: #3a3a3a; border: 1px solid #4a4a4a;
            border-radius: 4px; padding: 8px 10px; margin-bottom: 8px;
        }
        .section-title {
            font-size: 10px; color: #888;
            text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;
        }
        .btn {
            display: block; width: 100%; padding: 7px 10px; margin-bottom: 5px;
            background: #4a4a4a; color: #e0e0e0; border: 1px solid #555;
            border-radius: 4px; font-size: 12px; cursor: pointer;
            text-align: left; transition: background 0.15s;
        }
        .btn:hover { background: #555; border-color: #666; }
        .btn:active { background: #2b9af3; color: #fff; }
        .btn-primary {
            background: #2b9af3; color: #fff; border-color: #2b9af3;
            font-weight: bold; text-align: center;
        }
        .btn-primary:hover { background: #1a8ae0; }
        .status {
            margin-top: 8px; font-size: 11px; color: #888;
            text-align: center; min-height: 16px;
        }
        .status.success { color: #4caf50; }
        .status.error { color: #f44336; }
    </style>
</head>
<body>
    <div class="panel-title">🛠 My Extension</div>

    <div class="section">
        <div class="section-title">ツール</div>
        <button class="btn" id="btnAction1">
            <span class="icon">📌</span> アクション1
        </button>
    </div>

    <div class="status" id="status">準備完了</div>

    <script src="js/CSInterface.js"></script>
    <script>
        var csInterface = new CSInterface();
        var statusEl = document.getElementById("status");

        function setStatus(text, type) {
            statusEl.textContent = text;
            statusEl.className = "status" + (type ? " " + type : "");
        }

        // CEP → ExtendScript 通信の汎用関数
        function runScript(funcCall, statusMsg) {
            setStatus(statusMsg || "処理中...", "");
            csInterface.evalScript(funcCall, function(result) {
                try {
                    var res = JSON.parse(result);
                    if (res.success) {
                        setStatus("✓ " + res.message, "success");
                    } else {
                        setStatus("⚠ " + res.message, "error");
                    }
                } catch (e) {
                    if (result === "EvalScript error." || result === "undefined") {
                        setStatus("⚠ スクリプト実行エラー", "error");
                    } else {
                        setStatus("✓ 完了", "success");
                    }
                }
            });
        }

        document.getElementById("btnAction1").addEventListener("click", function() {
            runScript("myAction()", "実行中...");
        });
    </script>
</body>
</html>
```

### 2.4 CEP開発環境セットアップ

```bash
# デバッグモードを有効化（必須）
for ver in 8 9 10 11 12 13; do
    defaults write com.adobe.CSXS.$ver PlayerDebugMode 1 2>/dev/null || true
done

# エクステンションをシンボリックリンクでインストール（開発中）
ln -s /path/to/MyExtension "$HOME/Library/Application Support/Adobe/CEP/extensions/com.yourname.extensionid"

# Illustratorを再起動後、ウィンドウ → エクステンション で表示
```

---

## 3. ExtendScript スクリプト開発

### 3.1 基本構造（ScriptUI Dialog / Palette 対応）

```javascript
(function(thisObj) {
    function buildUI(thisObj) {
        var windowTitle = "My Script";
        // Dockable Panel or Dialog
        var myPanel = (thisObj instanceof Panel)
            ? thisObj
            : new Window("dialog", windowTitle, undefined, {resizeable: true});

        if (myPanel !== null) {
            var res = "Group { \
                orientation: 'column', \
                alignment: ['fill', 'fill'], \
                myButton: Button { text: '実行' } \
            }";

            myPanel.grp = myPanel.add(res);
            myPanel.grp.myButton.onClick = function() {
                executeScript();
            };
            myPanel.layout.layout(true);
            myPanel.layout.resize();
            myPanel.onResizing = myPanel.onResize = function() {
                this.layout.resize();
            };
        }
        return myPanel;
    }

    function executeScript() {
        try {
            if (app.documents.length === 0) {
                alert("ドキュメントが開かれていません");
                return;
            }
            var doc = app.activeDocument;

            // --- ここに処理を記述 ---

        } catch (e) {
            alert("エラー: " + e.message + "\n行: " + e.line);
        }
    }

    var myScriptPal = buildUI(thisObj);
    if (myScriptPal !== null && myScriptPal instanceof Window) {
        myScriptPal.center();
        myScriptPal.show();
    }
})(this);
```

### 3.2 CEP HostScript テンプレート（JSON通信パターン）

CEPエクステンションのバックエンド（`hostscript.jsx`）として使用する場合、ExtendScript側では必ずJSON形式で結果を返す。

```javascript
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
 * CEPから呼び出されるアクション関数のテンプレート
 * 必ず JSON.stringify({ success: bool, message: string }) を返す
 */
function myAction() {
    try {
        if (app.documents.length === 0) {
            return JSON.stringify({ success: false, message: "ドキュメントが開かれていません" });
        }
        var doc = app.activeDocument;

        // --- 実処理 ---

        return JSON.stringify({ success: true, message: "完了しました" });
    } catch (e) {
        return JSON.stringify({ success: false, message: "エラー: " + e.message });
    }
}
```

### 3.3 外部スクリプトの動的読み込み

```javascript
function runExternalScript() {
    try {
        var extFolder = (new File($.fileName)).parent;
        var scriptFile = new File(extFolder + "/jsx/myScript.jsx");
        if (scriptFile.exists) {
            $.evalFile(scriptFile);
            return JSON.stringify({ success: true, message: "実行完了" });
        }
        return JSON.stringify({ success: false, message: "スクリプトが見つかりません" });
    } catch (e) {
        return JSON.stringify({ success: false, message: "エラー: " + e.message });
    }
}
```

---

## 4. Illustrator DOM リファレンス

### 4.1 主要オブジェクト階層

```
app (Application)
 └── documents (Documents)
      └── Document
           ├── layers (Layers)
           │    └── Layer
           │         ├── pageItems (PageItems)
           │         ├── pathItems (PathItems)
           │         ├── textFrames (TextFrames)
           │         ├── groupItems (GroupItems)
           │         ├── compoundPathItems (CompoundPathItems)
           │         ├── placedItems (PlacedItems)
           │         ├── rasterItems (RasterItems)
           │         ├── symbolItems (SymbolItems)
           │         ├── meshItems (MeshItems)
           │         └── layers (サブレイヤー)
           ├── selection (選択中のオブジェクト配列)
           ├── artboards (Artboards)
           ├── swatches (Swatches)
           ├── symbols (Symbols)
           └── spots (Spots)
```

### 4.2 よく使うオブジェクト操作

```javascript
// ドキュメント
var doc = app.activeDocument;

// レイヤー操作
var layer = doc.layers[0];                    // 最初のレイヤー
var newLayer = doc.layers.add();              // 新規レイヤー
newLayer.name = "新しいレイヤー";

// 選択オブジェクト
var sel = doc.selection;                      // 選択中の配列
if (sel.length > 0) { /* 処理 */ }

// オブジェクト移動
item.move(targetLayer, ElementPlacement.PLACEATBEGINNING);
// ElementPlacement: PLACEATBEGINNING, PLACEATEND, PLACEBEFORE, PLACEAFTER, INSIDE

// オブジェクトの型判定
switch (item.typename) {
    case "PathItem":          break;  // パス
    case "CompoundPathItem":  break;  // 複合パス
    case "TextFrame":         break;  // テキストフレーム
    case "GroupItem":         break;  // グループ
    case "PlacedItem":        break;  // 配置画像
    case "RasterItem":        break;  // ラスター画像
    case "SymbolItem":        break;  // シンボル
    case "MeshItem":          break;  // メッシュ
}

// テキスト操作
var tf = doc.textFrames[0];
tf.contents;                                  // テキスト内容
tf.textRange.characterAttributes.size = 24;   // フォントサイズ

// パス操作
var path = doc.pathItems[0];
path.fillColor;                               // 塗りの色
path.strokeColor;                             // 線の色
path.strokeWidth;                             // 線幅

// 色の設定
var cmyk = new CMYKColor();
cmyk.cyan = 100; cmyk.magenta = 0; cmyk.yellow = 0; cmyk.black = 0;
path.fillColor = cmyk;

var rgb = new RGBColor();
rgb.red = 255; rgb.green = 0; rgb.blue = 0;

// 座標・バウンディングボックス
var bounds = item.geometricBounds; // [left, top, right, bottom]
var vBounds = item.visibleBounds;  // アピアランス含む

// アートボード
var ab = doc.artboards[0];
var abRect = ab.artboardRect;      // [left, top, right, bottom]
```

### 4.3 座標系
- **原点**: ドキュメントの左下（Y軸が上向き正）
- **単位**: ドキュメントのルーラー単位（通常ポイント: 1pt = 1/72 inch）
- `geometricBounds` / `visibleBounds`: `[left, top, right, bottom]`

---

## 5. 開発のベストプラクティス

### 5.1 事前チェックの徹底

```javascript
// 最低限のチェックチェーン
if (app.documents.length === 0) { /* ドキュメント未開放 */ }
var doc = app.activeDocument;
var sel = doc.selection;
if (!sel || sel.length === 0) { /* 選択なし */ }
```

### 5.2 エラーハンドリング

```javascript
try {
    // 処理
} catch (e) {
    // ExtendScript の error オブジェクト
    alert("エラー: " + e.message + "\n行: " + e.line + "\nファイル: " + e.fileName);
}
```

### 5.3 ES3 の制約に注意
ExtendScript は ECMAScript 3 ベース。以下は**使用不可**：
- `let` / `const` → `var` を使用
- テンプレートリテラル → 文字列結合を使用
- `Array.forEach` / `map` / `filter` → `for` ループを使用
- `JSON` → ポリフィルが必要（セクション3.2参照）
- アロー関数 `=>` → `function(){}` を使用
- `Object.keys()` → `for (var k in obj)` を使用

### 5.4 選択オブジェクトの親子判定

選択中のオブジェクトが他の選択オブジェクトの子かどうかを判定し、トップレベルのみ処理する：

```javascript
function getTopLevelItems(items) {
    var topLevel = [];
    for (var i = 0; i < items.length; i++) {
        var isChild = false;
        var parent = items[i].parent;
        while (parent) {
            for (var j = 0; j < items.length; j++) {
                if (i !== j && parent === items[j]) { isChild = true; break; }
            }
            if (isChild) break;
            if (parent.typename === "Layer" || parent.typename === "Document") break;
            parent = parent.parent;
        }
        if (!isChild) topLevel.push(items[i]);
    }
    return topLevel;
}
```

### 5.5 ユニーク名の生成

```javascript
function getUniqueLayerName(doc, name) {
    var existing = {};
    for (var i = 0; i < doc.layers.length; i++) {
        existing[doc.layers[i].name] = true;
    }
    if (!existing[name]) return name;
    var counter = 2;
    while (existing[name + " " + counter]) { counter++; }
    return name + " " + counter;
}
```

---

## 6. パッケージング・配布

### 6.1 Mac インストーラー（AppleScript .app ラッパー推奨）

配布時のMacインストーラーは **AppleScript .app ラッパー + 隠しシェルスクリプト** のパターンを推奨する。
`.command` ファイルはダウンロード後に実行権限が外れる問題があるため、AppleScript `.app` で自動的に権限付与＋実行する。

> [!CAUTION]
> **シェルスクリプト内で `clear` コマンドを使用してはならない。** AppleScript の `do shell script` はターミナル環境を持たないため、`TERM` 環境変数が未設定で `clear` がエラーになる（`TERM environment variable not set.`）。代わりに `export TERM=xterm-256color` を使うこと。

#### 隠しシェルスクリプト（.install-mac.sh）

```bash
#!/bin/bash
set -e
cd "$(dirname "$0")"
SCRIPT_DIR="$(pwd)"
EXT_NAME="com.yourname.extensionid"
CEP_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions"

# ⚠️ clear は使わない（AppleScript do shell script 経由では TERM 未設定でエラーになる）
export TERM=xterm-256color

echo "  [1/3] CEP デバッグモード有効化中..."
for ver in 8 9 10 11 12 13; do
    defaults write com.adobe.CSXS.$ver PlayerDebugMode 1 2>/dev/null || true
done

echo "  [2/3] 拡張をインストール中..."
mkdir -p "$CEP_DIR"
[ -d "$CEP_DIR/$EXT_NAME" ] || [ -L "$CEP_DIR/$EXT_NAME" ] && rm -rf "$CEP_DIR/$EXT_NAME"
cp -R "$SCRIPT_DIR/MyExtension" "$CEP_DIR/$EXT_NAME"

echo "  [3/3] インストール完了！"
echo "  → Illustratorを再起動 → ウィンドウ → エクステンション"
```

#### AppleScript .app ラッパー（ビルドスクリプト内で生成）

```bash
# ビルドスクリプト内でAppleScript .appを生成
osacompile -o "${PKG_DIR}/MyExtension Installer.app" -e '
try
    set scriptFolder to do shell script "dirname " & quoted form of POSIX path of (path to me)
    set installScript to scriptFolder & "/.install-mac.sh"
    do shell script quoted form of installScript
    display dialog "✅ インストール完了！" buttons {"OK"} default button "OK" with title "インストーラー" with icon note
on error errMsg number errNum
    display dialog "❌ エラー:" & return & errMsg buttons {"OK"} default button "OK" with title "インストール失敗" with icon stop
end try
'
```

> [!IMPORTANT]
> **Mac インストーラー作成時の必須チェックリスト:**
> 1. シェルスクリプト内に `clear` がないこと（`export TERM=xterm-256color` で代替）
> 2. `.install-mac.sh` に `chmod +x` を付与していること
> 3. AppleScript `.app` ラッパーで包んでいること（ダウンロード後の実行権限問題を回避）
> 4. `set -e` でエラー時に即座に停止すること

### 6.2 Windows インストーラー（.bat）

```batch
@echo off
chcp 65001 > nul
set EXT_NAME=com.yourname.extensionid
set CEP_DIR=%APPDATA%\Adobe\CEP\extensions

echo [1/3] CEP デバッグモード有効化中...
for %%v in (8 9 10 11 12 13) do (
    reg add "HKCU\Software\Adobe\CSXS.%%v" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
)

echo [2/3] 拡張をインストール中...
if not exist "%CEP_DIR%" mkdir "%CEP_DIR%"
if exist "%CEP_DIR%\%EXT_NAME%" rmdir /s /q "%CEP_DIR%\%EXT_NAME%"
xcopy "%~dp0MyExtension" "%CEP_DIR%\%EXT_NAME%\" /E /I /Y >nul

echo [3/3] インストール完了！
pause
```

> [!IMPORTANT]
> **Windows インストーラー作成時の必須チェックリスト:**
> 1. 先頭に `chcp 65001 > nul` を入れて UTF-8 エンコーディングを設定すること（日本語文字化け防止）
> 2. `@echo off` で不要な出力を抑制すること

### 6.3 ZXP 署名パッケージ

```bash
# 自己署名証明書の作成
npx -y zxp-sign-cmd -selfSignedCert JP Tokyo YourName "Your Org" "password123" cert.p12

# ZXPパッケージの作成
npx -y zxp-sign-cmd -sign ./MyExtension output.zxp cert.p12 "password123" -tsa http://timestamp.digicert.com
```

### 6.4 ビルドスクリプトのパターン（Node.js）

複数スクリプトを個別パッケージ化する場合:

```javascript
const scripts = [
    { id: 'myscript', name: 'MyScript', menu: 'ツール名', icon: '🛠', desc: '説明' }
];

// manifest.xml、index.html、hostscript.jsx、インストーラーを自動生成
// 詳細は /Users/takahashikenta/projects/Illustrator/IlScripts/build_packages.js を参照
```

---

## 7. トラブルシューティング

### 7.1 CEP パネルが表示されない
1. `PlayerDebugMode` が有効か確認: `defaults read com.adobe.CSXS.12 PlayerDebugMode`
2. `manifest.xml` の `ExtensionBundleId` と拡張フォルダ名が一致していない
3. `CSInterface.js` が破損（10KB未満の場合は破損の可能性）
4. Illustratorのバージョンが `manifest.xml` の `Host Version` 範囲外

### 7.2 EvalScript error
- `hostscript.jsx` の構文エラー（ES3制約違反）
- `ScriptPath` のパスが不正
- 関数名のタイプミス

### 7.3 ExtendScript エラー
- `$.fileName` が `undefined` → スクリプトがファイルとして保存されていない
- `app.activeDocument` が取得できない → ドキュメントが開いていない
- 日本語文字列のエンコード → UTF-8で保存、Unicodeエスケープを使用

### 7.4 パフォーマンス最適化
- 大量のレイヤー・オブジェクト操作時は `app.redraw()` を避ける
- 処理前に `app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;` で警告を抑制

---

## 8. 既存プロジェクトリファレンス

実動するCEPエクステンションの実装例:
- **IlScripts（5ツール統合パネル）**: `/Users/takahashikenta/projects/Illustrator/IlScripts/IlScripts/`
- **ビルドスクリプト**: `/Users/takahashikenta/projects/Illustrator/IlScripts/build_packages.js`
- **個別スクリプト群**: `/Users/takahashikenta/projects/Illustrator/IlScripts/scripts/`

---

このスキルはIllustratorのエクステンション・プラグイン・スクリプト関連のコード生成・修正・パッケージ作成の際に基準として利用されます。
