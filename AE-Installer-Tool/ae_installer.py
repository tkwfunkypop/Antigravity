#!/usr/bin/env python3
"""
AE Installer Tool v4.2 - README指示ベース版
After Effects のスクリプト・プラグイン・プリセットを
README/マニュアルの指示に基づいて正しいディレクトリに振り分ける

原則:
  - READMEに明確な配置指示があるファイルのみ処理する
  - 指示がないファイルは対象外として表示する
  - 憶測で配置先を決定しない
  - ユーザーに確認してからインストールする

Usage:
    python3 ae_installer.py                                    # GUI モード
    python3 ae_installer.py --dry-run /path/to/folder -v 2026  # CLI モード
    python3 ae_installer.py /path/file.zip -v 2026             # ZIP
    python3 ae_installer.py /folder1 /file.zip -v 2026         # 複数
"""

import os
import sys
import glob
import shutil
import re
import subprocess
import argparse
import zipfile
import tempfile
from typing import List, Optional, Dict, Tuple


# ╔═══════════════════════════════════════════════════════════════╗
# ║  定数                                                         ║
# ╚═══════════════════════════════════════════════════════════════╝

AE_BASE_PATH_MAC = "/Applications"
AE_PATTERN_MAC = "Adobe After Effects*"

# AE ディレクトリ構造のキーワード → 相対パスマッピング
# README内のパスキーワードをAEディレクトリ内の相対パスに対応させる
KNOWN_AE_PATHS = {
    # ScriptUI Panels
    "scripts/scriptui panels":    "Scripts/ScriptUI Panels",
    "scripts/scriptui panel":     "Scripts/ScriptUI Panels",
    "scriptui panels":            "Scripts/ScriptUI Panels",
    "scriptui panel":             "Scripts/ScriptUI Panels",
    # Scripts
    "scripts/startup":            "Scripts/Startup",
    "scripts/shutdown":           "Scripts/Shutdown",
    "scripts":                    "Scripts",
    # Plug-ins
    "plug-ins":                   "Plug-ins",
    "plugins":                    "Plug-ins",
    # Presets
    "presets":                    "Presets",
    # Support Files
    "support files/scripts":     "Scripts",
}

# ファイル拡張子の基本情報（表示用のみ、振り分けには使わない）
EXT_INFO = {
    ".plugin":  {"label": "プラグイン (Mac)",      "icon": "🔌"},
    ".aex":     {"label": "プラグイン (Win)",      "icon": "⚠️"},
    ".jsx":     {"label": "スクリプト",            "icon": "📜"},
    ".jsxbin":  {"label": "コンパイル済スクリプト", "icon": "📜"},
    ".ffx":     {"label": "プリセット",            "icon": "🎨"},
    ".jsxinc":  {"label": "スクリプトライブラリ",  "icon": "📚"},
}


# ╔═══════════════════════════════════════════════════════════════╗
# ║  macOS ネイティブダイアログ                                     ║
# ╚═══════════════════════════════════════════════════════════════╝

def _osa(script: str) -> str:
    proc = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
    return proc.stdout.strip()

def dialog_info(title: str, message: str):
    _osa(f'display dialog "{message}" buttons {{"OK"}} default button "OK" '
         f'with title "{title}" with icon note')

def dialog_error(title: str, message: str):
    _osa(f'display dialog "{message}" buttons {{"OK"}} default button "OK" '
         f'with title "{title}" with icon stop')

def dialog_yesno(title: str, message: str) -> bool:
    result = _osa(f'display dialog "{message}" buttons {{"キャンセル", "OK"}} '
                  f'default button "OK" with title "{title}" with icon note')
    return "OK" in result

def dialog_choose_folder() -> Optional[List[str]]:
    result = _osa(
        'set chosenItems to choose folder with prompt '
        '"プラグイン・スクリプトのフォルダを選択\\n（⌘クリックで複数選択可能）" '
        'with multiple selections allowed\n'
        'set posixList to {}\n'
        'repeat with anItem in chosenItems\n'
        '  set end of posixList to POSIX path of anItem\n'
        'end repeat\n'
        'set AppleScript\'s text item delimiters to "|||"\n'
        'return posixList as text'
    )
    return [p.rstrip("/") for p in result.split("|||") if p.strip()] if result else None

def dialog_choose_files() -> Optional[List[str]]:
    result = _osa(
        'set chosenFiles to choose file with prompt '
        '"ZIPファイルを選択\\n（⌘クリックで複数選択可能）" '
        'of type {"zip", "public.zip-archive"} '
        'with multiple selections allowed\n'
        'set posixList to {}\n'
        'repeat with aFile in chosenFiles\n'
        '  set end of posixList to POSIX path of aFile\n'
        'end repeat\n'
        'set AppleScript\'s text item delimiters to "|||"\n'
        'return posixList as text'
    )
    return [p for p in result.split("|||") if p.strip()] if result else None

def dialog_choose_from_list(title: str, prompt: str, items: List[str]) -> Optional[str]:
    items_str = ", ".join(f'"{item}"' for item in items)
    result = _osa(f'choose from list {{{items_str}}} '
                  f'with title "{title}" with prompt "{prompt}" '
                  f'default items {{"{items[0]}"}}')
    return result if result and result != "false" else None

def dialog_input(title: str, prompt: str, default: str = "") -> Optional[str]:
    result = _osa(f'text returned of (display dialog "{prompt}" '
                  f'default answer "{default}" '
                  f'with title "{title}" with icon note)')
    return result if result else None

def dialog_notification(title: str, message: str):
    _osa(f'display notification "{message}" with title "{title}"')


