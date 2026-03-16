# 🔢 数学・三角関数

Math オブジェクトと AE 組み込みの数学関数を使ったエクスプレッション集。

---

## 三角関数（波の動き）

### 📌 サイン波（滑らかな往復運動）
**用途**: プロパティを滑らかに往復させる
**適用先**: Any
**難易度**: ⭐

```javascript
const amp = 100;    // 振幅（動きの幅）
const freq = 1;     // 周波数（1秒あたりの往復数）
const offset = 0;   // 開始位相（ラジアン）

amp * Math.sin(time * freq * 2 * Math.PI + offset)
```

**パラメータ解説:**
| パラメータ | 型 | 説明 | 典型値 |
|-----------|-----|------|--------|
| `amp` | Number | 振れ幅（ピクセルや度数） | 10〜500 |
| `freq` | Number | 1秒の往復回数 | 0.5〜5 |
| `offset` | Number | 位相ずらし（ラジアン） | 0, Math.PI/2 |

```
    amp
     ↕
 ╱╲      ╱╲
╱  ╲    ╱  ╲    ← Math.sin()
    ╲  ╱    ╲  ╱
     ╲╱      ╲╱
   -amp
|←  1/freq  →|
    (1周期)
```

> [!TIP]
> `Math.sin` は `-1〜1` を返す。`* 0.5 + 0.5` で `0〜1` に変換可能。

---

### 📌 コサイン波
**用途**: サイン波と90°位相がずれた波形
**適用先**: Any
**難易度**: ⭐

```javascript
// cos はsin の90°（π/2）位相ずれ → 開始値が最大値
const amp = 100;
const freq = 1;
amp * Math.cos(time * freq * 2 * Math.PI)
```

```
sin: 0 → 最大 → 0 → 最小 → 0
cos: 最大 → 0 → 最小 → 0 → 最大
     ↑ 開始が最大値（即座に動き出す）
```

---

### 📌 sin/cos の組み合わせ（リサージュ図形）
**用途**: 複雑な曲線パターンを Position に適用
**適用先**: Position
**難易度**: ⭐⭐⭐

```javascript
const freqX = 3;
const freqY = 2;
const ampX = 300;
const ampY = 200;
const center = [thisComp.width / 2, thisComp.height / 2];

center + [
  ampX * Math.sin(time * freqX),
  ampY * Math.sin(time * freqY)
]
```

> [!TIP]
> `freqX : freqY` の比率で図形が変わる。`1:2` = 8の字、`2:3` = 複雑な花形。

---

## AE 組み込み数学関数

### 📌 clamp（値の制限）
**用途**: 値を最小値〜最大値の範囲に制限する
**適用先**: Any
**難易度**: ⭐

```javascript
// clamp(値, 最小, 最大)
clamp(value, 0, 100)      // 0〜100に制限
clamp(time * 50, 0, 100)  // 0〜100で止まる
```

```
入力:  -20  0  50  100  150
出力:   0   0  50  100  100 ← クランプ後
       ↑最小              ↑最大
```

---

### 📌 linear（線形マッピング）
**用途**: ある範囲の値を別の範囲にマッピング
**適用先**: Any
**難易度**: ⭐

```javascript
// linear(入力値, 入力最小, 入力最大, 出力最小, 出力最大)

// 時間0〜2秒を 0〜100にマッピング
linear(time, 0, 2, 0, 100)

// Position を Opacity に変換（X=0で0%, X=960で100%）
linear(position[0], 0, 960, 0, 100)
```

**パラメータ解説:**
| パラメータ | 説明 |
|-----------|------|
| 第1引数 | 入力値（通常 `time` や他のプロパティ値） |
| 第2引数 | 入力範囲の最小値 |
| 第3引数 | 入力範囲の最大値 |
| 第4引数 | 出力範囲の最小値 |
| 第5引数 | 出力範囲の最大値 |

```
入力範囲:  [0 ─────── 2]  (秒)
              ↕ マッピング
出力範囲:  [0 ─────── 100] (%)
```

> [!IMPORTANT]
> `linear()` は入力範囲外でも直線を延長する。範囲内に制限したい場合は `ease()` を使うか `clamp()` を併用する。

---

### 📌 normalize（正規化）
**用途**: ベクトルの方向を維持したまま長さを1にする
**適用先**: Position
**難易度**: ⭐⭐

