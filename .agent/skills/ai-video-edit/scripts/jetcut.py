#!/usr/bin/env python3
"""
Silero VADを使ったジェットカット（無音カット）処理スクリプト

使い方:
  ./venv/bin/python3 scripts/jetcut.py input/video.mov output/jetcut_video.mp4

処理内容:
  1. 入力動画から音声を抽出
  2. Silero VADで音声区間を検出
  3. 無音部分をカットして動画を再構成
"""
import sys
import os
import json
import subprocess
import torch
import torchaudio

# パラメータ
SAMPLING_RATE = 16000
MIN_SPEECH_DURATION_MS = 250  # 最小音声区間 (ms)
MIN_SILENCE_DURATION_MS = 100  # 最小無音区間 (ms)
SPEECH_PAD_MS = 50  # 音声区間の前後パディング (ms)


def extract_audio(video_path, audio_path):
    """動画から音声を抽出"""
    cmd = [
        "ffmpeg", "-y", "-i", video_path,
        "-vn", "-acodec", "pcm_s16le",
        "-ar", str(SAMPLING_RATE), "-ac", "1",
        audio_path
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    print(f"✅ 音声抽出完了: {audio_path}")


def detect_speech(audio_path):
    """Silero VADで音声区間を検出"""
    model, utils = torch.hub.load(
        repo_or_dir='snakers4/silero-vad',
        model='silero_vad',
        force_reload=False
    )
    (get_speech_timestamps, _, read_audio, _, _) = utils

    wav = read_audio(audio_path, sampling_rate=SAMPLING_RATE)
    speech_timestamps = get_speech_timestamps(
        wav, model,
        sampling_rate=SAMPLING_RATE,
        min_speech_duration_ms=MIN_SPEECH_DURATION_MS,
        min_silence_duration_ms=MIN_SILENCE_DURATION_MS,
        speech_pad_ms=SPEECH_PAD_MS,
    )

    # サンプル数を秒数に変換
    segments = []
    for ts in speech_timestamps:
        start = ts['start'] / SAMPLING_RATE
        end = ts['end'] / SAMPLING_RATE
        segments.append({'start': round(start, 3), 'end': round(end, 3)})

    print(f"✅ 音声区間検出完了: {len(segments)} 区間")
    return segments


def jetcut_video(video_path, segments, output_path):
    """検出された音声区間のみを結合して動画を再構成"""
    if not segments:
        print("⚠️ 音声区間が検出されませんでした")
        return

    # 一時ファイルリスト
    temp_dir = "/tmp/jetcut_segments"
    os.makedirs(temp_dir, exist_ok=True)

    segment_files = []
    for i, seg in enumerate(segments):
        temp_file = os.path.join(temp_dir, f"segment_{i:04d}.mp4")
        cmd = [
            "ffmpeg", "-y",
            "-i", video_path,
            "-ss", str(seg['start']),
            "-to", str(seg['end']),
            "-c:v", "libx264", "-preset", "fast",
            "-c:a", "aac",
            temp_file
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        segment_files.append(temp_file)

    # concat用ファイルリスト作成
    concat_file = os.path.join(temp_dir, "concat_list.txt")
    with open(concat_file, "w") as f:
        for sf in segment_files:
            f.write(f"file '{sf}'\n")

    # 結合
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_file,
        "-c", "copy",
        output_path
    ]
    subprocess.run(cmd, check=True, capture_output=True)

    # 一時ファイルの削除
    for sf in segment_files:
        os.remove(sf)
    os.remove(concat_file)
    os.rmdir(temp_dir)

    # 結果の報告
    original_duration = get_duration(video_path)
    new_duration = get_duration(output_path)
    cut_ratio = (1 - new_duration / original_duration) * 100 if original_duration > 0 else 0

    print(f"✅ ジェットカット完了: {output_path}")
    print(f"   元の長さ: {original_duration:.1f}秒 → カット後: {new_duration:.1f}秒 ({cut_ratio:.1f}%カット)")


def get_duration(file_path):
    """動画/音声ファイルの長さを取得"""
    cmd = [
        "ffprobe", "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        file_path
    ]
    result = subprocess.run(cmd, check=True, capture_output=True, text=True)
    info = json.loads(result.stdout)
    return float(info['format']['duration'])


def main():
    if len(sys.argv) < 3:
        print("使い方: python3 jetcut.py <入力動画> <出力動画>")
        sys.exit(1)

    input_video = sys.argv[1]
    output_video = sys.argv[2]

    if not os.path.exists(input_video):
        print(f"❌ 入力ファイルが見つかりません: {input_video}")
        sys.exit(1)

    # 出力ディレクトリ作成
    os.makedirs(os.path.dirname(output_video) or ".", exist_ok=True)

    # 1. 音声抽出
    temp_audio = "/tmp/jetcut_temp_audio.wav"
    extract_audio(input_video, temp_audio)

    # 2. 音声区間検出
    segments = detect_speech(temp_audio)

    # 3. ジェットカット
    jetcut_video(input_video, segments, output_video)

    # 一時音声ファイル削除
    if os.path.exists(temp_audio):
        os.remove(temp_audio)

    # セグメント情報をJSONで保存
    segments_json = output_video.replace('.mp4', '_segments.json')
    with open(segments_json, 'w') as f:
        json.dump(segments, f, indent=2)
    print(f"✅ セグメント情報保存: {segments_json}")


if __name__ == "__main__":
    main()
