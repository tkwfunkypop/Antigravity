# 🧪 実践レシピ集

モーションデザインでよく使う実践的な組み合わせパターン集。

---

## レイアウト・自動配置

### 📌 グリッド自動配置
**用途**: 複数レイヤーをグリッド状に自動配置
**適用先**: Position
**難易度**: ⭐⭐

```javascript
const columns = 4;        // 列数
const spacingX = 200;     // X方向の間隔
const spacingY = 200;     // Y方向の間隔
const startX = 200;       // 開始X位置
const startY = 200;       // 開始Y位置

const col = (index - 1) % columns;
const row = Math.floor((index - 1) / columns);
[startX + col * spacingX, startY + row * spacingY]
```

```
index: 1   2   3   4
       5   6   7   8
       9  10  11  12

配置:  ■   ■   ■   ■
       ■   ■   ■   ■
       ■   ■   ■   ■
```

---

### 📌 円形自動配置
**用途**: 複数レイヤーを円形に配置
**適用先**: Position
**難易度**: ⭐⭐

```javascript
const total = 8;         // 配置するレイヤー総数
const radius = 300;      // 円の半径
const center = [thisComp.width / 2, thisComp.height / 2];
const startAngle = -90;  // 開始角度（-90 = 上から）

const angle = degreesToRadians(startAngle + (index - 1) / total * 360);
center + [Math.cos(angle) * radius, Math.sin(angle) * radius]
```

---

### 📌 螺旋配置（スパイラル）
**用途**: 複数レイヤーを螺旋状に配置
**適用先**: Position
**難易度**: ⭐⭐

```javascript
const center = [thisComp.width / 2, thisComp.height / 2];
const baseRadius = 50;
const growth = 30;       // 1周ごとの半径増加
const turns = 3;         // 総回転数
const totalLayers = 20;

const progress = (index - 1) / totalLayers;
const angle = progress * turns * 2 * Math.PI;
const radius = baseRadius + progress * growth * turns;
center + [Math.cos(angle) * radius, Math.sin(angle) * radius]
```

---

## カスケードアニメーション

### 📌 順次フェードイン（ストagger）
**用途**: 複数レイヤーが順にフェードインする
**適用先**: Opacity
**難易度**: ⭐⭐

```javascript
const delay = 0.15;       // レイヤー間の遅延
const fadeTime = 0.5;     // フェード時間
const startTime = inPoint + (index - 1) * delay;

ease(time, startTime, startTime + fadeTime, 0, 100)
```

```
時間:      0s    0.15s   0.3s    0.45s
Layer 1:  ───→ 📦 (フェードイン)
Layer 2:        ───→ 📦
Layer 3:               ───→ 📦
Layer 4:                      ───→ 📦
```

---

### 📌 順次スケールアップ
**用途**: 複数レイヤーが順に拡大して出現
**適用先**: Scale
**難易度**: ⭐⭐

```javascript
const delay = 0.1;
const duration = 0.4;
const startTime = inPoint + (index - 1) * delay;

const t = clamp((time - startTime) / duration, 0, 1);
// オーバーシュート付きスケール
const overshoot = 1 - Math.pow(1 - t, 3);
const bounce = 1 + Math.sin(t * Math.PI * 2) * 0.1 * (1 - t);
const s = overshoot * bounce * 100;
[s, s]
```

---

### 📌 ウェーブアニメーション
**用途**: 複数レイヤーに波のような動きを付ける
**適用先**: Position
**難易度**: ⭐⭐

```javascript
const waveAmp = 50;       // 波の振幅
const waveSpeed = 2;      // 波の速度
const waveOffset = 0.3;   // レイヤー間の位相差

const wave = Math.sin((time * waveSpeed - index * waveOffset) * 2 * Math.PI);
value + [0, wave * waveAmp]
```

```
時間経過 →
Layer 1: ～～～～～～～～
Layer 2:  ～～～～～～～～
Layer 3:   ～～～～～～～～
Layer 4:    ～～～～～～～～
           波として伝播していく
```

---

## パーティクル・群衆効果

### 📌 ランダム散布
**用途**: レイヤーをランダムな位置に散布
**適用先**: Position
**難易度**: ⭐⭐

```javascript
seedRandom(index, true);
const margin = 100;
[
  random(margin, thisComp.width - margin),
  random(margin, thisComp.height - margin)
]
```

---

### 📌 放射状に広がる（爆発エフェクト）
**用途**: 中心から外側に向かって広がる
**適用先**: Position
**難易度**: ⭐⭐

```javascript
const center = [thisComp.width / 2, thisComp.height / 2];
const maxDist = 800;
const duration = 1.5;

seedRandom(index, true);
const angle = random(0, 2 * Math.PI);
const speed = random(0.5, 1);
const t = clamp((time - inPoint) / duration, 0, 1);
const eased = 1 - Math.pow(1 - t, 3); // easeOut

const dist = eased * maxDist * speed;
center + [Math.cos(angle) * dist, Math.sin(angle) * dist]
```

---

### 📌 集合（逆爆発・吸い込み）
**用途**: バラバラの位置から中心に集まる
**適用先**: Position
**難易度**: ⭐⭐