```javascript
// ベクトルを正規化（長さ1のベクトルにする）
const direction = normalize([3, 4]); // → [0.6, 0.8]
// 方向ベクトル × 移動速度
direction * speed * time
```

---

### 📌 length（ベクトルの長さ / 2点間の距離）
**用途**: 2つの点の距離を計算
**適用先**: Any
**難易度**: ⭐

```javascript
// 2点間の距離
const dist = length(position, thisComp.layer("Target").position);

// ベクトルの長さ
length([3, 4])  // → 5

// 距離に応じてOpacityを変化
const maxDist = 500;
linear(length(position, thisComp.layer("Target").position), 0, maxDist, 100, 0)
```

---

### 📌 dot / cross（内積・外積）
**用途**: ベクトル計算
**適用先**: Any
**難易度**: ⭐⭐⭐

```javascript
// 内積（スカラー値を返す）
dot([1, 0], [0, 1])  // → 0（直交）
dot([1, 0], [1, 0])  // → 1（平行）

// 外積（3Dベクトル同士、3D値を返す）
cross([1, 0, 0], [0, 1, 0])  // → [0, 0, 1]
```

---

## 角度変換

### 📌 degreesToRadians / radiansToDegrees
**用途**: 度数法とラジアンの相互変換
**適用先**: Any
**難易度**: ⭐

```javascript
// 度 → ラジアン
degreesToRadians(90)   // → 1.5707... (π/2)
degreesToRadians(180)  // → 3.1415... (π)

// ラジアン → 度
radiansToDegrees(Math.PI)      // → 180
radiansToDegrees(Math.PI / 2)  // → 90
```

| 度 | ラジアン | Math定数 |
|-----|---------|---------|
| 0° | 0 | 0 |
| 90° | π/2 | `Math.PI / 2` |
| 180° | π | `Math.PI` |
| 360° | 2π | `Math.PI * 2` |

---

## 便利な数学テクニック

### 📌 値の丸め
**用途**: 値を整数やステップ単位に丸める
**適用先**: Any
**難易度**: ⭐

```javascript
// 小数を四捨五入
Math.round(value)       // 50.7 → 51

// 切り捨て
Math.floor(value)       // 50.7 → 50

// 切り上げ
Math.ceil(value)        // 50.2 → 51

// 10刻みに丸める（スナップ）
Math.round(value / 10) * 10   // 53 → 50, 57 → 60

// グリッドスナップ（Position用）
const grid = 50;
[Math.round(value[0] / grid) * grid, Math.round(value[1] / grid) * grid]
```

---

### 📌 min / max
**用途**: 値の上限・下限を設定
**適用先**: Any
**難易度**: ⭐

```javascript
// 最小値の確保
Math.max(0, time * 100 - 200)  // 0未満にならない

// 最大値の制限
Math.min(100, time * 50)  // 100を超えない

// 範囲制限（clampの代替）
Math.max(0, Math.min(100, value))
```

---

### 📌 abs（絶対値）
**用途**: 値の符号を除去
**適用先**: Any
**難易度**: ⭐

```javascript
// 振動を常にプラス側のみにする
const wave = Math.sin(time * 3);
Math.abs(wave) * 100  // 0〜100のバウンス波形

// 距離は常に正の値
Math.abs(position[0] - 960)
```

```
sin波:     ╱╲    ╱╲
          ╱  ╲  ╱  ╲
      ───╱────╲╱────╲───  ← 正負あり
             
abs(sin):  ╱╲  ╱╲  ╱╲
          ╱  ╲╱  ╲╱  ╲
      ────────────────── ← 常に正
```

---

### 📌 pow / sqrt（累乗・平方根）
**用途**: 非線形な変化を作る
**適用先**: Any
**難易度**: ⭐

```javascript
// 二乗（加速的な変化）
Math.pow(time / duration, 2) * 100

// 平方根（減速的な変化）
Math.sqrt(time / duration) * 100

// べき乗のカーブ比較
// pow(x, 0.5) → 急速に上がって緩やかに
// pow(x, 1)   → 直線
// pow(x, 2)   → 緩やかに始まって急速に
// pow(x, 3)   → さらに急な加速
```

```
100%|        ___pow(0.5)
    |     __/
    |   _/ ____pow(1)
    |  / _/
    | /_/____pow(2)
    |/  /
  0%|──/─────→ time
```
