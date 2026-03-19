#!/usr/bin/env python3
"""
AE Installer Tool v4.2 (Windows版) - README指示ベース
After Effects のスクリプト・プラグイン・プリセットを
README/マニュアルの指示に基づいて正しいディレクトリに振り分ける

原則:
  - READMEに明確な配置指示があるファイルのみ処理する
  - 指示がないファイルは対象外として表示する
  - 憶測で配置先を決定しない
  - ユーザーに確認してからインストールする

Usage:
    python ae_installer_win.py                                    # GUI モード
    python ae_installer_win.py --dry-run /path/to/folder -v 2026  # CLI モード
    python ae_installer_win.py /path/file.zip -v 2026             # ZIP
    python ae_installer_win.py /folder1 /file.zip -v 2026         # 複数
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
import ctypes
from typing import List, Optional, Dict, Tuple


# ╔═══════════════════════════════════════════════════════════════╗
# ║  定数                                                         ║
# ╚═══════════════════════════════════════════════════════════════╝

# Windows の AE パス
AE_BASE_PATHS_WIN = [
    os.path.join(os.environ.get("PROGRAMFILES", r"C:\Program Files"), "Adobe"),
    os.path.join(os.environ.get("PROGRAMFILES(X86)", r"C:\Program Files (x86)"), "Adobe"),
]
AE_PATTERN_WIN = "Adobe After Effects*"

# AE ディレクトリ構造のキーワード → 相対パスマッピング
# Windows の AE は Support Files/ 内にスクリプトやプリセットが配置される
KNOWN_AE_PATHS = {
    # ScriptUI Panels
    "scripts/scriptui panels":    r"Support Files\Scripts\ScriptUI Panels",
    "scripts/scriptui panel":     r"Support Files\Scripts\ScriptUI Panels",
    "scriptui panels":            r"Support Files\Scripts\ScriptUI Panels",
    "scriptui panel":             r"Support Files\Scripts\ScriptUI Panels",
    # Scripts
    "scripts/startup":            r"Support Files\Scripts\Startup",
    "scripts/shutdown":           r"Support Files\Scripts\Shutdown",
    "scripts":                    r"Support Files\Scripts",
    # Plug-ins
    "plug-ins":                   r"Support Files\Plug-ins",
    "plugins":                    r"Support Files\Plug-ins",
    # Presets
    "presets":                    r"Support Files\Presets",
    # Support Files
    "support files/scripts":     r"Support Files\Scripts",
    "support files\scripts\scriptui panels": r"Support Files\Scripts\ScriptUI Panels",
    r"support files\\scripts\\scriptui panels": r"Support Files\Scripts\ScriptUI Panels",
}

# ファイル拡張子の基本情報（表示用のみ、振り分けには使わない）
EXT_INFO = {
    ".aex":     {"label": "プラグイン (Win)",      "icon": "[P]"},
    ".plugin":  {"label": "プラグイン (Mac)",      "icon": "[!]"},
    ".jsx":     {"label": "スクリプト",            "icon": "[S]"},
    ".jsxbin":  {"label": "コンパイル済スクリプト", "icon": "[S]"},
    ".ffx":     {"label": "プリセット",            "icon": "[E]"},
    ".jsxinc":  {"label": "スクリプトライブラリ",  "icon": "[L]"},
}


# ╔═══════════════════════════════════════════════════════════════╗
# ║  Windows ダイアログ (tkinter)                                  ║
# ╚═══════════════════════════════════════════════════════════════╝

def _init_tk():
    """tkinter のルートウィンドウを初期化(非表示)"""
    import tkinter as tk
    root = tk.Tk()
    root.withdraw()
    root.attributes("-topmost", True)
    return root

def dialog_info(title: str, message: str):
    from tkinter import messagebox
    root = _init_tk()
    messagebox.showinfo(title, message, parent=root)
    root.destroy()

def dialog_error(title: str, message: str):
    from tkinter import messagebox
    root = _init_tk()
    messagebox.showerror(title, message, parent=root)
    root.destroy()

def dialog_yesno(title: str, message: str) -> bool:
    from tkinter import messagebox
    root = _init_tk()
    result = messagebox.askyesno(title, message, parent=root)
    root.destroy()
    return result

def dialog_choose_folder() -> Optional[List[str]]:
    """フォルダ選択ダイアログ (複数選択は1つずつ)"""
    from tkinter import filedialog
    paths = []
    while True:
        root = _init_tk()
        path = filedialog.askdirectory(
            title="プラグイン・スクリプトのフォルダを選択",
            parent=root)
        root.destroy()
        if not path:
            break
        paths.append(path)
        if not dialog_yesno("追加選択", "さらにフォルダを追加しますか？"):
            break
    return paths if paths else None

def dialog_choose_files() -> Optional[List[str]]:
    """ZIPファイル選択ダイアログ"""
    from tkinter import filedialog
    root = _init_tk()
    paths = filedialog.askopenfilenames(
        title="ZIPファイルを選択（複数選択可能）",
        filetypes=[("ZIP files", "*.zip"), ("All files", "*.*")],
        parent=root)
    root.destroy()
    return list(paths) if paths else None

def dialog_choose_from_list(title: str, prompt: str, items: List[str]) -> Optional[str]:
    """リスト選択ダイアログ"""
    import tkinter as tk
    root = _init_tk()
    root.deiconify()
    root.title(title)
    root.geometry("400x350")
    root.resizable(False, False)

    # 中央に配置
    root.update_idletasks()
    x = (root.winfo_screenwidth() // 2) - 200
    y = (root.winfo_screenheight() // 2) - 175
    root.geometry(f"+{x}+{y}")

    selected = [None]

    tk.Label(root, text=prompt, font=("Segoe UI", 11), wraplength=360,
             justify="left", pady=12).pack(fill="x", padx=16)

    listbox = tk.Listbox(root, font=("Segoe UI", 11), height=8,
                         selectmode="single", activestyle="none")
    for item in items:
        listbox.insert("end", item)
    listbox.select_set(0)
    listbox.pack(fill="both", expand=True, padx=16, pady=(0, 8))

    def on_ok():
        sel = listbox.curselection()
        if sel:
            selected[0] = items[sel[0]]
        root.destroy()

    def on_cancel():
        root.destroy()

    btn_frame = tk.Frame(root)
    btn_frame.pack(fill="x", padx=16, pady=(0, 12))
    tk.Button(btn_frame, text="キャンセル", width=12, command=on_cancel).pack(side="right", padx=4)
    tk.Button(btn_frame, text="OK", width=12, command=on_ok).pack(side="right", padx=4)

    root.mainloop()
    return selected[0]

def dialog_input(title: str, prompt: str, default: str = "") -> Optional[str]:
    """テキスト入力ダイアログ"""
    import tkinter as tk
    from tkinter import simpledialog
    root = _init_tk()
    result = simpledialog.askstring(title, prompt, initialvalue=default, parent=root)
    root.destroy()
    return result


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
# ║  AE バージョン検出 (Windows)                                   ║
# ╚═══════════════════════════════════════════════════════════════╝

class AEVersion:
    def __init__(self, path: str):
        self.path = path
        self.name = os.path.basename(path.rstrip(os.sep))
        match = re.search(r"(\d{4}|\(Beta\)|Beta)", self.name)
        self.version = match.group(1) if match else self.name

    def resolve_path(self, relative: str) -> str:
        """AEディレクトリ内の相対パスを絶対パスに解決"""
        return os.path.join(self.path, relative)

def detect_ae_versions() -> List[AEVersion]:
    versions = []
    for base in AE_BASE_PATHS_WIN:
        if not os.path.isdir(base):
            continue
        pattern = os.path.join(base, AE_PATTERN_WIN)
        for p in sorted(glob.glob(pattern)):
            if os.path.isdir(p):
                # Support Files があるか確認
                support = os.path.join(p, "Support Files")
                if os.path.isdir(support):
                    versions.append(AEVersion(p))
    return versions


# ╔═══════════════════════════════════════════════════════════════╗
# ║  README 解析 — 配置指示の抽出                                  ║
# ╚═══════════════════════════════════════════════════════════════╝

class InstallInstruction:
    """READMEから抽出した1つの配置指示"""
    def __init__(self, file_pattern: str, dest_relative: str, raw_line: str):
        self.file_pattern = file_pattern
        self.dest_relative = dest_relative
        self.raw_line = raw_line

    def __repr__(self):
        return f"{self.file_pattern} -> {self.dest_relative}"


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

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        instructions = _extract_instructions_from_line(stripped, line)
        analysis.instructions.extend(instructions)

    analysis.instructions.extend(_extract_section_based_instructions(lines))
    analysis.instructions.extend(_extract_bulk_instructions(lines))

    # 重複除去
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
    dest_relative = _find_ae_path_in_text(stripped)
    if not dest_relative:
        return instructions
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
        if stripped.startswith("#") or stripped.startswith("**"):
            dest = _find_ae_path_in_text(stripped)
            if dest:
                current_dest = dest
                current_heading = stripped
            else:
                current_dest = None
            continue

        if current_dest and stripped:
            list_match = re.match(r"^[-*•]\s+(.+)$|^\d+\.\s+(.+)$", stripped)
            if list_match:
                item = (list_match.group(1) or list_match.group(2)).strip()
                file_refs = _extract_file_references(item)
                for fp in file_refs:
                    instructions.append(InstallInstruction(fp, current_dest, current_heading))

    return instructions


def _extract_bulk_instructions(lines: List[str]) -> List[InstallInstruction]:
    """日本語一括指示 + テーブル/リスト形式を解析"""
    instructions = []
    pending_dest = None
    pending_source_line = ""
    in_table = False

    for line in lines:
        stripped = line.strip()

        if stripped.startswith("#"):
            pending_dest = None
            in_table = False
            continue

        # 日本語一括指示
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

        # 英語フレーズ
        en_match = re.search(
            r'(?:copy|place|put|install|move).*(?:to|in|into)\s+(.+)',
            stripped, re.IGNORECASE
        )
        if en_match and not pending_dest:
            dest = _find_ae_path_in_text(en_match.group(1))
            if dest:
                refs = _extract_file_references(stripped)
                if refs:
                    continue
                pending_dest = dest
                pending_source_line = stripped
                in_table = False
                continue

        if pending_dest and stripped:
            if "|" in stripped:
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

            list_match = re.match(r'^[-*•]\s+`?(.+?)`?\s*$', stripped)
            if list_match:
                name = list_match.group(1).strip()
                if name:
                    instructions.append(InstallInstruction(
                        name, pending_dest, pending_source_line))
                continue

            code_match = re.findall(r'`([^`]+)`', stripped)
            if code_match and in_table:
                for name in code_match:
                    instructions.append(InstallInstruction(
                        name, pending_dest, pending_source_line))
                continue

            if in_table and not stripped.startswith('|'):
                in_table = False

    return instructions


def _find_ae_path_in_text(text: str) -> Optional[str]:
    """テキスト内のAEディレクトリパスを検出"""
    lower = text.lower()

    # ベンダー付きplug-insパス
    m = re.search(r"plug-?ins?[/\\]([A-Za-z0-9][\w\s]*?)(?:[/\\]|$|\s)", text, re.IGNORECASE)
    if m:
        vendor = m.group(1).strip().rstrip("/\\")
        if vendor and len(vendor) < 40:
            return rf"Support Files\Plug-ins\{vendor}"

    # 既知のパスキーワードをチェック
    for keyword, relative in sorted(KNOWN_AE_PATHS.items(), key=lambda x: -len(x[0])):
        if keyword in lower:
            return relative

    return None


def _extract_file_references(text: str) -> List[str]:
    """テキストからファイル名・パターンを抽出"""
    patterns = []

    # 具体的ファイル名 (Windows: .aex も含む)
    # バッククォートで囲まれた場合を優先し、そうでなければスペースなしでマッチ
    for m in re.finditer(r"`([\w\-. ]+\.(?:aex|plugin|jsx|jsxbin|ffx|jsxinc))`", text, re.IGNORECASE):
        patterns.append(m.group(1).strip())
    for m in re.finditer(r"(?<![`\w])([\w\-.]+\.(?:aex|plugin|jsx|jsxbin|ffx|jsxinc))(?!`)", text, re.IGNORECASE):
        val = m.group(1).strip()
        if val not in patterns:
            patterns.append(val)

    # ワイルドカード
    for m in re.finditer(r"(\*\.(?:aex|plugin|jsx|jsxbin|ffx|jsxinc))", text, re.IGNORECASE):
        if m.group(1) not in patterns:
            patterns.append(m.group(1))

    # 汎用ファイル種類参照 (例: 「jsxbinファイル」→ *.jsxbin)
    _GENERIC_EXT_MAP = {
        "jsxbin": "*.jsxbin", "jsx": "*.jsx", "jsxinc": "*.jsxinc",
        "plugin": "*.plugin", "ffx": "*.ffx", "aex": "*.aex",
    }
    for ext_name, wildcard in _GENERIC_EXT_MAP.items():
        if wildcard in patterns:
            continue
        if re.search(r"(?:\.?" + re.escape(ext_name) + r")\s*(?:ファイル|file)", text, re.IGNORECASE):
            if wildcard not in patterns:
                patterns.append(wildcard)

    # コード記法内の名前
    for m in re.finditer(r"`([^`]+)`", text):
        name = m.group(1).strip()
        if name and name not in patterns:
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
    "presets", "scripts/", "scripts\\", "support files",
    "インストール", "コピー", "配置", "格納", "スクリプト",
    "プラグイン", "プリセット", "after effects",
]


def _is_likely_doc(file_path: str) -> bool:
    """ファイルの内容にAE関連のインストール指示キーワードが含まれるか判定"""
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            head = f.read(4096).lower()
        return any(kw in head for kw in _DOC_KEYWORDS)
    except Exception:
        return False


def find_all_docs(folder: str) -> List[str]:
    """フォルダ内の全ドキュメントファイル（.md, .txt, .pdf, .html）を収集"""
    docs = []
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
                    if ext in (".txt", ".html", ".htm"):
                        if _is_likely_doc(full):
                            docs.append(full)
                            found_names.add(entry.lower())
                    else:
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

    combined = ReadmeAnalysis()
    doc_names = []

    for doc_path in doc_paths:
        ext = os.path.splitext(doc_path)[1].lower()
        if ext == ".pdf":
            text = _extract_pdf_text(doc_path)
            if text:
                analysis = _parse_text(text)
            else:
                continue
        elif ext in (".html", ".htm"):
            text = _extract_html_text(doc_path)
            if text:
                analysis = _parse_text(text)
            else:
                continue
        else:
            analysis = parse_readme(doc_path)

        if analysis.product_name and not combined.product_name:
            combined.product_name = analysis.product_name
        if analysis.vendor_name and not combined.vendor_name:
            combined.vendor_name = analysis.vendor_name

        if analysis.instructions:
            combined.instructions.extend(analysis.instructions)
            doc_names.append(os.path.basename(doc_path))

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


def _parse_text(text: str) -> ReadmeAnalysis:
    """テキスト文字列を直接解析"""
    analysis = ReadmeAnalysis()
    analysis.raw_text = text

    m = re.search(r"^#\s+(.+?)$", text, re.MULTILINE)
    if m:
        analysis.product_name = re.sub(r"[#*_`\[\]]", "", m.group(1)).strip()

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

    lines = text.split("\n")
    for line in lines:
        stripped = line.strip()
        if stripped:
            analysis.instructions.extend(_extract_instructions_from_line(stripped, line))
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

    html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r'<!--.*?-->', '', html, flags=re.DOTALL)
    html = re.sub(r'<(?:br|p|div|li|tr|h[1-6])[^>]*/?>', '\n', html, flags=re.IGNORECASE)
    html = re.sub(r'<[^>]+>', '', html)
    try:
        import html as html_mod
        text = html_mod.unescape(html)
    except Exception:
        text = html
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip() if text.strip() else None


def _extract_pdf_text(pdf_path: str) -> Optional[str]:
    """PDFからテキスト抽出"""
    try:
        import PyPDF2
        with open(pdf_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text if text.strip() else None
    except (ImportError, Exception):
        pass
    try:
        import pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
            return text if text.strip() else None
    except (ImportError, Exception):
        pass
    return None


# ╔═══════════════════════════════════════════════════════════════╗
# ║  ファイルマッチング                                             ║
# ╚═══════════════════════════════════════════════════════════════╝

class FileAction:
    def __init__(self, path: str, name: str, ext: str):
        self.path = path
        self.name = name
        self.ext = ext
        self.is_dir = os.path.isdir(path)
        self.dest_dir = ""
        self.dest_label = ""
        self.instruction_source = ""
        self.status = "pending"
        self.skip_reason = ""
        info = EXT_INFO.get(ext, {})
        self.icon = info.get("icon", "[?]")
        self.label = info.get("label", os.path.splitext(name)[1])


def collect_files(folder: str, instructions: List[InstallInstruction] = None) -> List[str]:
    """フォルダ内のファイル・フォルダを収集"""
    results = []
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
                results.append(full)
            elif os.path.isdir(full):
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

        # .plugin は Windows では常にスキップ
        if ext == ".plugin":
            action.status = "skipped"
            action.skip_reason = "Mac用プラグイン (Windowsでは使用不可)"
            actions.append(action)
            continue

        matched = False
        for inst in instructions:
            if _file_matches_pattern(name, ext, inst.file_pattern):
                action.dest_dir = ae.resolve_path(inst.dest_relative)
                action.dest_label = inst.dest_relative + "\\"
                action.instruction_source = inst.raw_line
                action.status = "matched"
                matched = True
                break

        if not matched:
            action.status = "no_instruction"
            action.skip_reason = "ドキュメントに配置指示なし"

        actions.append(action)

    return actions


def _file_matches_pattern(filename: str, ext: str, pattern: str) -> bool:
    """ファイル名がパターンにマッチするか"""
    pattern_lower = pattern.lower().strip()
    filename_lower = filename.lower()

    if pattern_lower == filename_lower:
        return True
    if pattern_lower.startswith("*."):
        return filename_lower.endswith(pattern_lower[1:])
    if "." not in pattern_lower:
        return pattern_lower == filename_lower
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


def is_admin() -> bool:
    """管理者権限で実行中か"""
    try:
        return ctypes.windll.shell32.IsUserAnAdmin() != 0
    except Exception:
        return False


def run_as_admin():
    """管理者権限で再起動"""
    try:
        ctypes.windll.shell32.ShellExecuteW(
            None, "runas", sys.executable, " ".join(sys.argv), None, 1)
        sys.exit(0)
    except Exception:
        pass


def install_actions(actions: List[FileAction], dry_run: bool = False) -> List[InstallResult]:
    """マッチしたファイルのみインストール"""
    results = []
    needs_admin = False
    matched = [a for a in actions if a.status == "matched"]

    for a in actions:
        if a.status != "matched":
            if a.status == "skipped":
                results.append(InstallResult(a, False, f"[SKIP] {a.skip_reason}"))
            continue
        if dry_run:
            results.append(InstallResult(a, True,
                f"[DRY] {a.name} -> {a.dest_label}"))
            continue
        try:
            _do_copy(a)
            results.append(InstallResult(a, True, f"[OK] {a.name} -> {a.dest_label}"))
        except PermissionError:
            needs_admin = True
            break
        except Exception as e:
            results.append(InstallResult(a, False, f"[ERR] {a.name}: {e}"))

    if needs_admin:
        if dialog_yesno("管理者権限が必要",
                       "After Effects のフォルダへの書き込みに管理者権限が必要です。\n"
                       "管理者権限で再起動しますか？"):
            run_as_admin()
        else:
            results = []
            for a in matched:
                results.append(InstallResult(a, False, "[ERR] 管理者権限が必要です"))

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


# ╔═══════════════════════════════════════════════════════════════╗
# ║  GUI モード                                                    ║
# ╚═══════════════════════════════════════════════════════════════╝

def run_gui():
    ae_versions = detect_ae_versions()
    if not ae_versions:
        dialog_error("AE Installer Tool",
                     "After Effects が見つかりません。\n\n"
                     "以下のパスに After Effects がインストールされているか確認してください:\n"
                     r"C:\Program Files\Adobe\Adobe After Effects [バージョン]")
        return

    selected = dialog_choose_from_list(
        "AE Installer Tool v4 (Win)",
        "インストール先の After Effects を選択:",
        [v.name for v in ae_versions])
    if not selected:
        return
    target = next((v for v in ae_versions if v.name == selected), None)
    if not target:
        return

    choice = dialog_choose_from_list(
        "入力を選択",
        "何を読み込みますか？",
        ["フォルダを選択（複数可）", "ZIPファイルを選択（複数可）"])
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
        analysis = parse_all_docs(folder)

        if not analysis.has_instructions():
            dialog_info(f"[{i+1}/{len(input_paths)}] {pkg_name}",
                        "ドキュメントに配置指示が見つかりませんでした。\n"
                        "このパッケージはスキップします。")
            continue

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
            msg = f"{pkg_name}\n\n"
            msg += "ドキュメントの指示に一致するファイルがありませんでした。\n\n"
            if unmatched:
                msg += f"指示なしのファイル: {len(unmatched)} 個\n"
                for a in unmatched[:5]:
                    msg += f"  - {a.name}\n"
            dialog_info(f"[{i+1}/{len(input_paths)}] スキップ", msg)
            continue

        confirm_msg = f"{pkg_name}"
        if analysis.product_name:
            confirm_msg += f" ({analysis.product_name})"
        confirm_msg += f"\n-> {target.name}\n\n"
        confirm_msg += "【配置するファイル（指示あり）】\n"
        for a in matched:
            confirm_msg += f"  {a.icon} {a.name} -> {a.dest_label}\n"
        if unmatched:
            confirm_msg += f"\n【対象外（指示なし）】 {len(unmatched)} 個\n"
            for a in unmatched[:3]:
                confirm_msg += f"  - {a.name}\n"
        if skipped:
            confirm_msg += f"\n【スキップ】 {len(skipped)} 個\n"
            for a in skipped:
                confirm_msg += f"  [!] {a.name} ({a.skip_reason})\n"

        if not dialog_yesno(f"インストール確認 [{i+1}/{len(input_paths)}]", confirm_msg):
            continue

        results = install_actions(actions)
        ok = sum(1 for r in results if r.success)
        fail = sum(1 for r in results if not r.success and "SKIP" not in r.message)
        total_ok += ok
        total_fail += fail
        summaries.append(f"{'OK' if fail==0 else '!!'} {pkg_name}: {ok}成功")

    if summaries:
        msg = f"合計: {total_ok} 成功 / {total_fail} 失敗\n\n"
        msg += "\n".join(summaries)
        if total_fail == 0:
            msg += "\n\nAfter Effects を再起動してください！"
            dialog_info("完了", msg)
        else:
            dialog_error("結果", msg)
    else:
        dialog_info("完了", "処理するパッケージがありませんでした。")

    cleanup_temp()


# ╔═══════════════════════════════════════════════════════════════╗
# ║  CLI モード                                                    ║
# ╚═══════════════════════════════════════════════════════════════╝

def run_cli(args):
    versions = detect_ae_versions()
    if not versions:
        print("[ERR] After Effects が見つかりません"); sys.exit(1)

    target = None
    if args.version:
        target = next((v for v in versions
                       if args.version in v.name or args.version == v.version), None)
        if not target:
            print(f"[ERR] バージョン '{args.version}' 不明"); sys.exit(1)
    else:
        target = versions[-1]

    print(f"[TARGET] {target.name}")
    print(f"[PKGS]   {len(args.folders)} 個\n")

    total_ok = total_fail = 0

    for i, path in enumerate(args.folders):
        folder = resolve_input(path)
        if not folder:
            print(f"[ERR] 読み込めません: {path}"); continue

        pkg_name = os.path.basename(path)
        is_zip = path.lower().endswith(".zip")
        print("=" * 50)
        print(f"  [{i+1}/{len(args.folders)}] {'[ZIP]' if is_zip else '[DIR]'}: {pkg_name}")

        analysis = parse_all_docs(folder)

        if analysis.raw_text:
            print(f"  [DOC] {analysis.raw_text}")
        else:
            print("  [DOC] ドキュメントなし")
        if analysis.product_name:
            print(f"  [NAME] {analysis.product_name}")
        if analysis.vendor_name:
            print(f"  [VENDOR] {analysis.vendor_name}")

        if not analysis.has_instructions():
            print("  [SKIP] 配置指示なし\n"); continue

        print(f"  [INSTR] 配置指示:")
        for inst in analysis.instructions:
            print(f"    - {inst.file_pattern} -> {inst.dest_relative}\\")

        file_paths = collect_files(folder, analysis.instructions)
        print(f"  [FILES] {len(file_paths)} 個")

        actions = match_files_to_instructions(file_paths, analysis.instructions, target)
        matched = [a for a in actions if a.status == "matched"]
        unmatched = [a for a in actions if a.status == "no_instruction"]
        skipped = [a for a in actions if a.status == "skipped"]

        if matched:
            print(f"\n  [MATCH] ({len(matched)}個):")
            for a in matched:
                print(f"    {a.icon} {a.name} -> {a.dest_label}")
                print(f"       根拠: {a.instruction_source}")
        if unmatched:
            print(f"\n  [NONE] 指示なし ({len(unmatched)}個):")
            for a in unmatched:
                print(f"    - {a.name}")
        if skipped:
            print(f"\n  [SKIP] ({len(skipped)}個):")
            for a in skipped:
                print(f"    [!] {a.name} ({a.skip_reason})")

        if not matched:
            print("  -> マッチなし\n"); continue

        results = install_actions(actions, dry_run=args.dry_run)
        print(f"\n  {'─'*40}")
        for r in results:
            print(f"    {r.message}")

        ok = sum(1 for r in results if r.success)
        fail = sum(1 for r in results if not r.success and "SKIP" not in r.message)
        total_ok += ok
        total_fail += fail
        print(f"  [RESULT] {ok} OK / {fail} FAIL\n")

    print("=" * 50)
    print(f"[TOTAL] {total_ok} OK / {total_fail} FAIL")
    if not args.dry_run and total_fail == 0 and total_ok > 0:
        print("[DONE] After Effects を再起動してください。")
    cleanup_temp()


# ╔═══════════════════════════════════════════════════════════════╗
# ║  エントリーポイント                                             ║
# ╚═══════════════════════════════════════════════════════════════╝

def main():
    parser = argparse.ArgumentParser(description="AE Installer Tool (Windows) - README指示ベース")
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
