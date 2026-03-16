---
name: ae-script-dev
description: After Effectsのエクステンション（CEP）・プラグイン・スクリプト（ExtendScript）開発のベストプラクティスとテンプレート
metadata:
  tags: after-effects, cep, extendscript, jsx, extension, plugin, script, adobe, automation
---

# After Effects 開発スキル

After Effects 向けのエクステンション（CEP）およびスクリプト（ExtendScript .jsx）開発を包括的にカバーするスキル。

---

## 🔴 スクリプト作成時の必須条件

> [!CAUTION]
> **以下の6項目はスクリプト・エクステンション作成時に必ず遵守すること。1つでも欠けた成果物は不完全とみなす。**

### 条件1: インストーラーの必須作成

スクリプト・エクステンションを作成したら、**必ず「インストーラー.app」（Mac）と「インストーラー.bat」（Windows）** を作成する。素人がダブルクリックだけでインストールできること。

**配布パッケージ構成:**

```
配布パッケージ/
├── MyScript Installer.app     ← Mac用ダブルクリックインストーラー（AppleScript）
├── .install-mac.sh            ← 実際のインストール処理（隠しファイル）
├── install-win.bat            ← Windows用インストーラー
├── MyScript/                  ← スクリプト本体（CEPの場合はエクステンション）
│   ├── loader.jsx             ← or CSXS/manifest.xml (CEP)
│   ├── src/
│   └── lib/
└── MyScript_Manual.pdf        ← マニュアル（PDF形式・拡張機能名_Manual）
```

**Mac インストーラー雛形（ExtendScript用 .install-mac.sh）:**

```bash
#!/bin/bash
set -e
cd "$(dirname "$0")"
SCRIPT_DIR="$(pwd)"
SCRIPT_NAME="MyScript"

# ⚠️ clear は使わない（AppleScript do shell script 経由では TERM 未設定でエラーになる）
export TERM=xterm-256color

echo "========================================="
echo "  ${SCRIPT_NAME} インストーラー"
echo "========================================="

# [1] AE バージョン自動検出 + 旧バージョン削除 + インストール
AE_FOUND=0
for AE_APP in /Applications/Adobe\ After\ Effects*/; do
    if [ -d "${AE_APP}" ]; then
        SCRIPTS_DIR="${AE_APP}Scripts/ScriptUI Panels"
        if [ -d "$(dirname "${SCRIPTS_DIR}")" ]; then
            mkdir -p "${SCRIPTS_DIR}" 2>/dev/null

            # 旧バージョン削除（上書きインストール）
            if [ -f "${SCRIPTS_DIR}/${SCRIPT_NAME}.jsx" ]; then
                echo "  🔄 旧バージョンを削除中..."
                rm -f "${SCRIPTS_DIR}/${SCRIPT_NAME}.jsx"
            fi
            if [ -d "${SCRIPTS_DIR}/${SCRIPT_NAME}" ]; then
                rm -rf "${SCRIPTS_DIR}/${SCRIPT_NAME}"
            fi

            # 新バージョンをコピー
            cp "${SCRIPT_DIR}/${SCRIPT_NAME}.jsx" "${SCRIPTS_DIR}/"
            [ -d "${SCRIPT_DIR}/${SCRIPT_NAME}" ] && cp -R "${SCRIPT_DIR}/${SCRIPT_NAME}" "${SCRIPTS_DIR}/"

            AE_VERSION="$(basename "${AE_APP}")"
            echo "  ✅ ${AE_VERSION} にインストール完了"
            AE_FOUND=$((AE_FOUND + 1))
        fi
    fi
done

# CEP版の場合の追加インストール
CEP_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions"
EXT_ID="com.yourname.extensionid"
if [ -d "${SCRIPT_DIR}/MyExtension" ]; then
    echo "  [追加] CEP エクステンションをインストール中..."
    for ver in 8 9 10 11 12 13; do
        defaults write com.adobe.CSXS.$ver PlayerDebugMode 1 2>/dev/null || true
    done
    mkdir -p "${CEP_DIR}"
    [ -d "${CEP_DIR}/${EXT_ID}" ] || [ -L "${CEP_DIR}/${EXT_ID}" ] && rm -rf "${CEP_DIR}/${EXT_ID}"
    cp -R "${SCRIPT_DIR}/MyExtension" "${CEP_DIR}/${EXT_ID}"
fi

if [ $AE_FOUND -eq 0 ]; then
    echo "❌ After Effects が見つかりません"
    exit 1
fi

echo ""
echo "  📌 次の手順:"
echo "     1. After Effects を再起動"
echo "     2. ウィンドウ → ${SCRIPT_NAME} でパネルを表示"
echo "========================================="
```

**AppleScript .app ビルドコマンド:**

```bash
osacompile -o "${PKG_DIR}/${SCRIPT_NAME} Installer.app" -e '
try
    set scriptFolder to do shell script "dirname " & quoted form of POSIX path of (path to me)
    set installScript to scriptFolder & "/.install-mac.sh"
    do shell script "chmod +x " & quoted form of installScript
    set result to do shell script quoted form of installScript
    display dialog "✅ インストール完了！" & return & return & "After Effects を再起動してください。" buttons {"OK"} default button "OK" with title "インストーラー" with icon note
on error errMsg number errNum
    display dialog "❌ エラー:" & return & errMsg buttons {"OK"} default button "OK" with title "インストール失敗" with icon stop
end try
'
```