# ╔═══════════════════════════════════════════════════════════════╗
# ║  ZIP 展開                                                      ║
# ╚═══════════════════════════════════════════════════════════════╝

def extract_zip(zip_path: str) -> Optional[str]:
    if not zipfile.is_zipfile(zip_path):
        return None
    zip_name = os.path.splitext(os.path.basename(zip_path))[0]
    tmp_dir = os.path.join(tempfile.gettempdir(), "ae_installer", zip_name)
    if os.path.exists(tmp_dir):
        shutil.rmtree(tmp_dir)
    os.makedirs(tmp_dir, exist_ok=True)
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(tmp_dir)
    macosx = os.path.join(tmp_dir, "__MACOSX")
    if os.path.exists(macosx):
        shutil.rmtree(macosx)
    entries = [e for e in os.listdir(tmp_dir) if not e.startswith(".")]
    if len(entries) == 1 and os.path.isdir(os.path.join(tmp_dir, entries[0])):
        return os.path.join(tmp_dir, entries[0])
    return tmp_dir

def cleanup_temp():
    tmp_dir = os.path.join(tempfile.gettempdir(), "ae_installer")
    if os.path.exists(tmp_dir):
        shutil.rmtree(tmp_dir, ignore_errors=True)

def resolve_input(path: str) -> Optional[str]:
    if os.path.isdir(path):
        return path
    if path.lower().endswith(".zip") and os.path.isfile(path):
        return extract_zip(path)
    return None


# ╔═══════════════════════════════════════════════════════════════╗
# ║  AE バージョン検出                                             ║
# ╚═══════════════════════════════════════════════════════════════╝

class AEVersion:
    def __init__(self, path: str):
        self.path = path
        self.name = os.path.basename(path.rstrip("/"))
        match = re.search(r"(\d{4}|\(Beta\)|Beta)", self.name)
        self.version = match.group(1) if match else self.name

    def resolve_path(self, relative: str) -> str:
        """AEディレクトリ内の相対パスを絶対パスに解決"""
        return os.path.join(self.path, relative)

def detect_ae_versions() -> List[AEVersion]:
    pattern = os.path.join(AE_BASE_PATH_MAC, AE_PATTERN_MAC)
    return [AEVersion(p) for p in sorted(glob.glob(pattern)) if os.path.isdir(p)]


# ╔═══════════════════════════════════════════════════════════════╗
# ║  README 解析 — 配置指示の抽出                                  ║
# ╚═══════════════════════════════════════════════════════════════╝

class InstallInstruction:
    """READMEから抽出した1つの配置指示"""
    def __init__(self, file_pattern: str, dest_relative: str, raw_line: str):
        self.file_pattern = file_pattern    # ファイル名 or 拡張子パターン
        self.dest_relative = dest_relative  # AEディレクトリ内の相対パス
        self.raw_line = raw_line            # 元のREADME行（根拠表示用）

    def __repr__(self):
        return f"{self.file_pattern} → {self.dest_relative}"


class ReadmeAnalysis:
    """README解析結果"""
    def __init__(self):
        self.product_name: str = ""
        self.vendor_name: str = ""
        self.instructions: List[InstallInstruction] = []
        self.raw_text: str = ""

    def has_instructions(self) -> bool:
        return len(self.instructions) > 0


def parse_readme(file_path: str) -> ReadmeAnalysis:
    """README/マニュアルから配置指示を抽出"""
    analysis = ReadmeAnalysis()
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
    except Exception:
        return analysis

    analysis.raw_text = text

    # 製品名
    m = re.search(r"^#\s+(.+?)$", text, re.MULTILINE)
    if m:
        analysis.product_name = re.sub(r"[#*_`\[\]]", "", m.group(1)).strip()

    # ベンダー名
    for pat in [r"^(?:by)\s+([A-Za-z0-9][\w\s]{1,40})",
                r"(?:by|author|developer|made\s+by|vendor)[:\s]+([A-Za-z0-9][\w\s]{1,40})",
                r"(?:©|copyright)\s*(?:\d{4})?\s*(.+?)(?:\.|$)"]:
        m = re.search(pat, text, re.IGNORECASE | re.MULTILINE)
        if m:
            v = re.sub(r"[\n\r].*$", "", m.group(1).strip()).strip()
            v = re.sub(r"[.,;:\-—].*$", "", v).strip()
            if v and 1 < len(v) < 40:
                analysis.vendor_name = v
                break

    # ─── 配置指示の抽出 ───
    lines = text.split("\n")

    # パターン1: 1行内にファイル名＋パスが記載
    # 例: "Copy FXConsole.plugin to Plug-ins/VideoCopilot/"
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        instructions = _extract_instructions_from_line(stripped, line)
        analysis.instructions.extend(instructions)

    # パターン2: セクション見出し + ファイルリスト
    # 例: ## Scripts/ScriptUI Panels/
    #     - script.jsx
    analysis.instructions.extend(_extract_section_based_instructions(lines))

    # パターン3: 日本語の一括指示 + テーブル/リスト
    # 例: "以下 2つとも を ScriptUI Panels フォルダへコピー"
    #     | NeoUtility.jsx | ファイル |
    #     | NeoUtility     | フォルダ |
    analysis.instructions.extend(_extract_bulk_instructions(lines))

    # 重複除去（同じファイル→同じパスの指示は1つに）
    seen = set()
    unique = []
    for inst in analysis.instructions:
        key = (inst.file_pattern.lower(), inst.dest_relative)
        if key not in seen:
            seen.add(key)
            unique.append(inst)
    analysis.instructions = unique

    return analysis