```javascript
const center = [thisComp.width / 2, thisComp.height / 2];
const maxDist = 800;
const duration = 1.5;

seedRandom(index, true);
const angle = random(0, 2 * Math.PI);
const dist = random(0.5, 1) * maxDist;
const startPos = center + [Math.cos(angle) * dist, Math.sin(angle) * dist];

const t = clamp((time - inPoint) / duration, 0, 1);
const eased = t * t * (3 - 2 * t); // smoothstep

linear(eased, 0, 1, startPos, center)
```

---

## UIモーション

### 📌 スライドイン（方向指定）
**用途**: 画面外からスライドして入ってくる
**適用先**: Position
**難易度**: ⭐⭐

```javascript
// 方向: "left", "right", "top", "bottom"
const direction = "left";
const duration = 0.6;
const t = ease(time, inPoint, inPoint + duration, 0, 1);

let offscreen;
if (direction === "left") offscreen = [-thisLayer.width, 0];
else if (direction === "right") offscreen = [thisComp.width + thisLayer.width, 0];
else if (direction === "top") offscreen = [0, -thisLayer.height];
else offscreen = [0, thisComp.height + thisLayer.height];

const start = [value[0] + offscreen[0], value[1] + offscreen[1]];
linear(t, 0, 1, start, value)
```

---

### 📌 プログレスバー
**用途**: 進捗バーのアニメーション
**適用先**: Scale（X方向のみ）
**難易度**: ⭐⭐

```javascript
// 進捗（0〜100%）
const progress = linear(time, 0, thisComp.duration, 0, 100);
[progress, 100]  // X方向のみスケール

// スライダーコントロールで制御する場合
// const progress = effect("Progress")("Slider");
// [progress, 100]
```

---

### 📌 カウントダウンリング（円形プログレス）
**用途**: パスのトリミングを制御して円形プログレスを表現
**適用先**: Trim Paths → End
**難易度**: ⭐⭐

```javascript
// Trim Paths の End に適用
const duration = 10; // カウントダウン秒数
const progress = linear(time, inPoint, inPoint + duration, 100, 0);
clamp(progress, 0, 100)
```

---

## カメラワーク模倣

### 📌 手持ちカメラ風の揺れ
**用途**: 映像に手持ちカメラのようなリアルな揺れを加える
**適用先**: Position
**難易度**: ⭐⭐

```javascript
// 低周波（体の揺れ）+ 高周波（手の震え）
posterizeTime(24); // 24fps に制限

const bodyShake = wiggle(0.5, 8, 2, 0.5);   // ゆっくり大きな揺れ
const handShake = wiggle(8, 2, 3, 0.5);      // 細かい震え

// 合成
const combined = bodyShake + handShake - value;
combined
```

---

### 📌 ズームパン（Ken Burns エフェクト）
**用途**: 写真をゆっくりズームしながらパンする
**適用先**: Position + Scale
**難易度**: ⭐⭐

```javascript
// === Position に適用 ===
const startPos = [960, 400];
const endPos = [960, 600];
const t = ease(time, inPoint, outPoint, 0, 1);
linear(t, 0, 1, startPos, endPos)

// === Scale に適用 ===
// const startScale = 100;
// const endScale = 120;
// const t = ease(time, inPoint, outPoint, 0, 1);
// const s = linear(t, 0, 1, startScale, endScale);
// [s, s]
```

---

## データ駆動

### 📌 配列データからの自動取得
**用途**: 事前定義した配列データをインデックスで取得
**適用先**: Source Text / Position / Any
**難易度**: ⭐⭐

```javascript
// テキストレイヤーの場合
const data = ["東京", "大阪", "名古屋", "福岡", "札幌"];
const idx = clamp(Math.floor(effect("Index")("Slider")), 0, data.length - 1);
data[idx]
```

---

### 📌 時間ベースの自動切り替え
**用途**: 一定間隔でテキストや値を自動切り替え
**適用先**: Source Text
**難易度**: ⭐⭐

```javascript
const items = [
  "🔥 テクノロジー",
  "🎨 デザイン",
  "🎵 音楽",
  "📸 写真",
  "🎮 ゲーム"
];
const interval = 2; // 切り替えインターバル（秒）
const fadeDuration = 0.3;

const idx = Math.floor(time / interval) % items.length;
items[idx]
```

---

## パフォーマンス最適化

### 📌 ベストプラクティス

> [!IMPORTANT]
> **エクスプレッションのパフォーマンスに影響する要因:**
>
> 1. **`try/catch` の多用** — 必要な場所のみで使用
> 2. **他コンポの参照** — `comp("other")` は重い。同一コンポ内で完結させる
> 3. **ループ回数** — `for` ループの回数を最小限に
> 4. **valueAtTime()** — 過去の値を大量に参照すると遅くなる
> 5. **文字列操作** — 毎フレームの大量の文字列結合は避ける

```javascript
// ✅ 良い例: 変数に格納して再利用
const ctrl = thisComp.layer("Controller");
const speed = ctrl.effect("Speed")("Slider");
const amp = ctrl.effect("Amplitude")("Slider");
wiggle(speed, amp)

// ❌ 悪い例: 毎回レイヤーを検索
wiggle(
  thisComp.layer("Controller").effect("Speed")("Slider"),
  thisComp.layer("Controller").effect("Amplitude")("Slider")
)
```
