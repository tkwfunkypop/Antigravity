---
name: ai-video-edit
description: AI自動動画編集スキル。動画ファイルを指定するだけで、Whisper（文字起こし）、Silero VAD（無音カット/ジェットカット）、BudouX（日本語テロップ分割）、Remotion（動画生成）を連携させ、カット編集・テロップ付き動画を全自動で生成する。
license: MIT
compatibility: macOS, Homebrew, Python 3, Node.js v18+, ffmpeg
metadata:
  author: takahashikenta
  version: "1.0"
  reference: "https://x.com/mercarioji/status/2033146277522022640"
---

# AI 自動動画編集スキル

動画ファイルを1つ指定するだけで、**無音カット（ジェットカット）→ 文字起こし → テロップ挿入 → レンダリング**までを全自動で行うスキルです。

> **前提:** macOS環境、Homebrew/Python 3/Node.js v18+/ffmpegが利用可能であること。

## 概要

このワークフローは以下の4つのツールを連携させます：

| ツール | 役割 |
|--------|------|
| **Whisper** (OpenAI) | 音声認識AI。動画内の音声をタイムスタンプ付きで文字起こし |
| **Silero VAD** | 音声区間検出AI。無音・息継ぎを検出しジェットカット |
| **BudouX** (Google) | 日本語テロップを文節境界で適切に分割（1行最大18文字/最大2行） |
| **Remotion** | Reactベースの動画編集。テロップの配置・アニメーション・動画結合 |

---

## STEP 1: 環境構築

ユーザーが「動画編集の環境を構築して」と依頼した場合、以下を**全自動で実行**してください。

### 必須パッケージのインストール

```bash
# 1. システムツールの確認とインストール
brew install python3 ffmpeg node

# 2. Python仮想環境の作成
python3 -m venv venv

# 3. Pythonパッケージのインストール
./venv/bin/pip install openai-whisper torch torchaudio silero-vad budoux

# 4. Whisperモデルの事前ダウンロード（large-v3推奨、メモリ不足時はmedium）
./venv/bin/python3 -c "import whisper; whisper.load_model('large-v3')"
```

### Remotionプロジェクトのセットアップ

```bash
# 5. Remotionプロジェクト作成
npx create-video@latest --project-name remotion-project --template blank --package-manager npm

# 6. 追加パッケージ
cd remotion-project
npm install budoux @remotion/google-fonts

# 7. Remotionアップグレード
npx remotion upgrade
```

### 入力用フォルダの準備

```bash
mkdir -p input
# ユーザーの動画ファイルを input/ に配置する
```

---

## STEP 2: 動画編集の実行

ユーザーが「この動画を編集して」と動画ファイルを指定した場合、以下のワークフローを**全自動で順次実行**してください。

### ワークフロー

#### 2-1. 入力動画の解析

```bash
# ffprobeで解像度・FPS・コーデックを確認
ffprobe -v quiet -print_format json -show_streams "input/動画ファイル名"
```

- 必要に応じてH.264/8bit/30fpsに自動変換
- 解像度とFPSをRemotionのコンポジション設定に反映

#### 2-2. 音声抽出

```bash
ffmpeg -i "input/動画ファイル名" -vn -acodec pcm_s16le -ar 16000 -ac 1 temp_audio.wav
```

#### 2-3. 無音カット（ジェットカット）

Silero VADで音声区間を検出し、無音部分をカットします。

```python
#!/usr/bin/env python3
"""Silero VADによるジェットカット処理"""
import torch
import torchaudio

# VADモデルのロード
model, utils = torch.hub.load(
    repo_or_dir='snakers4/silero-vad',
    model='silero_vad',
    force_reload=False
)
(get_speech_timestamps, _, read_audio, _, _) = utils

# 音声読み込みと区間検出
wav = read_audio('temp_audio.wav', sampling_rate=16000)
speech_timestamps = get_speech_timestamps(wav, model, sampling_rate=16000)

# タイムスタンプをffmpeg用に変換してカット
# speech_timestamps = [{'start': サンプル数, 'end': サンプル数}, ...]
```

- 検出された音声区間のみを結合して無音をカット
- ffmpegのconcat filterを使用

#### 2-4. 文字起こし（Whisper）

```python
#!/usr/bin/env python3
"""Whisperによるタイムスタンプ付き文字起こし"""
import whisper

model = whisper.load_model("large-v3")  # メモリ不足時は "medium"
result = model.transcribe(
    "jetcut_audio.wav",
    language="ja",
    word_timestamps=True
)

# result['segments'] にタイムスタンプ付きテキストが入る
# [{'start': 0.0, 'end': 2.5, 'text': 'こんにちは'}, ...]
```

#### 2-5. テロップ分割（BudouX）

```python
#!/usr/bin/env python3
"""BudouXによる日本語テロップの適切な分割"""
import budoux

parser = budoux.load_default_japanese_parser()

MAX_CHARS_PER_LINE = 18
MAX_LINES = 2

def split_subtitle(text):
    """テロップテキストを文節境界で適切に分割"""
    chunks = parser.parse(text)
    lines = []
    current_line = ""
    for chunk in chunks:
        if len(current_line + chunk) > MAX_CHARS_PER_LINE:
            if current_line:
                lines.append(current_line)
            current_line = chunk
        else:
            current_line += chunk
    if current_line:
        lines.append(current_line)
    return lines[:MAX_LINES]
```

