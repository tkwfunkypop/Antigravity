# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['/Users/takahashikenta/projects/remotion-video/AE-Installer-Tool/ae_installer.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='AE Installer Tool',
    debug=False,
    bootloader_ignore_signals=False,
    strip=True,
    upx=False,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=True,
    upx=False,
    upx_exclude=[],
    name='AE Installer Tool',
)
app = BUNDLE(
    coll,
    name='AE Installer Tool.app',
    icon=None,
    bundle_identifier='com.takahashi-teikoku.ae-installer',
)
