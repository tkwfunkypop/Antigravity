#!/bin/bash
# ========================================
#  AE Installer Tool — PyInstaller ビルド
#  Python を丸ごとバンドルしてスタンドアロン
#  .app を生成する
# ========================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$SCRIPT_DIR/ae_installer.py"
APP_NAME="AE Installer Tool"
DIST_DIR="$SCRIPT_DIR/dist"
BUILD_DIR="$SCRIPT_DIR/build"
SPEC_FILE="$SCRIPT_DIR/ae_installer.spec"
PACKAGE_NAME="AE-Installer-Tool"

# アイコンファイル（存在する場合のみ使用）
ICON_OPT=""
if [ -f "$SCRIPT_DIR/icon.icns" ]; then
    ICON_OPT="--icon $SCRIPT_DIR/icon.icns"
    echo "  📎 カスタムアイコンを使用: icon.icns"
fi

echo "========================================="
echo "  AE Installer Tool — PyInstaller ビルド"
echo "========================================="

# ─── 1. PyInstaller 確認 & インストール ───
echo "  [1/5] PyInstaller を確認..."
if ! python3 -c "import PyInstaller" 2>/dev/null; then
    echo "  → PyInstaller をインストール中..."
    pip3 install pyinstaller
fi
echo "  ✅ PyInstaller OK"

# ─── 2. クリーンアップ ───
echo "  [2/5] 前回のビルドをクリーンアップ..."
rm -rf "$DIST_DIR" "$BUILD_DIR" "$SPEC_FILE"

# ─── 3. PyInstaller でビルド ───
echo "  [3/5] ビルド中（少し時間がかかります）..."
cd "$SCRIPT_DIR"

pyinstaller \
    --name "$APP_NAME" \
    --onedir \
    --windowed \
    --noconfirm \
    --clean \
    --strip \
    --noupx \
    --log-level WARN \
    --osx-bundle-identifier "com.takahashi-teikoku.ae-installer" \
    $ICON_OPT \
    "$SCRIPT"

echo "  ✅ ビルド完了"

# ─── 4. 動作確認 ───
APP_PATH="$DIST_DIR/$APP_NAME.app"
echo "  [4/5] 動作確認..."
if [ -d "$APP_PATH" ]; then
    SIZE=$(du -sh "$APP_PATH" | awk '{print $1}')
    echo "  ✅ $APP_PATH ($SIZE)"
else
    echo "  ❌ .app が見つかりません"
    exit 1
fi

# ─── 5. 配布 ZIP 作成 ───
echo "  [5/5] 配布パッケージを作成..."
ZIP_PATH="$SCRIPT_DIR/$PACKAGE_NAME.zip"
rm -f "$ZIP_PATH"

cd "$DIST_DIR"
# .appをZIPに入れる
zip -r "$ZIP_PATH" "$APP_NAME.app" -x "*.DS_Store"

# マニュアルとREADMEも追加
cd "$SCRIPT_DIR"
if [ -f "manual.html" ]; then
    zip -j "$ZIP_PATH" "manual.html"
fi
if [ -f "README.md" ]; then
    zip -j "$ZIP_PATH" "README.md"
fi

ZIP_SIZE=$(du -sh "$ZIP_PATH" | awk '{print $1}')

echo ""
echo "========================================="
echo "  ✅ 全て完了！"
echo "  📦 .app: $APP_PATH ($SIZE)"
echo "  📦 ZIP:  $ZIP_PATH ($ZIP_SIZE)"
echo ""
echo "  この ZIP を配布するだけで OK！"
echo "  Python のインストールは不要です。"
echo "========================================="
