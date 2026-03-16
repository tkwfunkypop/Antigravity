#!/bin/bash
# エフェクト10選 ナレーション一括生成スクリプト
# ElevenLabs TTS API を使用

set -e

VOICE_ID="JBFqnCBsd6RMkjVDRZzb"  # George
MODEL_ID="eleven_multilingual_v2"
OUTPUT_DIR="/Users/takahashikenta/projects/remotion-video/public/audio/narration"

# API キー確認
if [ -z "$ELEVENLABS_API_KEY" ]; then
  echo "Error: ELEVENLABS_API_KEY not set"
  exit 1
fi

generate_tts() {
  local filename="$1"
  local text="$2"
  local output_path="${OUTPUT_DIR}/${filename}"
  
  echo "Generating: ${filename}..."
  
  curl -s -X POST "https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}" \
    -H "xi-api-key: ${ELEVENLABS_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{
      \"text\": \"${text}\",
      \"model_id\": \"${MODEL_ID}\",
      \"language_code\": \"ja\"
    }" \
    --output "${output_path}"
  
  # ファイルサイズ確認
  local size=$(wc -c < "${output_path}" | tr -d ' ')
  echo "  -> ${output_path} (${size} bytes)"
}

echo "=== エフェクト10選 ナレーション生成開始 ==="

generate_tts "effects_01_opening.mp3" \
  "モーショングラフィックで差をつける、おすすめエフェクト10選をご紹介します。After Effectsに標準搭載されているエフェクトを中心に、プロの現場で実際に使われているものを厳選しました。"

generate_tts "effects_02_particle.mp3" \
  "まずはCC Particle World。炎、雪、星空など、パーティクル表現の定番エフェクトです。パラメータを変えるだけで、全く異なる演出が作れます。"

generate_tts "effects_03_glow.mp3" \
  "次はGlow、グローです。テキストやロゴに光の拡散を加えて、華やかさをプラスします。シンプルですが、これだけで映像のクオリティがグッと上がります。"

generate_tts "effects_04_fractal.mp3" \
  "Fractal Noise、フラクタルノイズ。煙、雲、水面のテクスチャなど、万能な背景素材を生成できます。エボリューションをアニメーションさせると、動きのある映像になります。"

generate_tts "effects_05_flares.mp3" \
  "Optical Flares。レンズフレアを追加して、シネマティックな映像に仕上げます。光源の動きに合わせて使うと、非常にリアルな表現が可能です。"

generate_tts "effects_06_turbulent.mp3" \
  "Turbulent Displace、タービュレントディスプレイス。映像やテキストを歪ませて、グリッチや流体のようなアニメーションを作れます。"

generate_tts "effects_07_glass.mp3" \
  "CC Glass。レイヤーにガラスや水面のような立体的な質感を与えるエフェクトです。テキストと組み合わせると、高級感のある表現になります。"

generate_tts "effects_08_stroke.mp3" \
  "Stroke、線エフェクト。マスクパスに沿って線を描画し、ライトトレイルのようなアニメーションが作れます。ロゴの出現演出にも最適です。"

generate_tts "effects_09_gradient.mp3" \
  "Gradient Ramp、グラデーションランプ。美しいグラデーション背景を簡単に作成できます。他のエフェクトのマップとしても活用できる万能ツールです。"

generate_tts "effects_10_echo.mp3" \
  "Echo、エコーエフェクト。フレームの残像を残すことで、スピード感のあるモーションブラー演出が可能です。ダンスやスポーツの映像に効果的です。"

generate_tts "effects_11_lens_blur.mp3" \
  "最後はCamera Lens Blur。被写界深度を操作して、映画のようなボケ味を表現します。背景をぼかすだけで、被写体が際立つプロフェッショナルな仕上がりになります。"

generate_tts "effects_12_ending.mp3" \
  "以上、モーショングラフィックにおすすめのエフェクト10選でした。ぜひ皆さんの制作にも取り入れてみてください。チャンネル登録もよろしくお願いします。"

echo ""
echo "=== 全12ファイル生成完了 ==="
ls -la "${OUTPUT_DIR}"/effects_*.mp3