**Windows インストーラー雛形（install-win.bat）:**

```batch
@echo off
chcp 65001 > nul
set "SCRIPT_NAME=MyScript"
set "SCRIPT_DIR=%~dp0"
set "AE_BASE=C:\Program Files\Adobe"
set "DEST_DIR="

echo =========================================
echo   %SCRIPT_NAME% インストーラー
echo =========================================

:: [1] AE バージョン自動検出
for /d %%D in ("%AE_BASE%\Adobe After Effects*") do (
    set "DEST_DIR=%%D\Support Files\Scripts\ScriptUI Panels"
)
if "%DEST_DIR%"=="" (
    echo ❌ After Effects が見つかりませんでした。
    pause & exit /b
)

:: [2] 旧バージョンの削除（上書きインストール）
if exist "%DEST_DIR%\%SCRIPT_NAME%.jsx" (
    echo   🔄 旧バージョンを削除中...
    del /f /q "%DEST_DIR%\%SCRIPT_NAME%.jsx"
)
if exist "%DEST_DIR%\%SCRIPT_NAME%" (
    rmdir /s /q "%DEST_DIR%\%SCRIPT_NAME%"
)

:: [3] インストール
echo   [1/2] スクリプトをインストール中...
if not exist "%DEST_DIR%" mkdir "%DEST_DIR%"
copy /Y "%SCRIPT_DIR%%SCRIPT_NAME%.jsx" "%DEST_DIR%\" >nul
if exist "%SCRIPT_DIR%%SCRIPT_NAME%" (
    xcopy "%SCRIPT_DIR%%SCRIPT_NAME%" "%DEST_DIR%\%SCRIPT_NAME%\" /E /I /Y >nul
)

:: CEP版の場合
set "EXT_ID=com.yourname.extensionid"
set "CEP_DIR=%APPDATA%\Adobe\CEP\extensions"
if exist "%SCRIPT_DIR%MyExtension" (
    echo   [2/2] CEP エクステンションをインストール中...
    for %%v in (8 9 10 11 12 13) do (
        reg add "HKCU\Software\Adobe\CSXS.%%v" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
    )
    if exist "%CEP_DIR%\%EXT_ID%" rmdir /s /q "%CEP_DIR%\%EXT_ID%"
    if not exist "%CEP_DIR%" mkdir "%CEP_DIR%"
    xcopy "%SCRIPT_DIR%MyExtension" "%CEP_DIR%\%EXT_ID%\" /E /I /Y >nul
)

echo   ✅ インストール完了！
echo.
echo   📌 After Effects を再起動してください
echo =========================================
pause
```

### 条件2: 配布対応エラーフリーインストーラー

インストーラーは **誰がインストールしてもエラーが出ない** ように以下を必ず実装する:

| チェック項目 | Mac | Windows |
|-------------|-----|---------|
| AEバージョン自動検出 | `/Applications/Adobe After Effects*/` ワイルドカード | `for /d` でProgram Files探索 |
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

**ファイル名規則:** `{拡張機能のファイル名}_Manual.pdf` で統一（例: `AudioSync_Manual.pdf`、`VisualBrowser_Manual.pdf`）

**デザイン・レイアウトの必須要件:**
- **図解を積極的に使用**: UIのスクリーンショット、操作フロー図、ワークフロー図解などを挿入し、視覚的に分かりやすくすること
- **見やすいデザイン**: 見出し・区切り線・アイコン・色分けなどを活用し、プロフェッショナルで読みやすいレイアウトにすること
- **情報の階層化**: セクションごとに明確な見出しと余白を設け、スキャンしやすい構成にすること

**必須コンテンツ:**

1. **概要**: ツールの目的と特徴（1〜2文）
2. **動作環境**: 対応AEバージョン、OS要件
3. **インストール手順**: Mac/Win両方をステップバイステップ解説（図解付き）
   - 「ZIPを展開」→「インストーラーをダブルクリック」→「AEを再起動」→「パネルを表示」
4. **使い方**: 各機能の使用方法をスクリーンショット・図解付きで解説
5. **UIの説明**: 各ボタン・入力欄の役割（UI図解付き）
6. **トラブルシューティング**: よくある問題と解決法（「スクリプトによるファイルへの書き込みを許可」設定など）
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
- [ ] ファイル名の大文字小文字: Mac(区別なし) / Win(区別なし) / Linux(区別あり) を考慮
- [ ] `.install-mac.sh` に実行権限付与済みか
- [ ] Windows `.bat` の先頭に `chcp 65001 > nul` があるか
- [ ] Mac AEパス自動検出（`/Applications/Adobe After Effects*/`）が正しいか
- [ ] Win AEパス自動検出（`C:\Program Files\Adobe\Adobe After Effects*`）が正しいか
- [ ] `.app` ラッパーがAppleScriptで正しく生成されるか
- [ ] ExtendScript: ES3制約（`var`のみ、`for`ループのみ等）を遵守しているか