def _extract_instructions_from_line(stripped: str, raw_line: str) -> List[InstallInstruction]:
    """1行からファイル配置指示を抽出"""
    instructions = []

    # AE関連ディレクトリパスがこの行に含まれるか
    dest_relative = _find_ae_path_in_text(stripped)
    if not dest_relative:
        return instructions

    # この行からファイル名/パターンを抽出
    file_patterns = _extract_file_references(stripped)
    for fp in file_patterns:
        instructions.append(InstallInstruction(fp, dest_relative, raw_line.strip()))

    return instructions


def _extract_section_based_instructions(lines: List[str]) -> List[InstallInstruction]:
    """セクション見出し＋ファイルリスト形式の指示を抽出"""
    instructions = []
    current_dest = None
    current_heading = ""

    for line in lines:
        stripped = line.strip()

        # 見出し行にAEパスが含まれるか
        if stripped.startswith("#") or stripped.startswith("**"):
            dest = _find_ae_path_in_text(stripped)
            if dest:
                current_dest = dest
                current_heading = stripped
            else:
                current_dest = None
            continue

        if current_dest and stripped:
            # リスト項目 (-, *, 数字.)
            list_match = re.match(r"^[-*•]\s+(.+)$|^\d+\.\s+(.+)$", stripped)
            if list_match:
                item = (list_match.group(1) or list_match.group(2)).strip()
                file_refs = _extract_file_references(item)
                for fp in file_refs:
                    instructions.append(InstallInstruction(fp, current_dest, current_heading))

    return instructions


def _extract_bulk_instructions(lines: List[str]) -> List[InstallInstruction]:
    """日本語の一括指示 + テーブル/リスト形式を解析

    対応パターン:
      - 「以下をScriptUI Panelsフォルダへコピーしてください」
      - 「～をScriptUI Panelsフォルダにコピー」
      - 後続のMarkdownテーブル(| name | type |)からファイル/フォルダ名を抽出
    """
    instructions = []
    pending_dest = None
    pending_source_line = ""
    in_table = False

    for line in lines:
        stripped = line.strip()

        # 見出し行はコンテキストをリセット
        if stripped.startswith("#"):
            pending_dest = None
            in_table = False
            continue

        # 日本語一括指示の検出
        # 「〜をScriptUI Panelsフォルダへコピー」
        # 「～をPresetsフォルダにコピー」
        jp_match = re.search(
            r'(?:を|は)\s*(.+?)(?:フォルダ|ディレクトリ|に|へ).*'
            r'(?:コピー|入れ|配置|格納|インストール|移動|置い)',
            stripped
        )
        if jp_match:
            dest = _find_ae_path_in_text(jp_match.group(1))
            if dest:
                pending_dest = dest
                pending_source_line = stripped
                in_table = False
                continue

        # パスが含まれる一般的なフレーズ
        # 「Copy ... to Scripts/ScriptUI Panels/」
        en_match = re.search(
            r'(?:copy|place|put|install|move).*(?:to|in|into)\s+(.+)',
            stripped, re.IGNORECASE
        )
        if en_match and not pending_dest:
            dest = _find_ae_path_in_text(en_match.group(1))
            if dest:
                # この行にファイル名も含まれていたら即指示にする（1行パターン）
                refs = _extract_file_references(stripped)
                if refs:
                    continue  # 1行パターンは _extract_instructions_from_line で処理済み
                pending_dest = dest
                pending_source_line = stripped
                in_table = False
                continue

        # pending_dest がある場合、後続行からファイル名を収集
        if pending_dest and stripped:
            # Markdownテーブル行 (| name | type |)
            if "|" in stripped:
                # ヘッダー行やセパレーター行をスキップ
                if re.match(r'^[|\s:\-]+$', stripped):
                    in_table = True
                    continue
                if any(h in stripped for h in ['コピーするもの', '種類', 'ファイル名', 'File', 'Type', '---']):
                    in_table = True
                    continue

                in_table = True
                cells = [c.strip().strip('`') for c in stripped.split('|') if c.strip()]
                if cells:
                    name = cells[0].strip()
                    if name and not name.startswith('---'):
                        instructions.append(InstallInstruction(
                            name, pending_dest, pending_source_line))
                continue

            # リスト項目
            list_match = re.match(r'^[-*•]\s+`?(.+?)`?\s*$', stripped)
            if list_match:
                name = list_match.group(1).strip()
                if name:
                    instructions.append(InstallInstruction(
                        name, pending_dest, pending_source_line))
                continue

            # コード記法内の名前(`name`)
            code_match = re.findall(r'`([^`]+)`', stripped)
            if code_match and in_table:
                for name in code_match:
                    instructions.append(InstallInstruction(
                        name, pending_dest, pending_source_line))
                continue

            # 空行でなければテーブルの終わり
            if in_table and not stripped.startswith('|'):
                in_table = False
                # pending_dest は維持（同セクション内の別リストが続く可能性）

        # 空行は pending をクリアしない（テーブルの前後に空行があることが多い）
        # ただし見出しの切り替えでリセット（上で処理済み）

    return instructions


def _find_ae_path_in_text(text: str) -> Optional[str]:
    """テキスト内のAEディレクトリパスキーワードを検出し、相対パスを返す"""
    lower = text.lower()

    # ベンダー付きplug-insパス: Plug-ins/VendorName/
    m = re.search(r"plug-?ins?/([A-Za-z0-9][\w\s]*?)(?:/|$|\s|」|」)", text, re.IGNORECASE)
    if m:
        vendor = m.group(1).strip().rstrip("/")
        if vendor and len(vendor) < 40:
            return f"Plug-ins/{vendor}"

    # 既知のパスキーワードをチェック（長いものから優先）
    for keyword, relative in sorted(KNOWN_AE_PATHS.items(), key=lambda x: -len(x[0])):
        if keyword in lower:
            return relative

    return None


