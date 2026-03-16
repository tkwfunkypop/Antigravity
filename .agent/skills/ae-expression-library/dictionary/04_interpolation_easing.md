# 🎢 補間・イージング

ease, linear, bezier 等を使ったスムーズな補間エクスプレッション集。

---

## AE 組み込み補間関数

### 📌 ease（イーズイン・アウト）
**用途**: 開始・終了が滑らかな補間（最もよく使う）
**適用先**: Any
**難易度**: ⭐

```javascript
// ease(入力値, 入力開始, 入力終了, 出力開始, 出力終了)
ease(time, 0, 2, 0, 100)
// 0秒→0, 2秒→100 にイーズイン・アウトで変化
```

```
100% ─────────────────○
                    ╱
                  ╱    ← ease（S字カーブ）
                ╱
   0% ○──────────
      0s              2s
```

> [!IMPORTANT]
> `ease()` は入力値が範囲外になっても出力範囲内にクランプされる（`linear()` との大きな違い）。

---

### 📌 easeIn / easeOut
**用途**: 片方だけイーズをかける
**適用先**: Any
**難易度**: ⭐

```javascript
// easeIn: ゆっくり始まって急に終わる（加速）
easeIn(time, 0, 2, 0, 100)

// easeOut: 急に始まってゆっくり終わる（減速）
easeOut(time, 0, 2, 0, 100)
```

```
easeIn:                easeOut:
100% ─────────── ╱     100% ─────── ╱───
                ╱                  ╱
              ╱                 ╱
           ╱                 ╱
   0% ───╱                0%╱
      slow → fast          fast → slow
```

---

### 📌 linear（線形補間、クランプなし）
**用途**: 直線的にマッピング・補間（範囲外も延長）
**適用先**: Any
**難易度**: ⭐

```javascript
// 0〜2秒で 0〜100 に変化（範囲外は延長）
linear(time, 0, 2, 0, 100)
// 3秒 → 150（範囲外も直線で延長される！）
```

```
    ease:               linear:
    ──────○             ──────────╱
        ╱╱                      ╱
      ╱                        ╱
   ╱╱                         ╱
  ○──────               ────╱──────
  クランプ              延長される！
```

---

## キーフレーム間の補間

### 📌 キーフレーム間をイージングで接続
**用途**: キーフレーム間にカスタムイージングを適用
**適用先**: Any
**難易度**: ⭐⭐

```javascript
// 全キーフレーム間をeaseで補間
if (numKeys < 2) {
  value;
} else {
  let idx = 1;
  while (idx < numKeys && time >= key(idx + 1).time) idx++;
  
  if (time < key(1).time) {
    key(1).value;
  } else if (time > key(numKeys).time) {
    key(numKeys).value;
  } else {
    ease(time, key(idx).time, key(idx + 1).time, key(idx).value, key(idx + 1).value);
  }
}
```

---

## カスタムイージングカーブ

### 📌 パワーイージング
**用途**: ease のカーブ強度をカスタマイズ
**適用先**: Any
**難易度**: ⭐⭐

```javascript
// カスタムパワーイージング
function powerEase(t, power) {
  // t: 0〜1 の進捗
  // power: 2=二次, 3=三次（大きいほど急）
  return 1 - Math.pow(1 - t, power);
}

const startTime = 0;
const endTime = 2;
const startVal = 0;
const endVal = 100;
const power = 3; // カーブの強さ

const t = clamp((time - startTime) / (endTime - startTime), 0, 1);
startVal + (endVal - startVal) * powerEase(t, power);
```

**パラメータ解説:**
| power | カーブ名 | 効果 |
|-------|---------|------|
| 1 | Linear | 直線 |
| 2 | Quadratic | 穏やかなイーズ |
| 3 | Cubic | 標準的なイーズ |
| 4 | Quartic | 強めのイーズ |
| 5 | Quintic | 非常に強いイーズ |

```
power=2: ╱────    power=5:    ╱──
        ╱                  ╱ ╱
       ╱                  ╱╱
      ╱                 ╱╱
   ──╱               ──╱
   穏やか            急激
```

---

### 📌 エラスティックイージング（弾性）
**用途**: ゴムのように弾む動き
**適用先**: Any
**難易度**: ⭐⭐⭐

```javascript
function elasticOut(t, amplitude, period) {
  if (t === 0 || t === 1) return t;
  const s = period / (2 * Math.PI) * Math.asin(1 / amplitude);
  return amplitude * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / period) + 1;
}

const startTime = 0;
const endTime = 1;
const t = clamp((time - startTime) / (endTime - startTime), 0, 1);
const startVal = [0, 0];
const endVal = [100, 100];

const e = elasticOut(t, 1, 0.3);
[startVal[0] + (endVal[0] - startVal[0]) * e,
 startVal[1] + (endVal[1] - startVal[1]) * e]
```

```
     ╱╲
    ╱  ╲──╱╲─────── 最終値
   ╱      ╱    ╲╱
  ╱    弾性的に振動して最終値に安定
```

---

### 📌 バックイージング（行き過ぎ＆戻り）
**用途**: 目標値を一度超えてから戻る
**適用先**: Any
**難易度**: ⭐⭐

```javascript
function backOut(t, overshoot) {
  const s = overshoot || 1.70158;
  const t1 = t - 1;
  return t1 * t1 * ((s + 1) * t1 + s) + 1;
}

const t = clamp((time - inPoint) / 0.5, 0, 1);
const startVal = 0;
const endVal = 100;

startVal + (endVal - startVal) * backOut(t, 1.7);
```

```
100% ──────── ╱╲──── 最終値
             ╱  ╲
            ╱    一度超過
           ╱
  0% ────╱
```

> [!TIP]
> `overshoot` の典型値: `1.7`（標準）、`3.0`（大きな行き過ぎ）、`0.5`（控えめ）

---

## 複数プロパティ間の補間

### 📌 2つの値の間をスムーズに切り替え
**用途**: 任意の2値間をイージング付きで遷移
**適用先**: Any
**難易度**: ⭐

```javascript
const triggerTime = 2; // 切り替えタイミング
const duration = 0.5;  // 遷移時間
const valA = [960, 200];  // 値A
const valB = [960, 800];  // 値B

ease(time, triggerTime, triggerTime + duration, valA, valB)
```

---

### 📌 3つ以上の値を順に遷移
**用途**: 複数の値を順番にイージング遷移
**適用先**: Any
**難易度**: ⭐⭐

```javascript
const values = [0, 100, 50, 80, 30]; // 遷移する値のリスト
const interval = 1;  // 各値間の遷移時間

const totalDuration = (values.length - 1) * interval;
const t = clamp(time, 0, totalDuration);
const idx = Math.min(Math.floor(t / interval), values.length - 2);
const localT = (t - idx * interval) / interval;

const from = values[idx];
const to = values[idx + 1];
from + (to - from) * (localT * localT * (3 - 2 * localT)); // smoothstep
```