### 条件5: UIパネル形式（他パネルとのドッキング対応）

すべてのスクリプト・エクステンションは **UIパネル形式** で作成し、他のパネルとドッキングできるようにする：

| 技術 | パネル形式の実装方法 |
|------|---------------------|
| **CEP Extension** | `manifest.xml` の `<UI><Type>Panel</Type></UI>` を設定 |
| **ExtendScript** | `ScriptUI Panels` フォルダに配置 + `(thisObj instanceof Panel)` パターンで Dockable Panel 対応 |

> [!IMPORTANT]
> - ExtendScript: `new Window("dialog", ...)` ではなく `(thisObj instanceof Panel) ? thisObj : new Window("palette", ...)` パターンを必ず使用
> - CEP: `<Type>Dialog</Type>` は禁止。必ず `<Type>Panel</Type>` にすること
> - スクリプトは `Scripts/ScriptUI Panels/` フォルダに配置すること（`Scripts/` 直下はドッキング不可）

### 条件6: 上書きインストール（旧バージョン自動削除）

インストーラーは以下の仕様を必ず実装する：

1. **既存バージョンの検出**: インストール先フォルダにスクリプト/エクステンションが既に存在するかチェック
2. **旧ファイルの完全削除**: 存在する場合は `rm -rf`（Mac）/ `rmdir /s /q`（Win）で削除
3. **関連ファイルの削除**: 旧バージョンの `.jsx` ファイルと同名フォルダ（ライブラリ等）も削除
4. **新バージョンのコピー**: 削除後に新しいファイルをコピー
5. **ユーザー設定の保持**: `~/Library/Application Support/` 内のユーザー設定ファイルは保持

---

## 1. 開発アプローチの選択ガイド

| アプローチ | 技術 | パフォーマンス | UI | 適用場面 |
|---|---|---|---|---|
| **CEP エクステンション** ⭐推奨 | HTML5 + JS + ExtendScript | ◎◎ | 自由HTML5パネル + Node.js | 高機能ツール・リッチUI |
| **ExtendScript スクリプト** | JSX (ES3) | ◎ | ScriptUI | 単体ツール・軽量パネル |
| **UXP プラグイン** 🔮将来 | Modern JS (ES6+) | ◎◎◎ | Spectrum WC | AE UXP対応後（2026年以降） |

### 最適解の判断基準
- **リッチUIが必要・外部通信あり** → CEP エクステンション一択（最高性能）
- **単体で完結する簡易ツール** → ExtendScript スクリプト（配布も簡単）
- **CEP のホスト側ロジック** → ExtendScript（CEP内部で使用）

### CEP vs ExtendScript 比較

| 項目 | ExtendScript スクリプト | CEP エクステンション |
|------|------------------------|---------------------|
| UI | ScriptUI（レガシー） | HTML5/CSS/JS（自由度高） |
| 言語 | ES3ベース | HTML側: モダンJS / Host側: ES3 |
| 通信 | 不可 | `csInterface.evalScript()` + Node.js可 |
| 外部API | 不可 | `fetch` / Node.js modules |
| 配布 | .jsx コピーのみ | ZXPインストーラー or シンボリックリンク |
| デバッグ | ESTK / `$.writeln` | Chrome DevTools |
| ドッキング | ScriptUI Panels配置 | パネルとして動作 |

> **Note**: After Effects は2026年2月時点で **UXP 未対応**。AE の UXP 正式対応は2026年中〜以降の見込み。対応後は Premiere Pro と同様の UXP 移行を推奨（premiere-dev Skill 参照）。

---

## 2. CEP エクステンション開発（推奨）

### 2.1 ディレクトリ構成

```
MyExtension/
├── .debug                    # デバッグ設定（開発時のみ）
├── CSXS/
│   └── manifest.xml          # エクステンション定義（必須）
├── client/
│   ├── index.html            # パネルUI
│   ├── app.js                # UIロジック
│   ├── styles.css            # スタイル
│   └── CSInterface.js        # Adobe提供の通信ライブラリ
├── host/
│   └── hostScript.jsx        # ExtendScript ホストスクリプト
├── build.sh                  # ビルド・パッケージスクリプト
├── install-mac.command       # Mac インストーラー
└── README.md
```

### 2.2 manifest.xml テンプレート

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
            <!-- AEFT = After Effects, バージョン16.0〜 -->
            <Host Name="AEFT" Version="[16.0,99.9]"/>
        </HostList>
        <LocaleList>
            <Locale Code="All"/>
        </LocaleList>
        <RequiredRuntimeList>
            <RequiredRuntime Name="CSXS" Version="7.0"/>
        </RequiredRuntimeList>
    </ExecutionEnvironment>
    <DispatchInfoList>
        <Extension Id="com.yourname.extensionid.panel">
            <DispatchInfo>
                <Resources>
                    <MainPath>./client/index.html</MainPath>
                    <ScriptPath>./host/hostScript.jsx</ScriptPath>
                    <CEFCommandLine>
                        <Parameter>--enable-nodejs</Parameter>
                        <Parameter>--mixed-context</Parameter>
                        <Parameter>--disable-application-cache</Parameter>
                        <Parameter>--disable-cache</Parameter>
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
                            <Height>600</Height>
                            <Width>400</Width>
                        </Size>
                        <MinSize>
                            <Height>400</Height>
                            <Width>300</Width>
                        </MinSize>
                    </Geometry>
                </UI>
            </DispatchInfo>
        </Extension>
    </DispatchInfoList>