def _extract_file_references(text: str) -> List[str]:
    """テキストからファイル名・ファイルパターンを抽出"""
    patterns = []

    # 具体的ファイル名 (例: FXConsole.plugin, script.jsx)
    # スペースを含むファイル名も対応するが、英単語+スペース+ファイル名を誤マッチしないよう
    # バッククォートで囲まれた場合を優先し、そうでなければスペースなしでマッチ
    for m in re.finditer(r"`([\w\-. ]+\.(?:plugin|jsx|jsxbin|ffx|jsxinc|aex))`", text, re.IGNORECASE):
        patterns.append(m.group(1).strip())
    for m in re.finditer(r"(?<![`\w])([\w\-.]+\.(?:plugin|jsx|jsxbin|ffx|jsxinc|aex))(?!`)", text, re.IGNORECASE):
        val = m.group(1).strip()
        if val not in patterns:
            patterns.append(val)

    # ワイルドカード (例: *.ffx, *.jsx)
    for m in re.finditer(r"(\*\.(?:plugin|jsx|jsxbin|ffx|jsxinc|aex))", text, re.IGNORECASE):
        if m.group(1) not in patterns:
            patterns.append(m.group(1))

    # コード記法内の名前 (`NeoUtility.jsx`, `NeoUtility` 等)
    for m in re.finditer(r"`([^`]+)`", text):
        name = m.group(1).strip()
        if name and name not in patterns:
            # 拡張子付きファイル名、または英数字のフォルダ名
            if re.match(r'^[\w\-. ]+\.\w+$', name) or re.match(r'^[A-Za-z][\w\-]*$', name):
                patterns.append(name)

    return patterns


# ドキュメントとして除外するファイル名
_SKIP_DOC_NAMES = {
    "license", "license.md", "license.txt", "license.html",
    "changelog.md", "changelog.txt", "changelog.html",
    "history.md", "history.txt",
}

# 内容ベースでドキュメントかどうかを判定するキーワード
_DOC_KEYWORDS = [
    "scriptui panels", "scriptui panel", "plug-ins", "plugins",
    "presets", "scripts/", "support files",
    "インストール", "コピー", "配置", "格納", "スクリプト",
    "プラグイン", "プリセット", "after effects",
]


def _is_likely_doc(file_path: str) -> bool:
    """ファイルの内容にAE関連のインストール指示キーワードが含まれるか判定"""
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            # 先頭 4KB のみ読んで判定（パフォーマンス考慮）
            head = f.read(4096).lower()
        return any(kw in head for kw in _DOC_KEYWORDS)
    except Exception:
        return False


def find_all_docs(folder: str) -> List[str]:
    """フォルダ内の全ドキュメントファイル（.md, .txt, .pdf, .html）を収集"""
    docs = []
    # 優先順: README系 → INSTALL系 → Manual系 → 日本語 → 英語追加
    priority_names = [
        "README.md", "readme.md", "README.txt", "readme.txt", "README",
        "INSTALL.md", "install.md", "INSTALL.txt", "install.txt",
        "Manual.md", "manual.md", "Manual.txt", "manual.txt",
        "manual.html", "Manual.html",
        # 日本語ドキュメント
        "使い方.txt", "説明書.txt", "インストール方法.txt", "インストール.txt",
        "マニュアル.txt", "手順書.txt", "導入手順.txt",
        "使い方.md", "説明書.md", "インストール.md", "マニュアル.md",
        "使い方.html", "説明書.html", "インストール.html", "マニュアル.html",
        # 英語追加パターン
        "GUIDE.md", "guide.md", "GUIDE.txt", "guide.txt",
        "INSTRUCTIONS.md", "instructions.md", "INSTRUCTIONS.txt", "instructions.txt",
        "HOWTO.md", "howto.md", "HOWTO.txt", "howto.txt",
        "SETUP.md", "setup.md", "SETUP.txt", "setup.txt",
    ]
    found_names = set()
    doc_exts = {".md", ".txt", ".pdf", ".html", ".htm"}

    # 優先ファイルを先に追加
    for name in priority_names:
        p = os.path.join(folder, name)
        if os.path.exists(p):
            docs.append(p)
            found_names.add(name.lower())

    # 指定フォルダ + 1階層サブフォルダを探索
    search_dirs = [folder]
    try:
        for entry in os.listdir(folder):
            sub = os.path.join(folder, entry)
            if os.path.isdir(sub) and not entry.startswith(".") and not entry.startswith("__"):
                # ドキュメント系サブフォルダ名
                if entry.lower() in ("docs", "doc", "documentation", "manual", "manuals",
                                      "help", "readme", "info"):
                    search_dirs.append(sub)
    except Exception:
        pass

    for search_dir in search_dirs:
        try:
            for entry in os.listdir(search_dir):
                if entry.lower() in found_names:
                    continue
                if entry.startswith("."):
                    continue
                full = os.path.join(search_dir, entry)
                if not os.path.isfile(full):
                    continue
                if entry.lower() in _SKIP_DOC_NAMES:
                    continue
                ext = os.path.splitext(entry)[1].lower()
                if ext in doc_exts:
                    # .txt と .html は内容を簡易チェック（大量の無関係ファイルを除外）
                    if ext in (".txt", ".html", ".htm"):
                        if _is_likely_doc(full):
                            docs.append(full)
                            found_names.add(entry.lower())
                    else:
                        # .md, .pdf はそのまま追加
                        docs.append(full)
                        found_names.add(entry.lower())
        except Exception:
            pass

    return docs