#### 2-6. Remotionコンポーネント生成

以下の3ファイルを動的に生成します：

**Root.tsx** - メインコンポジション定義

```tsx
import { Composition } from 'remotion';
import { MainVideo } from './MainVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MainVideo"
      component={MainVideo}
      durationInFrames={/* 動画の長さから自動計算 */}
      fps={30}
      width={/* 入力動画の幅 */}
      height={/* 入力動画の高さ */}
    />
  );
};
```

**Subtitle.tsx** - テロップコンポーネント

```tsx
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface SubtitleProps {
  text: string;
  startFrame: number;
  endFrame: number;
}

export const Subtitle: React.FC<SubtitleProps> = ({ text, startFrame, endFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame || frame > endFrame) return null;

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 5, endFrame - 5, endFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div style={{
      position: 'absolute',
      bottom: '10%',
      width: '100%',
      textAlign: 'center',
      opacity,
    }}>
      <span style={{
        fontFamily: '"Noto Sans JP", sans-serif',
        fontSize: 48,
        fontWeight: 'bold',
        color: 'white',
        textShadow: `
          -3px -3px 0 #6B21A8,
          3px -3px 0 #6B21A8,
          -3px 3px 0 #6B21A8,
          3px 3px 0 #6B21A8,
          0 0 10px rgba(107, 33, 168, 0.5)
        `,
        padding: '8px 16px',
      }}>
        {text}
      </span>
    </div>
  );
};
```

**MainVideo.tsx** - メイン動画コンポーネント

```tsx
import React from 'react';
import { Video, staticFile } from 'remotion';
import { Subtitle } from './Subtitle';

// 文字起こし結果から自動生成
const subtitles = [
  // { text: "テロップテキスト", startFrame: 0, endFrame: 75 },
];

export const MainVideo: React.FC = () => {
  return (
    <div style={{ flex: 1, backgroundColor: 'black' }}>
      <Video src={staticFile('jetcut_video.mp4')} />
      {subtitles.map((sub, i) => (
        <Subtitle key={i} {...sub} />
      ))}
    </div>
  );
};
```

#### 2-7. レンダリング

```bash
# ジェットカット済み動画をRemotionのpublicフォルダにコピー
cp jetcut_video.mp4 remotion-project/public/

# レンダリング実行
cd remotion-project
npx remotion render MainVideo --output ../output/完成動画.mp4
```

---

## STEP 3: 高度な編集オプション（オプション）

ユーザーが追加機能を求めた場合、以下を対応可能です：

| 機能 | 説明 |
|------|------|
| **BGM追加** | フリーBGMを指定し、Remotionの`<Audio>`コンポーネントで合成 |
| **効果音（SE）** | シーン転換やテロップ出現時にSEを挿入 |
| **Bロール** | キーワードに応じたイメージ映像を挿入 |
| **タイトルカード** | 冒頭にタイトルアニメーションを追加 |
| **チャプター** | セクション分けとチャプターアニメーション |

---

## テロップデザインのカスタマイズ

デフォルトのテロップスタイル：
- **フォント:** Noto Sans JP (Bold)
- **サイズ:** 48px
- **色:** 白
- **縁取り:** 紫色 (#6B21A8) の太い縁取り（textShadow）
- **位置:** 画面下部 10%
- **アニメーション:** フェードイン/フェードアウト（5フレーム）

ユーザーの要望に応じてスタイルを変更可能。

---

## トラブルシューティング

| 問題 | 解決策 |
|------|--------|
| Whisperでメモリ不足 | `large-v3` → `medium` に変更 |
| ffmpegエラー | `brew reinstall ffmpeg` |
| Remotionレンダリングが遅い | `--concurrency 4` オプション追加 |
| テロップが文字化け | フォントのロードを確認、`@remotion/google-fonts` 使用 |
| 動画コーデック非対応 | H.264/8bit/30fpsに事前変換 |

---

## ファイル構造

```
project-root/
├── input/                    # 入力動画を配置
│   └── ai_video_edit.mov
├── output/                   # 完成動画の出力先
├── venv/                     # Python仮想環境
├── temp_audio.wav            # 一時ファイル（音声抽出）
├── jetcut_video.mp4          # ジェットカット済み動画
├── jetcut_audio.wav          # ジェットカット済み音声
├── remotion-project/         # Remotionプロジェクト
│   ├── src/
│   │   ├── Root.tsx
│   │   ├── MainVideo.tsx
│   │   └── Subtitle.tsx
│   └── public/
│       └── jetcut_video.mp4  # Remotionが参照する動画
└── scripts/                  # 処理スクリプト群
    ├── extract_audio.sh
    ├── jetcut.py
    ├── transcribe.py
    └── split_subtitles.py
```

## 参考情報

- 元記事: [メルおじ @mercarioji のX投稿](https://x.com/mercarioji/status/2033146277522022640)
- [Whisper (OpenAI)](https://github.com/openai/whisper)
- [Silero VAD](https://github.com/snakers4/silero-vad)
- [BudouX](https://github.com/google/budoux)
- [Remotion](https://www.remotion.dev/)