</ExtensionManifest>
```

**重要フィールド:**
- `Host Name="AEFT"` — After Effects 固定
- `Version="[16.0,99.9]"` — 対応バージョン範囲
- `CSXS Version="7.0"` — CEP 7以上
- `--enable-nodejs` — Node.js 機能を有効化
- `--mixed-context` — DOM と Node.js の両方にアクセス

### 2.3 .debug ファイル（開発時デバッグ用）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ExtensionList>
    <Extension Id="com.yourname.extensionid.panel">
        <HostList>
            <Host Name="AEFT" Port="8078"/>
        </HostList>
    </Extension>
</ExtensionList>
```

デバッグ: `chrome://inspect` でポート `8078` に接続してDevToolsで検証可能。

### 2.4 HTML パネル テンプレート

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="app">
        <div class="header">
            <h2>🛠 My Extension</h2>
            <p class="subtitle">機能の説明</p>
        </div>

        <div class="status-bar">
            <div id="statusText" class="status-text">📋 準備完了</div>
        </div>

        <div class="section">
            <button id="btnExecute" class="btn-primary">▶ 実行</button>
        </div>

        <!-- プログレス -->
        <div id="progressSection" style="display: none;">
            <progress id="progressBar" value="0" max="100" style="width:100%;"></progress>
            <div id="progressText" class="progress-text"></div>
        </div>
    </div>

    <script src="CSInterface.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

### 2.5 CSS テンプレート（AEダークテーマ対応）

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: "Adobe Clean", "Segoe UI", "Meiryo", sans-serif;
    font-size: 12px;
    color: #e0e0e0;
    background-color: #232323;   /* AE のデフォルト背景色 */
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
    border-bottom: 1px solid #3a3a3a;
}