def parse_all_docs(folder: str) -> ReadmeAnalysis:
    """フォルダ内の全ドキュメントから配置指示を集約"""
    doc_paths = find_all_docs(folder)
    if not doc_paths:
        return ReadmeAnalysis()

    # 全ドキュメントを解析して指示を集約
    combined = ReadmeAnalysis()
    doc_names = []

    for doc_path in doc_paths:
        ext = os.path.splitext(doc_path)[1].lower()
        if ext == ".pdf":
            # PDFはテキスト抽出を試みる
            text = _extract_pdf_text(doc_path)
            if text:
                analysis = _parse_text(text, os.path.basename(doc_path))
            else:
                continue
        elif ext in (".html", ".htm"):
            # HTMLはタグを除去してテキスト解析
            text = _extract_html_text(doc_path)
            if text:
                analysis = _parse_text(text, os.path.basename(doc_path))
            else:
                continue
        else:
            analysis = parse_readme(doc_path)

        # 製品名・ベンダー名は最初に見つかったものを採用
        if analysis.product_name and not combined.product_name:
            combined.product_name = analysis.product_name
        if analysis.vendor_name and not combined.vendor_name:
            combined.vendor_name = analysis.vendor_name

        # 指示は全て統合
        if analysis.instructions:
            combined.instructions.extend(analysis.instructions)
            doc_names.append(os.path.basename(doc_path))

    # raw_textに解析したドキュメント名を記録
    combined.raw_text = ", ".join(doc_names) if doc_names else ""

    # 重複除去
    seen = set()
    unique = []
    for inst in combined.instructions:
        key = (inst.file_pattern.lower(), inst.dest_relative)
        if key not in seen:
            seen.add(key)
            unique.append(inst)
    combined.instructions = unique

    return combined


def _parse_text(text: str, source_name: str) -> ReadmeAnalysis:
    """テキスト文字列を直接解析（PDF抽出テキスト用）"""
    analysis = ReadmeAnalysis()
    analysis.raw_text = text

    # 製品名
    m = re.search(r"^#\s+(.+?)$", text, re.MULTILINE)
    if m:
        analysis.product_name = re.sub(r"[#*_`\[\]]", "", m.group(1)).strip()

    # ベンダー名
    for pat in [r"^(?:by)\s+([A-Za-z0-9][\w\s]{1,40})",
                r"(?:by|author|developer|made\s+by|vendor)[:\s]+([A-Za-z0-9][\w\s]{1,40})",
                r"(?:©|copyright)\s*(?:\d{4})?\s*(.+?)(?:\.|$)"]:
        m = re.search(pat, text, re.IGNORECASE | re.MULTILINE)
        if m:
            v = re.sub(r"[\n\r].*$", "", m.group(1).strip()).strip()
            v = re.sub(r"[.,;:\-—].*$", "", v).strip()
            if v and 1 < len(v) < 40:
                analysis.vendor_name = v
                break

    # 配置指示の抽出（parse_readmeと同じロジック）
    lines = text.split("\n")
    for line in lines:
        stripped = line.strip()
        if stripped:
            instructions = _extract_instructions_from_line(stripped, line)
            analysis.instructions.extend(instructions)
    analysis.instructions.extend(_extract_section_based_instructions(lines))
    analysis.instructions.extend(_extract_bulk_instructions(lines))

    return analysis


def _extract_html_text(html_path: str) -> Optional[str]:
    """HTMLファイルからテキストを抽出（タグ除去）"""
    try:
        with open(html_path, "r", encoding="utf-8", errors="ignore") as f:
            html = f.read()
    except Exception:
        return None

    # <script> と <style> ブロックを除去
    html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE)
    # HTMLコメントを除去
    html = re.sub(r'<!--.*?-->', '', html, flags=re.DOTALL)
    # <br>, <p>, <div>, <li>, <tr>, <h*> 等のブロック要素を改行に変換
    html = re.sub(r'<(?:br|p|div|li|tr|h[1-6])[^>]*/?>', '\n', html, flags=re.IGNORECASE)
    # 残りのHTMLタグを除去
    html = re.sub(r'<[^>]+>', '', html)
    # HTMLエンティティをデコード
    try:
        import html as html_mod
        text = html_mod.unescape(html)
    except Exception:
        text = html
    # 連続空行を圧縮
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip() if text.strip() else None


