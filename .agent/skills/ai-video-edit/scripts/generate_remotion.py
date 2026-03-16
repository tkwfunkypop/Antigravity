#!/usr/bin/env python3
"""
Remotionコンポーネント自動生成スクリプト

使い方:
  ./venv/bin/python3 scripts/generate_remotion.py \
    --transcript output/transcript.json \
    --video input/jetcut_video.mp4 \
    --remotion-dir remotion-project

処理内容:
  1. 動画のメタデータ（解像度・FPS）を取得
  2. テロップデータからRemotionコンポーネントを生成
  3. Root.tsx, MainVideo.tsx, Subtitle.tsx を出力
"""
import sys
import os
import json
import subprocess
import argparse


def get_video_info(video_path):
    """ffprobeで動画情報を取得"""
    cmd = [
        "ffprobe", "-v", "quiet",
        "-print_format", "json",
        "-show_streams", "-show_format",
        video_path
    ]
    result = subprocess.run(cmd, check=True, capture_output=True, text=True)
    info = json.loads(result.stdout)

    video_stream = None
    for stream in info['streams']:
        if stream['codec_type'] == 'video':
            video_stream = stream
            break

    if not video_stream:
        raise ValueError("動画ストリームが見つかりません")

    # FPS計算
    fps_parts = video_stream.get('r_frame_rate', '30/1').split('/')
    fps = int(round(int(fps_parts[0]) / int(fps_parts[1])))

    width = int(video_stream['width'])
    height = int(video_stream['height'])
    duration = float(info['format']['duration'])

    return {
        'width': width,
        'height': height,
        'fps': fps,
        'duration': duration,
        'durationInFrames': int(duration * fps),
    }


def generate_subtitle_tsx():
    """Subtitle.tsx を生成"""
    return '''import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { loadFont } from '@remotion/google-fonts/NotoSansJP';

const { fontFamily } = loadFont();

interface SubtitleProps {
  text: string;
  startFrame: number;
  endFrame: number;
}

export const Subtitle: React.FC<SubtitleProps> = ({ text, startFrame, endFrame }) => {
  const frame = useCurrentFrame();

  if (frame < startFrame || frame > endFrame) return null;

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 5, endFrame - 5, endFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const lines = text.split('\\n');

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '10%',
        width: '100%',
        textAlign: 'center',
        opacity,
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{ marginBottom: 4 }}>
          <span
            style={{
              fontFamily,
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
              padding: '4px 12px',
              lineHeight: 1.4,
            }}
          >
            {line}
          </span>
        </div>
      ))}
    </div>
  );
};
'''


def generate_main_video_tsx(subtitles, video_filename):
    """MainVideo.tsx を生成"""
    subtitle_entries = []
    for sub in subtitles:
        text_escaped = sub['text'].replace("'", "\\'").replace("\n", "\\n")
        subtitle_entries.append(
            f"  {{ text: '{text_escaped}', startFrame: {sub['startFrame']}, endFrame: {sub['endFrame']} }}"
        )
    subtitles_array = ",\n".join(subtitle_entries)

    return f'''import React from 'react';
import {{ Video, staticFile }} from 'remotion';
import {{ Subtitle }} from './Subtitle';

const subtitles = [
{subtitles_array}
];

export const MainVideo: React.FC = () => {{
  return (
    <div style={{ flex: 1, backgroundColor: 'black', position: 'relative' }}>
      <Video src={{staticFile('{video_filename}')}} />
      {{subtitles.map((sub, i) => (
        <Subtitle key={{i}} {{...sub}} />
      ))}}
    </div>
  );
}};
'''


def generate_root_tsx(video_info):
    """Root.tsx を生成"""
    return f'''import {{ Composition }} from 'remotion';
import {{ MainVideo }} from './MainVideo';

export const RemotionRoot: React.FC = () => {{
  return (
    <>
      <Composition
        id="MainVideo"
        component={{MainVideo}}
        durationInFrames={{{video_info['durationInFrames']}}}
        fps={{{video_info['fps']}}}
        width={{{video_info['width']}}}
        height={{{video_info['height']}}}
      />
    </>
  );
}};
'''


def main():
    parser = argparse.ArgumentParser(description='Remotionコンポーネント生成')
    parser.add_argument('--transcript', required=True, help='テロップJSONファイル')
    parser.add_argument('--video', required=True, help='ジェットカット済み動画')
    parser.add_argument('--remotion-dir', required=True, help='Remotionプロジェクトディレクトリ')
    args = parser.parse_args()

    # テロップデータ読み込み
    with open(args.transcript, 'r', encoding='utf-8') as f:
        transcript_data = json.load(f)
    subtitles = transcript_data['subtitles']

    # 動画情報取得
    video_info = get_video_info(args.video)
    print(f"📐 動画情報: {video_info['width']}x{video_info['height']} @ {video_info['fps']}fps, {video_info['duration']:.1f}秒")

    # 動画ファイルをRemotionのpublicにコピー
    video_filename = os.path.basename(args.video)
    public_dir = os.path.join(args.remotion_dir, 'public')
    os.makedirs(public_dir, exist_ok=True)
    dest_video = os.path.join(public_dir, video_filename)
    if not os.path.exists(dest_video):
        subprocess.run(['cp', args.video, dest_video], check=True)
        print(f"✅ 動画コピー: {dest_video}")

    # コンポーネント生成
    src_dir = os.path.join(args.remotion_dir, 'src')
    os.makedirs(src_dir, exist_ok=True)

    # Subtitle.tsx
    subtitle_path = os.path.join(src_dir, 'Subtitle.tsx')
    with open(subtitle_path, 'w') as f:
        f.write(generate_subtitle_tsx())
    print(f"✅ 生成: {subtitle_path}")

    # MainVideo.tsx
    main_video_path = os.path.join(src_dir, 'MainVideo.tsx')
    with open(main_video_path, 'w') as f:
        f.write(generate_main_video_tsx(subtitles, video_filename))
    print(f"✅ 生成: {main_video_path}")

    # Root.tsx
    root_path = os.path.join(src_dir, 'Root.tsx')
    with open(root_path, 'w') as f:
        f.write(generate_root_tsx(video_info))
    print(f"✅ 生成: {root_path}")

    print(f"\n🎬 Remotionコンポーネント生成完了！")
    print(f"   テロップ数: {len(subtitles)}")
    print(f"   レンダリング: cd {args.remotion_dir} && npx remotion render MainVideo --output output.mp4")


if __name__ == "__main__":
    main()