.header h2 { font-size: 14px; font-weight: 600; }
.subtitle { color: #888; font-size: 11px; margin-top: 2px; }

.status-bar {
    background: #1a1a1a;
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

.btn-primary {
    background: #3399ff;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
}

.btn-primary:hover { background: #2288ee; }
.btn-primary:disabled { background: #555; cursor: not-allowed; }

.btn-secondary {
    background: #444;
    color: #e0e0e0;
    border: 1px solid #555;
    border-radius: 4px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 11px;
}

.btn-secondary:hover { background: #555; }

.progress-text { font-size: 10px; color: #aaa; margin-top: 4px; }
```

### 2.6 クライアント JS テンプレート（CEP → ExtendScript 通信）

```javascript
// app.js - CEP Panel Logic

var csInterface = new CSInterface();

document.getElementById("btnExecute").addEventListener("click", executeMain);

function updateStatus(msg) {
    document.getElementById("statusText").textContent = msg;
}

/**
 * ExtendScript 関数を呼び出すラッパー
 * @param {string} funcCall - 関数呼び出し文字列 例: 'myFunc("arg1")'
 * @returns {Promise<any>}
 */
function callHost(funcCall) {
    return new Promise(function(resolve, reject) {
        csInterface.evalScript(funcCall, function(result) {
            if (result === "EvalScript error." || result === "undefined") {
                reject(new Error("スクリプト実行エラー: " + funcCall));
                return;
            }
            try {
                var parsed = JSON.parse(result);
                resolve(parsed);
            } catch (e) {
                resolve(result); // プレーンテキストの場合
            }
        });
    });
}

/**
 * メイン実行
 */
async function executeMain() {
    try {
        updateStatus("⏳ 処理中...");

        var result = await callHost('getProjectItems("root")');
        if (result.error) {
            updateStatus("❌ " + result.error);
            return;
        }

        updateStatus("✅ 完了: " + result.items.length + " アイテム取得");
    } catch (e) {
        updateStatus("❌ エラー: " + e.message);
    }
}
```

### 2.7 ExtendScript ホストスクリプト テンプレート

```javascript
// host/hostScript.jsx
// After Effects ExtendScript - CEP Host Script

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
 * プロジェクトアイテムを取得
 * @param {string} folderId - フォルダID（"root"でルート）
 * @returns {string} JSON文字列
 */
function getProjectItems(folderId) {
    if (!app.project) {
        return JSON.stringify({ error: "プロジェクトが開かれていません" });
    }

    var items = [];
    var targetFolder = app.project.rootFolder;

    var cleanId = String(folderId || "root").replace(/['"\\s]/g, "");
    if (cleanId && cleanId !== "root") {
        var numId = parseInt(cleanId, 10);
        targetFolder = findItemById(numId);
        if (!targetFolder || !(targetFolder instanceof FolderItem)) {
            return JSON.stringify({ error: "フォルダが見つかりません" });
        }
    }

    for (var i = 1; i <= targetFolder.numItems; i++) {
        items.push(getItemInfo(targetFolder.item(i)));
    }

    return JSON.stringify({ items: items });
}

/**
 * アイテム情報オブジェクトを生成
 */
function getItemInfo(item) {
    var info = {
        id: String(item.id),
        name: item.name,
        type: "unknown"
    };

    if (item instanceof FolderItem) {
        info.type = "folder";
        info.childCount = item.numItems;
    } else if (item instanceof CompItem) {
        info.type = "comp";
        info.width = item.width;
        info.height = item.height;
        info.duration = item.duration;
    } else if (item instanceof FootageItem) {
        if (item.mainSource instanceof SolidSource) {
            info.type = "solid";
        } else if (item.mainSource instanceof FileSource) {
            info.type = "footage";
            info.width = item.width;
            info.height = item.height;
            info.duration = item.duration;
            info.hasVideo = item.hasVideo;
            info.hasAudio = item.hasAudio;
            try { info.filePath = item.mainSource.file.fsName; } catch (e) { }
        }
    }

    return info;
}

/**
 * IDでアイテムを検索
 */
function findItemById(id) {
    var numId = parseInt(id, 10);
    for (var i = 1; i <= app.project.numItems; i++) {
        if (app.project.item(i).id === numId) {
            return app.project.item(i);
        }
    }
    return null;
}
```

### 2.8 インストール（シンボリックリンク方式）

```bash
# Mac: CEP エクステンションのインストール
ln -s "/path/to/MyExtension" "$HOME/Library/Application Support/Adobe/CEP/extensions/MyExtension"

# 署名なしエクステンションの有効化（開発時必須）
defaults write com.adobe.CSXS.7 PlayerDebugMode 1
defaults write com.adobe.CSXS.8 PlayerDebugMode 1
defaults write com.adobe.CSXS.9 PlayerDebugMode 1
defaults write com.adobe.CSXS.10 PlayerDebugMode 1
defaults write com.adobe.CSXS.11 PlayerDebugMode 1
```

---

## 3. ExtendScript スクリプト開発

### 3.1 基本構造（Dockable Panel / Dialog 対応）

```javascript
(function(thisObj) {
    var SCRIPT_NAME = "My Script";
    var SCRIPT_VERSION = "1.0";

    function buildUI(thisObj) {
        var panel = (thisObj instanceof Panel)
            ? thisObj
            : new Window("palette", SCRIPT_NAME + " v" + SCRIPT_VERSION, undefined, { resizeable: true });

        panel.orientation = "column";
        panel.alignChildren = ["fill", "top"];
        panel.spacing = 10;
        panel.margins = 12;

        // === UI要素を追加 ===
        var btnGroup = panel.add("panel", undefined, "メイン操作");
        btnGroup.alignChildren = ["fill", "center"];
        btnGroup.spacing = 6;
        btnGroup.margins = 12;

        var btn = btnGroup.add("button", undefined, "実行");
        btn.preferredSize = [220, 32];
        btn.onClick = function() { executeScript(); };

        // === リサイズ対応 ===
        panel.layout.layout(true);
        panel.layout.resize();
        panel.onResizing = panel.onResize = function() { this.layout.resize(); };

        if (!(panel instanceof Panel)) {
            panel.center();
            panel.show();
        }
        return panel;
    }

    function executeScript() {
        app.beginUndoGroup(SCRIPT_NAME);
        try {
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) {
                alert("コンポジションを選択してください。");
                return;
            }
            // --- 処理本体 ---
        } catch (e) {
            alert("エラー: " + e.toString() + "\n行: " + e.line);
        } finally {
            app.endUndoGroup();
        }
    }

    buildUI(thisObj);
})(this);
```

### 3.2 必須パターン: 事前チェック

```javascript
// 1. プロジェクト確認
if (!app.project) { alert("プロジェクトがありません。"); return; }

// 2. アクティブコンポジション確認
var comp = app.project.activeItem;
if (!comp || !(comp instanceof CompItem)) {
    alert("コンポジションを選択してください。");
    return;
}

// 3. レイヤー選択確認（レイヤー操作系）
if (comp.selectedLayers.length === 0) {
    alert("レイヤーを選択してください。");
    return;
}

// 4. プロジェクト保存済み確認（ファイルI/O系）
if (!app.project.file) {
    alert("先にプロジェクトを保存してください。");
    return;
}
```

### 3.3 Undo グループの徹底ルール

スクリプトが変更を加える場合、必ず `app.beginUndoGroup()` / `app.endUndoGroup()` で囲む。例外発生時も確実に `endUndoGroup()` が呼ばれるよう **`try-finally`** を使うこと。

---

## 4. ExtendScript コアリファレンス

### 4.1 レイヤーインデックスの注意

AE のレイヤーコレクションは **1始まり**。

```javascript
// ✅ 正しい: 1 から開始
for (var i = 1; i <= comp.layers.length; i++) {
    var layer = comp.layers[i];
}

// ❌ 間違い: 0 から開始するとエラー
for (var i = 0; i < comp.layers.length; i++) { ... }
```

### 4.2 インデックスシフト対策

レイヤー分割(`splitLayer()`) や削除(`remove()`)でインデックスが変動する。対策:

```javascript
// 選択レイヤーを配列コピーしてから処理
var layers = [];
for (var i = 0; i < comp.selectedLayers.length; i++) {
    layers.push(comp.selectedLayers[i]);
}

// 後ろから前へ処理（降順）
for (var i = layers.length - 1; i >= 0; i--) {
    // layers[i] に対して操作
}
```

### 4.3 時間の扱い

```javascript
var fps = comp.frameRate;
var timeInSeconds = frameNumber / fps;
var frameAtTime = Math.round(comp.time * fps);

// 半フレーム補正（浮動小数点誤差の回避）
if (splitTime >= layer.outPoint - (0.5 / fps)) { break; }
if (splitTime <= layer.inPoint + (0.5 / fps)) { continue; }
```

### 4.4 座標系
- 左上が `[0, 0]`、3Dレイヤーは `[x, y, z]`
- アンカーポイント変更時はポジションも同時補正が必要

### 4.5 プロパティ操作

```javascript
var layer = comp.layers[1];

// トランスフォーム
layer.property("Position").setValue([960, 540]);
layer.property("Scale").setValue([100, 100]);
layer.property("Opacity").setValue(50);

// キーフレーム
var pos = layer.property("Position");
pos.setValueAtTime(0, [960, 540]);
pos.setValueAtTime(1, [960, 200]);

// イージング
var ease = new KeyframeEase(0, 75);
pos.setTemporalEaseAtKey(2, [ease, ease]);

// エフェクト
var blur = layer.property("Effects").addProperty("Gaussian Blur");
blur.property("Blurriness").setValue(10);

// エクスプレッション
layer.property("Opacity").expression = "wiggle(2, 20)";
```

### 4.6 テキストレイヤー操作

```javascript
if (layer instanceof TextLayer) {
    var textProp = layer.property("Source Text");
    var textDoc = textProp.value;
    textDoc.text = "新しいテキスト";
    textDoc.fontSize = 72;
    textDoc.fillColor = [1, 0, 0]; // RGB (0-1)
    textDoc.font = "Meiryo";
    textProp.setValue(textDoc);
}
```

### 4.7 レイヤー作成

```javascript
var solid = comp.layers.addSolid([0, 0, 0], "BG", comp.width, comp.height, 1);
var textLayer = comp.layers.addText("Hello");
var nullLayer = comp.layers.addNull();
var shapeLayer = comp.layers.addShape();
var adjLayer = comp.layers.addSolid([0, 0, 0], "Adj", comp.width, comp.height, 1);
adjLayer.adjustmentLayer = true;

// フッテージ読み込み・配置
var importOpts = new ImportOptions(new File("/path/to/image.png"));
var footageItem = app.project.importFile(importOpts);
var footageLayer = comp.layers.add(footageItem);
```

### 4.8 プロジェクトアイテムの型判定

```javascript
if (item instanceof FolderItem) { /* フォルダ */ }
if (item instanceof CompItem) { /* コンポジション */ }
if (item instanceof FootageItem) {
    if (item.mainSource instanceof FileSource) { /* ファイルフッテージ */ }
    if (item.mainSource instanceof SolidSource) { /* ソリッド */ }
    if (item.mainSource instanceof PlaceholderSource) { /* プレースホルダー */ }
}
```

---

## 5. UI パターン集（ScriptUI）

### 5.1 ドロップダウン

```javascript
var grp = panel.add("group");
grp.alignment = ["fill", "top"];
grp.add("statictext", undefined, "モード:");
var dropdown = grp.add("dropdownlist", undefined, ["オプションA", "オプションB"]);
dropdown.selection = 0;
```

### 5.2 数値入力

```javascript
var grpNum = panel.add("group");
grpNum.alignment = ["fill", "top"];
grpNum.add("statictext", undefined, "間隔（フレーム）:");
var numInput = grpNum.add("edittext", undefined, "10");
numInput.characters = 6;
```

### 5.3 チェックボックス

```javascript
var chk = panel.add("checkbox", undefined, "ロック済みレイヤーを含める");
chk.value = false;
```

### 5.4 プログレスバー

```javascript
var progressBar = panel.add("progressbar", undefined, 0, 100);
progressBar.preferredSize.width = 400;
// 更新: progressBar.value = 50;
```

### 5.5 タブパネル

```javascript
var tPanel = panel.add("tabbedpanel");
tPanel.alignChildren = ["fill", "fill"];

var tab1 = tPanel.add("tab", undefined, "基本");
tab1.orientation = "column";
tab1.alignChildren = ["fill", "top"];

var tab2 = tPanel.add("tab", undefined, "詳細");
```

### 5.6 リストボックス

```javascript
var listbox = panel.add("listbox", undefined, [], { numberOfColumns: 1 });
listbox.preferredSize = [300, 120];
listbox.add("item", "アイテム1");
listbox.add("item", "アイテム2");
```

### 5.7 ファイル/フォルダ選択

```javascript
// フォルダ選択
var folder = Folder.selectDialog("出力フォルダを選択");
if (folder) { /* folder.fsName */ }

// ファイル選択
var file = File.openDialog("ファイルを選択", "*.jsx;*.txt");
if (file) { /* file.fsName */ }
```

---

## 6. モジュール分割パターン（大規模スクリプト向け）

### 6.1 ローダーパターン

```javascript
// loader.jsx（エントリポイント）
(function(thisObj) {
    var scriptFile = new File($.fileName);
    var scriptRoot = scriptFile.parent;

    // グローバルにパスを保存
    $.global.MY_SCRIPT_ROOT = scriptRoot.fsName;
    $.global.MY_SCRIPT_THIS = thisObj;

    // メインアプリケーションを読み込み
    var appFile = new File(scriptRoot.fsName + "/src/App.jsx");
    if (appFile.exists) {
        $.evalFile(appFile);
    } else {
        alert("スクリプトが見つかりません:\n" + appFile.fsName);
    }
})(this);
```

### 6.2 ライブラリ読み込み

```javascript
var scriptRoot = new Folder($.global.MY_SCRIPT_ROOT);
var libFolder = new Folder(scriptRoot.fsName + "/lib");

var modules = ["FileUtils.jsx", "Settings.jsx", "Report.jsx"];
for (var i = 0; i < modules.length; i++) {
    var moduleFile = new File(libFolder.fsName + "/" + modules[i]);
    if (moduleFile.exists) {
        try { $.evalFile(moduleFile); } catch (e) {
            $.writeln("モジュール読み込みエラー: " + modules[i]);
        }
    }
}
```

---

## 7. ファイル I/O と設定の永続化

### 7.1 設定の保存・読み込み

```javascript
var settingsFile = new File(Folder.userData.fsName + "/MyScript/settings.txt");

function saveSettings(data) {
    var folder = settingsFile.parent;
    if (!folder.exists) folder.create();
    settingsFile.open("w");
    settingsFile.encoding = "UTF-8";
    settingsFile.write(data.toSource());
    settingsFile.close();
}

function loadSettings() {
    if (!settingsFile.exists) return null;
    settingsFile.open("r");
    settingsFile.encoding = "UTF-8";
    var content = settingsFile.read();
    settingsFile.close();
    try { return eval(content); } catch (e) { return null; }
}
```

### 7.2 書き込み権限チェック

```javascript
function checkWriteAccess() {
    try {
        var testFile = new File(Folder.temp.fsName + "/ae_write_test.tmp");
        testFile.open("w"); testFile.write("test"); testFile.close(); testFile.remove();
        return true;
    } catch (e) {
        alert("ファイルへの書き込み権限がありません。\n\n" +
              "環境設定 > スクリプトとエクスプレッション から\n" +
              "「スクリプトによるファイルへの書き込みとネットワークへのアクセスを許可」\n" +
              "にチェックを入れてください。");
        return false;
    }
}
```

---

## 8. 配布とインストール

### 8.1 スクリプト配置場所

| 場所 | 動作 |
|------|------|
| `Scripts/` | ファイルメニューから実行 |
| `Scripts/ScriptUI Panels/` | ドッキング可能パネル |
| `Scripts/Startup/` | AE起動時自動実行 |

Mac: `/Applications/Adobe After Effects 20XX/Scripts/`

### 8.2 CEP 配置場所

```
~/Library/Application Support/Adobe/CEP/extensions/  ← Mac
%APPDATA%\Adobe\CEP\extensions\                      ← Windows
```

### 8.3 ZIP パッケージ構成例

```
MyScript_v1.0/
├── MyScript Installer.app/    ← Mac用（AppleScript .app ラッパー）
├── .install-mac.sh            ← 隠しシェルスクリプト（.appから呼ばれる）
├── install-win.bat            ← Windows用
├── MyScript/
│   ├── loader.jsx
│   ├── src/App.jsx
│   └── lib/
│       ├── Utils.jsx
│       └── Settings.jsx
└── README.pdf
```

### 8.4 Mac インストーラーのベストプラクティス

配布時のMacインストーラーは **AppleScript .app ラッパー + 隠しシェルスクリプト** のパターンを使用する。
`.command` ファイルはダウンロード後に実行権限が外れる問題があるため、AppleScript `.app` で自動的に権限付与＋実行する。

> [!CAUTION]
> **シェルスクリプト内で `clear` コマンドを使用してはならない。** AppleScript の `do shell script` はターミナル環境を持たないため、`TERM` 環境変数が未設定で `clear` がエラーになる（`TERM environment variable not set.`）。代わりに `export TERM=xterm-256color` を使うこと。

#### AE バージョン自動検出インストーラー（.install-mac.sh）

```bash
#!/bin/bash
set -e
cd "$(dirname "$0")"
SCRIPT_DIR="$(pwd)"
SCRIPT_NAME="MyScript"

# ⚠️ clear は使わない（AppleScript do shell script 経由では TERM 未設定でエラーになる）
export TERM=xterm-256color

AE_FOUND=0
for AE_APP in /Applications/Adobe\ After\ Effects*/; do
    if [ -d "${AE_APP}" ]; then
        SCRIPTS_DIR="${AE_APP}Scripts/ScriptUI Panels"
        if [ -d "$(dirname "${SCRIPTS_DIR}")" ]; then
            mkdir -p "${SCRIPTS_DIR}" 2>/dev/null
            cp "${SCRIPT_DIR}/${SCRIPT_NAME}.jsx" "${SCRIPTS_DIR}/"
            [ -d "${SCRIPT_DIR}/${SCRIPT_NAME}" ] && cp -R "${SCRIPT_DIR}/${SCRIPT_NAME}" "${SCRIPTS_DIR}/"
            AE_VERSION="$(basename "${AE_APP}")"
            echo "✅ ${AE_VERSION} にインストール完了"
            AE_FOUND=$((AE_FOUND + 1))
        fi
    fi
done
if [ $AE_FOUND -eq 0 ]; then
    echo "❌ After Effects が見つかりません"
    exit 1
fi
```

#### AppleScript .app ラッパー（ビルドスクリプト内で生成）

```bash
osacompile -o "${PKG_DIR}/MyScript Installer.app" -e '
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

### 8.5 Windows インストーラー（AE自動検出パターン）

```batch
@echo off
chcp 65001 > nul
set "SCRIPT_DIR=%~dp0"
set "AE_BASE=C:\Program Files\Adobe"
set "DEST_DIR="
:: 最新バージョンのフォルダを探す
for /d %%D in ("%AE_BASE%\Adobe After Effects*") do (
    set "DEST_DIR=%%D\Support Files\Scripts\ScriptUI Panels"
)
if "%DEST_DIR%"=="" (
    echo ❌ After Effects が見つかりませんでした。
    pause & exit /b
)
if not exist "%DEST_DIR%" mkdir "%DEST_DIR%"
copy /Y "%SCRIPT_DIR%MyScript.jsx" "%DEST_DIR%\" >nul
echo ✅ インストール完了！
pause
```

> [!IMPORTANT]
> **インストーラー作成時の必須チェックリスト:**
> 1. シェルスクリプト内に `clear` がないこと（`export TERM=xterm-256color` で代替）
> 2. `.install-mac.sh` に `chmod +x` を付与していること
> 3. AppleScript `.app` ラッパーで包んでいること（ダウンロード後の実行権限問題を回避）
> 4. Windows `.bat` の先頭に `chcp 65001 > nul`（UTF-8 文字化け防止）
> 5. AE パスをハードコードせず、バージョン自動検出すること
> 6. `set -e` でエラー時に即座に停止すること

---

## 9. トラブルシューティング

### 9.1 CEP パネルが表示されない
- `manifest.xml` の `ExtensionBundleId` が正しいか確認
- `PlayerDebugMode` が有効か確認（`defaults read com.adobe.CSXS.11`）
- `CSInterface.js` が10KB以上のサイズか確認（破損していないか）

### 9.2 `EvalScript error.` が返される
- ホストスクリプトの関数名のスペルミス
- ExtendScript のシンタックスエラー（ES3非互換コード）
- `JSON.stringify` ポリフィルが読み込まれていない

### 9.3 日本語・マルチバイト文字
- ファイルI/Oは `file.encoding = "UTF-8"` を明示的に設定
- ScriptUI にはユニコードエスケープ `\uXXXX` が安全
- パスの日本語処理は `File.decode()` を使う

### 9.4 処理速度の最適化
- `app.beginSuppressDialogs()` / `app.endSuppressDialogs()` で不要ダイアログ抑制
- 大量処理前にプレビュー解像度を下げる
- `$.writeln()` による大量ログ出力は避ける

### 9.5 デバッグ手法

```javascript
// ESTK コンソール出力
$.writeln("Debug: layerCount = " + comp.layers.length);

// alert で確認
alert("値: " + someValue);

// try-catch で行番号取得
try { /* 処理 */ } catch (e) {
    $.writeln("Error: " + e.toString() + " at line " + e.line);
}

// CEP 側: Chrome DevTools で console.log
console.log("CEP Debug:", data);
```

---

## 10. コーディング規約

### ファイルヘッダー

```javascript
/*
 * ScriptName.jsx
 * After Effects スクリプト / CEP ホストスクリプト
 *
 * 機能の説明
 *
 * ScriptUI Panelsフォルダ → ドッキング可能パネル
 * Scriptsフォルダ → ダイアログ
 */
```

### 命名規則
- **ファイル名**: PascalCase (`LayerSplitter.jsx`)
- **関数名**: camelCase (`selectEarliestLayer()`)
- **定数**: UPPER_SNAKE_CASE (`SCRIPT_NAME`)
- **UI変数**: プレフィックス付き (`btnExecute`, `chkLocked`, `inputInterval`)

### エラーメッセージ
- ユーザー向け `alert()` → **日本語**
- 開発者向け `$.writeln()` → 日本語 or 英語
- エラー時は **原因と解決法** の両方を含める