def _extract_pdf_text(pdf_path: str) -> Optional[str]:
    """PDFからテキストを抽出（PyPDF2 or pdfplumber）"""
    # PyPDF2を試す
    try:
        import PyPDF2
        with open(pdf_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text if text.strip() else None
    except ImportError:
        pass
    except Exception:
        pass

    # pdfplumberを試す
    try:
        import pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
            return text if text.strip() else None
    except ImportError:
        pass
    except Exception:
        pass

    return None


def detect_vendor(folder: str) -> str:
    basename = os.path.basename(folder.rstrip("/"))
    clean = re.sub(r"[-_]?(mac|win|osx|macos|installer|install|setup|v?\d+[\.\d]*)",
                   "", basename, flags=re.IGNORECASE).strip()
    return clean if clean else basename


# ╔═══════════════════════════════════════════════════════════════╗
# ║  ファイルマッチング — 指示とファイルの突合せ                      ║
# ╚═══════════════════════════════════════════════════════════════╝

class FileAction:
    """ファイルに対するアクション"""
    def __init__(self, path: str, name: str, ext: str):
        self.path = path
        self.name = name
        self.ext = ext
        self.is_dir = os.path.isdir(path) or ext == ".plugin"
        self.dest_dir = ""           # 絶対パス
        self.dest_label = ""         # 表示用
        self.instruction_source = "" # 根拠となったREADME行
        self.status = "pending"      # matched / skipped / no_instruction
        self.skip_reason = ""
        info = EXT_INFO.get(ext, {})
        self.icon = info.get("icon", "📄")
        self.label = info.get("label", os.path.splitext(name)[1])


def collect_files(folder: str, instructions: List[InstallInstruction] = None) -> List[str]:
    """フォルダ内のファイル・フォルダを収集（指示にあるフォルダ名も対象に含める）"""
    results = []
    # 指示に含まれるフォルダ名（拡張子なし）を抽出
    instructed_names = set()
    if instructions:
        for inst in instructions:
            p = inst.file_pattern
            if "." not in p and not p.startswith("*"):
                instructed_names.add(p.lower())

    try:
        for entry in os.listdir(folder):
            if entry.startswith(".") or entry.startswith("__"):
                continue
            entry_lower = entry.lower()
            if entry_lower in ("readme.md", "readme.txt", "readme.html",
                                  "manual.md", "manual.txt", "manual.html",
                                  "license", "license.md", "license.txt", "license.html",
                                  "install.md", "install.txt", "install.html",
                                  "changelog.md", "changelog.txt", "changelog.html",
                                  "guide.md", "guide.txt", "guide.html",
                                  "instructions.md", "instructions.txt",
                                  "howto.md", "howto.txt", "setup.md", "setup.txt",
                                  "使い方.txt", "説明書.txt", "インストール方法.txt",
                                  "インストール.txt", "マニュアル.txt", "手順書.txt",
                                  "導入手順.txt", "使い方.md", "説明書.md",
                                  "インストール.md", "マニュアル.md",
                                  "使い方.html", "説明書.html",
                                  "インストール.html", "マニュアル.html"):
                continue
            full = os.path.join(folder, entry)
            ext = os.path.splitext(entry)[1].lower()
            if ext in (".bat", ".sh", ".command", ".app", ".dmg", ".pkg", ".exe", ".msi", ".zip"):
                continue

            if ext in EXT_INFO:
                # AE関連拡張子のファイル
                results.append(full)
            elif os.path.isdir(full):
                # 指示に名前があるフォルダはそのまま対象に
                if entry.lower() in instructed_names:
                    results.append(full)
                elif os.path.exists(os.path.join(full, "CSXS", "manifest.xml")):
                    results.append(full)
                else:
                    results.extend(collect_files(full, instructions))
    except PermissionError:
        pass
    return results


def match_files_to_instructions(
    file_paths: List[str],
    instructions: List[InstallInstruction],
    ae: AEVersion
) -> List[FileAction]:
    """ファイルと配置指示を突合せ"""
    actions = []

    for fp in file_paths:
        name = os.path.basename(fp)
        ext = os.path.splitext(fp)[1].lower()
        action = FileAction(fp, name, ext)

        # .aex は Mac では常にスキップ
        if ext == ".aex":
            action.status = "skipped"
            action.skip_reason = "Windows用プラグイン（Macでは使用不可）"
            actions.append(action)
            continue

        # 配置指示とマッチング
        matched = False
        for inst in instructions:
            if _file_matches_pattern(name, ext, inst.file_pattern):
                action.dest_dir = ae.resolve_path(inst.dest_relative)
                action.dest_label = inst.dest_relative + "/"
                action.instruction_source = inst.raw_line
                action.status = "matched"
                matched = True
                break

        if not matched:
            action.status = "no_instruction"
            action.skip_reason = "READMEに配置指示なし"

        actions.append(action)

    return actions


def _file_matches_pattern(filename: str, ext: str, pattern: str) -> bool:
    """ファイル名がパターンにマッチするか"""
    pattern_lower = pattern.lower().strip()
    filename_lower = filename.lower()

    # 完全一致
    if pattern_lower == filename_lower:
        return True

    # ワイルドカード (例: *.jsx)
    if pattern_lower.startswith("*."):
        return filename_lower.endswith(pattern_lower[1:])

    # 拡張子なしパターン → フォルダ名の完全一致
    # (例: パターン "NeoUtility" がフォルダ "NeoUtility" にマッチ)
    if "." not in pattern_lower:
        if pattern_lower == filename_lower:
            return True
        # 拡張子無視の一致 (例: パターン "NeoUtility" → "NeoUtility.jsx")
        name_without_ext = os.path.splitext(filename_lower)[0]
        if pattern_lower == name_without_ext:
            return False  # 拡張子なしパターンは拡張子付きファイルにはマッチさせない（曖昧回避）
        return False

    # 拡張子付き部分一致
    if "." in pattern_lower and pattern_lower in filename_lower:
        return True

    return False


# ╔═══════════════════════════════════════════════════════════════╗
# ║  インストール実行                                               ║
# ╚═══════════════════════════════════════════════════════════════╝

class InstallResult:
    def __init__(self, action: FileAction, success: bool, message: str):
        self.action = action
        self.success = success
        self.message = message


def install_actions(actions: List[FileAction], dry_run: bool = False) -> List[InstallResult]:
    """マッチしたファイルのみインストール"""
    results = []
    needs_admin = False
    matched = [a for a in actions if a.status == "matched"]

    for a in actions:
        if a.status != "matched":
            if a.status == "skipped":
                results.append(InstallResult(a, False, f"⚠️ スキップ: {a.skip_reason}"))
            # no_instruction は結果に含めない（対象外）
            continue
        if dry_run:
            results.append(InstallResult(a, True,
                f"🔍 [ドライラン] {a.name} → {a.dest_label}"))
            continue
        try:
            _do_copy(a)
            results.append(InstallResult(a, True, f"✅ {a.name} → {a.dest_label}"))
        except PermissionError:
            needs_admin = True
            break
        except Exception as e:
            results.append(InstallResult(a, False, f"❌ {a.name}: {e}"))

    if needs_admin:
        results = []
        results.extend(_install_with_admin(matched))

    return results


def _do_copy(a: FileAction):
    os.makedirs(a.dest_dir, exist_ok=True)
    dest = os.path.join(a.dest_dir, a.name)
    if os.path.exists(dest):
        shutil.rmtree(dest) if os.path.isdir(dest) else os.remove(dest)
    if a.is_dir:
        shutil.copytree(a.path, dest)
    else:
        shutil.copy2(a.path, dest)


def _install_with_admin(actions: List[FileAction]) -> List[InstallResult]:
    results = []
    commands = []
    for a in actions:
        dest = os.path.join(a.dest_dir, a.name)
        src = a.path.replace("'", "'\\''")
        dd = a.dest_dir.replace("'", "'\\''")
        d = dest.replace("'", "'\\''")
        commands.append(f"mkdir -p '{dd}'")
        commands.append(f"rm -rf '{d}'")
        commands.append(f"cp -R '{src}' '{d}'" if a.is_dir else f"cp '{src}' '{d}'")

    if not commands:
        return results

    try:
        proc = subprocess.run(
            ["osascript", "-e",
             f'do shell script "{" && ".join(commands)}" with administrator privileges'],
            capture_output=True, text=True, timeout=120)
        if proc.returncode == 0:
            for a in actions:
                results.append(InstallResult(a, True, f"✅ {a.name} → {a.dest_label}"))
        else:
            err = proc.stderr.strip()
            msg = "⚠️ 認証キャンセル" if ("User canceled" in err or "-128" in err) else f"❌ {err}"
            for a in actions:
                results.append(InstallResult(a, False, msg))
    except Exception as e:
        for a in actions:
            results.append(InstallResult(a, False, f"❌ {e}"))
    return results


# ╔═══════════════════════════════════════════════════════════════╗
# ║  GUI モード                                                    ║
# ╚═══════════════════════════════════════════════════════════════╝

def run_gui():
    ae_versions = detect_ae_versions()
    if not ae_versions:
        dialog_error("AE Installer Tool", "❌ After Effects が見つかりません。")
        return

    selected = dialog_choose_from_list(
        "🔧 AE Installer Tool v4",
        "インストール先の After Effects を選択:",
        [v.name for v in ae_versions])
    if not selected:
        return
    target = next((v for v in ae_versions if v.name == selected), None)
    if not target:
        return

    choice = dialog_choose_from_list(
        "📂 入力を選択",
        "何を読み込みますか？",
        ["📁 フォルダを選択（複数可）", "📦 ZIPファイルを選択（複数可）"])
    if not choice:
        return

    input_paths = (dialog_choose_folder() if "フォルダ" in choice
                   else dialog_choose_files())
    if not input_paths:
        return

    total_ok = total_fail = 0
    summaries = []

    for i, path in enumerate(input_paths):
        folder = resolve_input(path)
        if not folder:
            dialog_error("エラー", f"読み込めません: {os.path.basename(path)}")
            continue

        pkg_name = os.path.basename(path)

        # 全ドキュメントから配置指示を収集
        analysis = parse_all_docs(folder)

        if not analysis.has_instructions():
            dialog_info(f"[{i+1}/{len(input_paths)}] {pkg_name}",
                        "ドキュメントに配置指示が見つかりませんでした。\\n"
                        "このパッケージはスキップします。")
            continue

        # ファイル収集 & マッチング
        file_paths = collect_files(folder, analysis.instructions)
        if not file_paths:
            dialog_info(f"[{i+1}/{len(input_paths)}] {pkg_name}",
                        "対象ファイルが見つかりませんでした。")
            continue

        actions = match_files_to_instructions(file_paths, analysis.instructions, target)
        matched = [a for a in actions if a.status == "matched"]
        unmatched = [a for a in actions if a.status == "no_instruction"]
        skipped = [a for a in actions if a.status == "skipped"]

        if not matched:
            msg = f"{pkg_name}\\n\\n"
            msg += "READMEの指示に一致するファイルがありませんでした。\\n\\n"
            if unmatched:
                msg += f"指示なしのファイル: {len(unmatched)} 個\\n"
                for a in unmatched[:5]:
                    msg += f"  • {a.name}\\n"
            dialog_info(f"[{i+1}/{len(input_paths)}] スキップ", msg)
            continue

        # 確認ダイアログ
        confirm_msg = f"{pkg_name}"
        if analysis.product_name:
            confirm_msg += f" ({analysis.product_name})"
        confirm_msg += f"\\n→ {target.name}\\n\\n"
        confirm_msg += "【配置するファイル（READMEの指示あり）】\\n"
        for a in matched:
            confirm_msg += f"  {a.icon} {a.name} → {a.dest_label}\\n"
        if unmatched:
            confirm_msg += f"\\n【対象外（指示なし）】 {len(unmatched)} 個\\n"
            for a in unmatched[:3]:
                confirm_msg += f"  • {a.name}\\n"
            if len(unmatched) > 3:
                confirm_msg += f"  ... 他 {len(unmatched)-3} 個\\n"
        if skipped:
            confirm_msg += f"\\n【スキップ】 {len(skipped)} 個\\n"
            for a in skipped:
                confirm_msg += f"  ⚠️ {a.name} ({a.skip_reason})\\n"

        if not dialog_yesno(f"インストール確認 [{i+1}/{len(input_paths)}]", confirm_msg):
            continue

        # インストール
        results = install_actions(actions)
        ok = sum(1 for r in results if r.success)
        fail = sum(1 for r in results if not r.success and "スキップ" not in r.message)
        total_ok += ok
        total_fail += fail
        summaries.append(f"{'✅' if fail==0 else '⚠️'} {pkg_name}: {ok}成功")

    # 最終サマリー
    if summaries:
        msg = f"📊 合計: ✅ {total_ok} 成功 / ❌ {total_fail} 失敗\\n\\n"
        msg += "\\n".join(summaries)
        if total_fail == 0:
            msg += "\\n\\n🎉 After Effects を再起動してください！"
            dialog_info("✅ 完了", msg)
        else:
            dialog_error("⚠️ 結果", msg)
    else:
        dialog_info("完了", "処理するパッケージがありませんでした。")

    cleanup_temp()


# ╔═══════════════════════════════════════════════════════════════╗
# ║  CLI モード                                                    ║
# ╚═══════════════════════════════════════════════════════════════╝

def run_cli(args):
    versions = detect_ae_versions()
    if not versions:
        print("❌ After Effects が見つかりません"); sys.exit(1)

    target = None
    if args.version:
        target = next((v for v in versions
                       if args.version in v.name or args.version == v.version), None)
        if not target:
            print(f"❌ バージョン '{args.version}' 不明"); sys.exit(1)
    else:
        target = versions[-1]

    print(f"🎯 対象: {target.name}")
    print(f"📦 パッケージ数: {len(args.folders)}\n")

    total_ok = total_fail = 0

    for i, path in enumerate(args.folders):
        folder = resolve_input(path)
        if not folder:
            print(f"❌ 読み込めません: {path}"); continue

        pkg_name = os.path.basename(path)
        is_zip = path.lower().endswith(".zip")
        print(f"{'═'*50}")
        print(f"  [{i+1}/{len(args.folders)}] {'📦 ZIP' if is_zip else '📂'}: {pkg_name}")

        analysis = parse_all_docs(folder)

        if analysis.raw_text:
            print(f"  📝 参照ドキュメント: {analysis.raw_text}")
        else:
            print("  📝 ドキュメントなし")
        if analysis.product_name:
            print(f"  📦 製品名: {analysis.product_name}")
        if analysis.vendor_name:
            print(f"  🏢 ベンダー: {analysis.vendor_name}")

        if not analysis.has_instructions():
            print("  ⚠️ 配置指示が見つかりません → スキップ\n"); continue

        print(f"  📋 検出された配置指示:")
        for inst in analysis.instructions:
            print(f"    • {inst.file_pattern} → {inst.dest_relative}/")

        file_paths = collect_files(folder, analysis.instructions)
        print(f"  📂 {len(file_paths)} 個のファイルを検出")

        actions = match_files_to_instructions(file_paths, analysis.instructions, target)
        matched = [a for a in actions if a.status == "matched"]
        unmatched = [a for a in actions if a.status == "no_instruction"]
        skipped = [a for a in actions if a.status == "skipped"]

        if matched:
            print(f"\n  ✅ 配置対象 ({len(matched)} 個):")
            for a in matched:
                print(f"    {a.icon} {a.name} → {a.dest_label}")
                print(f"       根拠: {a.instruction_source}")
        if unmatched:
            print(f"\n  ⬜ 対象外・指示なし ({len(unmatched)} 個):")
            for a in unmatched:
                print(f"    • {a.name}")
        if skipped:
            print(f"\n  ⚠️ スキップ ({len(skipped)} 個):")
            for a in skipped:
                print(f"    ⚠️ {a.name} ({a.skip_reason})")

        if not matched:
            print("  → マッチするファイルなし\n"); continue

        results = install_actions(actions, dry_run=args.dry_run)
        print(f"\n  {'─'*40}")
        for r in results:
            print(f"    {r.message}")

        ok = sum(1 for r in results if r.success)
        fail = sum(1 for r in results if not r.success and "スキップ" not in r.message)
        total_ok += ok
        total_fail += fail
        print(f"  📊 {ok} 成功 / {fail} 失敗\n")

    print(f"{'═'*50}")
    print(f"📊 合計: ✅ {total_ok} / ❌ {total_fail}")
    if not args.dry_run and total_fail == 0 and total_ok > 0:
        print("🎉 完了！After Effects を再起動してください。")
    cleanup_temp()


# ╔═══════════════════════════════════════════════════════════════╗
# ║  エントリーポイント                                             ║
# ╚═══════════════════════════════════════════════════════════════╝

def main():
    parser = argparse.ArgumentParser(description="AE Installer Tool - README指示ベース")
    parser.add_argument("folders", nargs="*", help="フォルダ or ZIP（複数可）")
    parser.add_argument("--version", "-v", help="AEバージョン（例: 2026）")
    parser.add_argument("--dry-run", "-d", action="store_true", help="ドライラン")
    args = parser.parse_args()

    if args.folders:
        run_cli(args)
    else:
        run_gui()

if __name__ == "__main__":
    main()
