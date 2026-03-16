#!/usr/bin/env python3
"""
Whisperによるタイムスタンプ付き文字起こしスクリプト

使い方:
  ./venv/bin/python3 scripts/transcribe.py input/audio.wav output/transcript.json

処理内容:
  1. Whisper large-v3 で音声を文字起こし
  2. セグメント単位でタイムスタンプ付きJSONを出力
  3. BudouXでテロップ用に日本語を適切に分割
"""
import sys
import os
import json
import whisper
import budoux

# テロップ設定
MAX_CHARS_PER_LINE = 18
MAX_LINES = 2
WHISPER_MODEL = "large-v3"  # メモリ不足時は "medium" に変更


def transcribe_audio(audio_path, language="ja"):
    """Whisperで文字起こし"""
    print(f"🎙️ Whisper ({WHISPER_MODEL}) で文字起こし開始...")
    model = whisper.load_model(WHISPER_MODEL)
    result = model.transcribe(
        audio_path,
        language=language,
        word_timestamps=True,
        verbose=False
    )
    print(f"✅ 文字起こし完了: {len(result['segments'])} セグメント")
    return result


def split_subtitle_text(text):
    """BudouXで日本語テロップを適切に分割"""
    parser = budoux.load_default_japanese_parser()
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

    return "\n".join(lines[:MAX_LINES])


def process_segments(segments, fps=30):
    """セグメントをRemotionのフレーム数に変換"""
    subtitles = []
    for seg in segments:
        text = seg['text'].strip()
        if not text:
            continue

        split_text = split_subtitle_text(text)
        start_frame = int(seg['start'] * fps)
        end_frame = int(seg['end'] * fps)

        subtitles.append({
            'text': split_text,
            'original_text': text,
            'startFrame': start_frame,
            'endFrame': end_frame,
            'startTime': round(seg['start'], 3),
            'endTime': round(seg['end'], 3),
        })

    return subtitles


def main():
    if len(sys.argv) < 3:
        print("使い方: python3 transcribe.py <入力音声> <出力JSON>")
        sys.exit(1)

    input_audio = sys.argv[1]
    output_json = sys.argv[2]

    if not os.path.exists(input_audio):
        print(f"❌ 入力ファイルが見つかりません: {input_audio}")
        sys.exit(1)

    os.makedirs(os.path.dirname(output_json) or ".", exist_ok=True)

    # 1. 文字起こし
    result = transcribe_audio(input_audio)

    # 2. テロップ分割 & フレーム変換
    subtitles = process_segments(result['segments'])

    # 3. JSON出力
    output_data = {
        'language': result.get('language', 'ja'),
        'full_text': result['text'],
        'subtitles': subtitles,
    }

    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"✅ テロップデータ保存: {output_json}")
    print(f"   テロップ数: {len(subtitles)}")


if __name__ == "__main__":
    main()
