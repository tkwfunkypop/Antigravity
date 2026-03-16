# 🎨 カラー・グラデーション

rgbToHsl, hslToRgb, hexToRgb, カラーシフト等のカラー関連エクスプレッション集。

---

## カラーの基礎

### AE のカラー表現

```
AEカラー: [R, G, B, A] の配列（各値 0〜1）

[1, 0, 0, 1] = 赤 (255,0,0)
[0, 1, 0, 1] = 緑 (0,255,0)
[0, 0, 1, 1] = 青 (0,0,255)
[1, 1, 1, 1] = 白
[0, 0, 0, 1] = 黒
[1, 0.5, 0, 1] = オレンジ (255,128,0)
```

---

## カラー変換関数

### 📌 rgbToHsl / hslToRgb
**用途**: RGB と HSL の相互変換
**適用先**: Color
**難易度**: ⭐⭐

```javascript
// RGB → HSL
const hsl = rgbToHsl([1, 0, 0, 1]);
// → [0, 1, 0.5, 1] (色相0°=赤, 彩度100%, 明度50%)

// HSL → RGB
const rgb = hslToRgb([0.5, 1, 0.5, 1]);
// → [0, 1, 1, 1] (シアン)
```

**HSL の値:**
| 成分 | 範囲 | 説明 |
|------|------|------|
| H (色相) | 0〜1 | 0=赤, 0.33=緑, 0.66=青, 1=赤 |
| S (彩度) | 0〜1 | 0=灰色, 1=鮮やか |
| L (明度) | 0〜1 | 0=黒, 0.5=標準, 1=白 |
| A (透明度) | 0〜1 | 0=透明, 1=不透明 |

```
H(色相) 0──0.17──0.33──0.5──0.66──0.83──1.0
        赤   黄    緑   シアン  青    紫   赤
        🔴   🟡   🟢    🔵    🔵    🟣   🔴
```

---

### 📌 hexToRgb（HEX カラーコードを変換）
**用途**: Web で使うHEXカラーコードをAEカラーに変換
**適用先**: Color
**難易度**: ⭐⭐

```javascript
// AE 組み込み関数
hexToRgb("#FF6633")  // → [1, 0.4, 0.2, 1]
hexToRgb("3399FF")   // → [0.2, 0.6, 1, 1]（#省略可）

// 自作関数版（古いAE対応）
function hex2rgb(hex) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return [r, g, b, 1];
}
hex2rgb("#FF6633")
```

> [!TIP]
> デザイナーからもらったブランドカラー（HEX）をそのまま使えるので便利。

---

## カラーアニメーション

### 📌 カラーの時間変化（色相回転）
**用途**: 色がレインボーのように変化する
**適用先**: Color / Fill Color
**難易度**: ⭐⭐

```javascript
// 色相を時間で回転（レインボー効果）
const speed = 0.2;  // 回転速度
const hue = (time * speed) % 1;
hslToRgb([hue, 1, 0.5, 1])
```

```
時間:  0s    1s    2s    3s    4s    5s
色相:  🔴 → 🟡 → 🟢 → 🔵 → 🟣 → 🔴
       0    0.2   0.4   0.6   0.8   1.0(=0)
```

---

### 📌 2色間のグラデーション補間
**用途**: 2つの色の間を滑らかに変化
**適用先**: Color
**難易度**: ⭐

```javascript
const color1 = hexToRgb("#FF6633"); // オレンジ
const color2 = hexToRgb("#3399FF"); // 青
const speed = 1; // 変化速度

const t = (Math.sin(time * speed) + 1) / 2; // 0〜1
linear(t, 0, 1, color1, color2)
```

---

### 📌 複数色のグラデーション
**用途**: 3色以上を順に変化
**適用先**: Color
**難易度**: ⭐⭐

```javascript
const colors = [
  hexToRgb("#FF6633"),  // オレンジ
  hexToRgb("#3399FF"),  // 青
  hexToRgb("#33FF66"),  // 緑
  hexToRgb("#FF33CC"),  // ピンク
];

const cycleTime = 4; // 全色一巡の秒数
const t = (time % cycleTime) / cycleTime * colors.length;
const idx = Math.floor(t) % colors.length;
const nextIdx = (idx + 1) % colors.length;
const frac = t - Math.floor(t);

linear(frac, 0, 1, colors[idx], colors[nextIdx])
```

---

### 📌 スパークル（明滅するカラー）
**用途**: 色が明るくなったり暗くなったりする輝き効果
**適用先**: Color
**難易度**: ⭐⭐

```javascript
const baseColor = [1, 0.4, 0.2, 1]; // ベースカラー
const sparkleAmount = 0.3;  // 明滅幅
const speed = 5;

const hsl = rgbToHsl(baseColor);
const brightness = hsl[2] + Math.sin(time * speed) * sparkleAmount;
hslToRgb([hsl[0], hsl[1], clamp(brightness, 0, 1), 1])
```

---

## カラーの応用

### 📌 レイヤーごとに異なる色を割り当て
**用途**: 複数レイヤーにそれぞれ異なる色を自動割り当て
**適用先**: Color
**難易度**: ⭐⭐

```javascript
// レイヤー番号から色相をオフセット
const hue = (index - 1) / thisComp.numLayers;
hslToRgb([hue, 0.8, 0.5, 1])
```

```
Layer 1: 🔴 hue=0.0
Layer 2: 🟡 hue=0.2
Layer 3: 🟢 hue=0.4
Layer 4: 🔵 hue=0.6
Layer 5: 🟣 hue=0.8
```

---

### 📌 色温度（暖色↔寒色）
**用途**: スライダーで色温度を制御
**適用先**: Color
**難易度**: ⭐⭐

```javascript
// 色温度: -100（寒色）〜 0（ニュートラル）〜 +100（暖色）
const temp = effect("Temperature")("Slider"); // -100〜100

if (temp >= 0) {
  // 暖色（オレンジ方向）
  linear(temp, 0, 100, [1, 1, 1, 1], [1, 0.85, 0.7, 1]);
} else {
  // 寒色（青方向）
  linear(temp, -100, 0, [0.7, 0.85, 1, 1], [1, 1, 1, 1]);
}
```
