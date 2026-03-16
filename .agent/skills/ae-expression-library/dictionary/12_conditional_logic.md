# 🔀 条件分岐・ロジック

if/else, 三項演算子, try/catch, マーカー条件分岐等のロジック系エクスプレッション集。

---

## 基本条件分岐

### 📌 if / else
**用途**: 条件に応じて異なる値を返す
**適用先**: Any
**難易度**: ⭐

```javascript
// 基本形
if (time > 2) {
  100;
} else {
  0;
}

// 複数条件
if (time < 1) {
  0;              // 0〜1秒
} else if (time < 3) {
  100;            // 1〜3秒
} else {
  50;             // 3秒以降
}
```

---

### 📌 三項演算子（ワンライナー条件）
**用途**: 短い条件分岐を1行で書く
**適用先**: Any
**難易度**: ⭐

```javascript
// 条件 ? 真の値 : 偽の値
(time > 2) ? 100 : 0

// ネスト（推奨度：低）
(time < 1) ? 0 : (time < 3) ? 100 : 50
```

> [!TIP]
> 三項演算子は簡単な条件に使い、複雑なロジックは `if/else` で書く方が可読性が高い。

---

### 📌 比較演算子一覧
**用途**: 条件式で使う比較演算子
**適用先**: Any
**難易度**: ⭐

| 演算子 | 意味 | 例 |
|--------|------|-----|
| `===` | 等しい | `name === "Layer 1"` |
| `!==` | 等しくない | `index !== 1` |
| `>` | より大きい | `time > 2` |
| `<` | より小さい | `time < 1` |
| `>=` | 以上 | `opacity >= 50` |
| `<=` | 以下 | `scale[0] <= 100` |
| `&&` | AND | `time > 1 && time < 3` |
| `\|\|` | OR | `index === 1 \|\| index === 2` |
| `!` | NOT | `!thisLayer.enabled` |

---

## マーカーベースの条件分岐

### 📌 マーカーの有無で動作を変える
**用途**: レイヤーマーカーの位置でアニメーションを切り替え
**適用先**: Any
**難易度**: ⭐⭐

```javascript
const m = thisLayer.marker;
if (m.numKeys > 0 && time >= m.key(1).time) {
  // マーカー1以降の動作
  100;
} else {
  // マーカー1より前
  0;
}
```

---

### 📌 コンポジションマーカーによる切り替え
**用途**: コンポジションマーカーでシーン切り替え
**適用先**: Any
**難易度**: ⭐⭐

```javascript
const m = thisComp.marker;
let currentMarker = 0;

for (let i = 1; i <= m.numKeys; i++) {
  if (time >= m.key(i).time) {
    currentMarker = i;
  }
}

// マーカー番号によって値を変える
if (currentMarker === 1) {
  [960, 200];
} else if (currentMarker === 2) {
  [960, 540];
} else if (currentMarker === 3) {
  [960, 800];
} else {
  value;
}
```

---

### 📌 マーカーのコメントで条件分岐
**用途**: マーカーのコメントテキストに応じた処理
**適用先**: Any
**難易度**: ⭐⭐

```javascript
const m = thisLayer.marker;
let comment = "";

if (m.numKeys > 0) {
  const idx = m.nearestKey(time).index;
  if (m.key(idx).time <= time) {
    comment = m.key(idx).comment;
  } else if (idx > 1) {
    comment = m.key(idx - 1).comment;
  }
}

// コメントに応じた処理
if (comment === "show") {
  100;
} else if (comment === "hide") {
  0;
} else if (comment === "pulse") {
  50 + Math.sin(time * 10) * 50;
} else {
  value;
}
```

---

## エラーハンドリング

### 📌 try / catch
**用途**: エラーが発生しても安全にフォールバック
**適用先**: Any
**難易度**: ⭐⭐

```javascript
try {
  // エラーが起きる可能性のある処理
  thisComp.layer("MayNotExist").transform.position;
} catch(e) {
  // エラー時のフォールバック値
  [960, 540];
}
```

> [!TIP]
> `try/catch` は、レイヤー名の変更や削除に強いエクスプレッションを書くのに必須。テンプレートとして他人に共有する場合にも重要。

---

### 📌 レイヤー存在チェック
**用途**: 参照先レイヤーが存在するか確認してからアクセス
**適用先**: Any
**難易度**: ⭐⭐

```javascript
// try/catch でレイヤー存在チェック
function getLayerSafe(layerName, property, fallback) {
  try {
    return thisComp.layer(layerName).transform[property];
  } catch(e) {
    return fallback;
  }
}

getLayerSafe("Controller", "position", [960, 540])
```

---

## 論理パターン

### 📌 トグル（ON/OFF切り替え）
**用途**: 一定間隔で値をON/OFFする
**適用先**: Any
**難易度**: ⭐

```javascript
// 1秒ごとにON/OFF
const interval = 1;
(Math.floor(time / interval) % 2 === 0) ? 100 : 0
```

---

### 📌 しきい値ベースの条件
**用途**: 他のプロパティの値がしきい値を超えたら反応
**適用先**: Any
**難易度**: ⭐⭐

```javascript
// 位置が特定範囲に入ったら反応
const targetPos = thisComp.layer("Target").transform.position;
const dist = length(position, targetPos);
const threshold = 200;

if (dist < threshold) {
  // 近い → 大きく表示
  linear(dist, 0, threshold, 150, 100);
} else {
  // 遠い → 通常サイズ
  100;
}
```

---

### 📌 チェックボックスによる制御
**用途**: チェックボックスエフェクトでON/OFFを制御
**適用先**: Any
**難易度**: ⭐

```javascript
const isEnabled = effect("Checkbox Control")("Checkbox");

if (isEnabled) {
  wiggle(3, 50);
} else {
  value;
}
```

> [!TIP]
> チェックボックスは `1`（ON）/ `0`（OFF）を返すので、数値として使うこともできる: `value + isEnabled * wiggle(3, 50) - isEnabled * value`

---

### 📌 switch / 配列で多分岐
**用途**: 多数の条件を効率的に処理
**適用先**: Any
**難易度**: ⭐⭐

```javascript
// 配列で値を切り替え（スライダーでインデックス指定）
const options = [
  [960, 200],   // 0
  [200, 540],   // 1
  [1720, 540],  // 2
  [960, 800],   // 3
];

const idx = Math.round(effect("Position Index")("Slider"));
const clampedIdx = clamp(idx, 0, options.length - 1);
options[clampedIdx]
```
