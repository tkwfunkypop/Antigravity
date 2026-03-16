# 🎲 ウィグル・ランダム

wiggle, random, seedRandom, noise 等のランダム・揺れエクスプレッション集。

---

## wiggle（揺れ）

### 📌 基本ウィグル
**用途**: プロパティにランダムな揺れを加える（最も使われるエクスプレッション）
**適用先**: Any
**難易度**: ⭐

```javascript
// wiggle(周波数, 振幅)
wiggle(3, 50)
// 1秒に3回、最大50ピクセルの揺れ
```

**パラメータ解説:**
| パラメータ | 型 | 説明 | 典型値 |
|-----------|-----|------|--------|
| 周波数 (freq) | Number | 1秒あたりの揺れ回数 | 1〜10 |
| 振幅 (amp) | Number | 最大の揺れ幅 | 5〜200 |

```
振幅50の場合:
     +50 ─ ─ ─╱─╲─ ─ ─╱╲─ ─ ─ ─
              ╱   ╲   ╱  ╲   ╱╲
  元の値 ───╱─────╲─╱────╲─╱──╲───
            ╲      ╲         ╲
     -50 ─ ─ ╲─ ─ ─╲─ ─ ─ ─ ╲─ ─
```

---

### 📌 1軸だけウィグル
**用途**: X方向のみ、またはY方向のみ揺らす
**適用先**: Position
**難易度**: ⭐⭐

```javascript
// X方向のみ揺らす
const w = wiggle(3, 50);
[w[0], value[1]]

// Y方向のみ揺らす
const w = wiggle(3, 50);
[value[0], w[1]]
```

---

### 📌 ウィグルの高度なパラメータ
**用途**: より細かい揺れの制御
**適用先**: Any
**難易度**: ⭐⭐

```javascript
// wiggle(freq, amp, octaves, amp_mult, time)
wiggle(5, 50, 3, 0.5)
```

| パラメータ | デフォルト | 説明 |
|-----------|-----------|------|
| freq | — | 周波数 |
| amp | — | 振幅 |
| octaves | 1 | ノイズの重ね合わせ層数（多=複雑） |
| amp_mult | 0.5 | 各オクターブの振幅減衰率 |
| t | time | 時間値（カスタムタイミング） |

```
octaves=1:  ╱╲  ╱╲  ╱╲     ← 滑らか
octaves=3:  ╱╲╱╲╱╲╱╲╱╲╱╲   ← ギザギザが加わる
octaves=5:  ╱╲╱╲╱╲╱╲╱╲╱╲╱╲ ← さらに複雑
```

---

### 📌 ウィグルをフェードイン/アウト
**用途**: ウィグルの強度を時間で変化させる
**適用先**: Any
**難易度**: ⭐⭐

```javascript
// 開始から1秒かけてウィグルがフェードイン
const fadeInDuration = 1;
const maxAmp = 50;
const amp = linear(time, inPoint, inPoint + fadeInDuration, 0, maxAmp);
wiggle(3, amp)
```

```javascript
// フェードイン & フェードアウト
const fadeIn = 1;
const fadeOut = 1;
const maxAmp = 50;

let amp = maxAmp;
if (time < inPoint + fadeIn) {
  amp = linear(time, inPoint, inPoint + fadeIn, 0, maxAmp);
} else if (time > outPoint - fadeOut) {
  amp = linear(time, outPoint - fadeOut, outPoint, maxAmp, 0);
}
wiggle(3, amp)
```

---

### 📌 ポスタライズ付きウィグル（カクカク）
**用途**: ウィグルの更新レートを下げてカクカクした揺れにする
**適用先**: Any
**難易度**: ⭐

```javascript
posterizeTime(8); // 8fpsに制限
wiggle(3, 50)
```

> [!TIP]
> 手持ちカメラ風の揺れは `posterizeTime(12); wiggle(2, 15)` が定番。

---

### 📌 キーフレーム値にウィグルを追加
**用途**: 既存のキーフレームアニメーションにウィグルを重ねる
**適用先**: Any
**難易度**: ⭐

```javascript
// value はキーフレームの値。wiggle は value を基準に揺れる
wiggle(3, 20)
// ↑ これだけでOK。wiggle は自動的に value を基準にする
```

---

## random / gaussRandom

### 📌 random（一様乱数）
**用途**: 毎フレーム完全にランダムな値を生成
**適用先**: Any
**難易度**: ⭐

```javascript
// 0〜100 のランダム値（毎フレーム変化）
random(0, 100)

// 配列のランダム値（Position用）
[random(0, 1920), random(0, 1080)]

// ランダムなカラー
[random(), random(), random(), 1]  // random() = 0〜1
```

**パラメータ解説:**
| 関数 | 引数 | 戻り値 |
|------|------|--------|
| `random()` | なし | 0.0〜1.0 |
| `random(max)` | 最大値 | 0〜max |
| `random(min, max)` | 最小値, 最大値 | min〜max |

> [!WARNING]
> `random()` は毎フレーム異なる値を返す。確定的な乱数が必要な場合は `seedRandom()` を使う。

---

### 📌 gaussRandom（正規分布乱数）
**用途**: 中央値に偏ったランダム値
**適用先**: Any
**難易度**: ⭐⭐

```javascript
// 正規分布に基づくランダム（中央値付近が多い）
gaussRandom(0, 100)
```

```
random:      ||||||||||||||||  ← 均等に分布
gaussRandom: |  ||||||||||  |  ← 中央に集中
```

> [!TIP]
> `gaussRandom` はパーティクルの広がりや自然な散らばりを表現するのに最適。

---

## seedRandom（乱数シード）

### 📌 seedRandom — 再現可能な乱数
**用途**: 同じシード値で常に同じ乱数列を生成
**適用先**: Any
**難易度**: ⭐⭐

```javascript
// seedRandom(シード値, タイムレス)
seedRandom(42, true);  // シード42、時間に依存しない → 固定値
random(0, 100)         // 常に同じ値

seedRandom(42, false); // シード42、時間に依存 → フレームごとに変化するが再現可能
random(0, 100)
```

**パラメータ解説:**
| 引数 | 型 | 説明 |
|------|-----|------|
| seed | Number | 乱数のシード値 |
| timeless | Boolean | `true`: 常に同じ値 / `false`: フレームごとに変化 |

---

### 📌 レイヤーごとに異なるランダム値
**用途**: 複数レイヤーにそれぞれ異なるランダム値を設定
**適用先**: Any
**難易度**: ⭐⭐

```javascript
// index をシードに使えば、レイヤーごとに異なる固定値
seedRandom(index, true);
const randomScale = random(50, 150);
[randomScale, randomScale]
```

> [!TIP]
> `index` はレイヤー番号なので、同じエクスプレッションでもレイヤーごとに異なる結果になる。テンプレート的に使うのに最適。

---

### 📌 ランダムだが滑らかな変化
**用途**: wiggle のようにランダムだが、より長い間隔で滑らかに変化
**適用先**: Any
**難易度**: ⭐⭐

```javascript
// 超低周波ウィグル = ゆっくりランダムに変化
wiggle(0.3, 50)  // 0.3Hzで最大50の揺れ（約3秒に1回）
```

---

## noise（パーリンノイズ）

### 📌 noise — 滑らかなノイズ
**用途**: -1〜1 の滑らかなノイズ値を生成
**適用先**: Any
**難易度**: ⭐⭐

```javascript
// noise(入力値) → -1〜1
noise(time) * 100      // 時間ベースのノイズ

// 2Dノイズ（X/Y独立）
[noise(time) * 100, noise(time + 100) * 100]
```

```
random:  ╱╲╱╲╱╲╱╲  ← ギザギザ（毎フレーム独立）
noise:   ╱─╲─╱╲─╱  ← 滑らか（連続的に変化）
```

> [!TIP]
> `noise(time + 1000)` のようにオフセットを加えると、異なるノイズパターンが得られる。X と Y で異なるオフセットを使うと、独立した2Dノイズになる。

---

### 📌 フラクタルノイズ風
**用途**: 複数の周波数のノイズを重ね合わせて複雑なパターン
**適用先**: Any
**難易度**: ⭐⭐⭐

```javascript
const octaves = 4;
const lacunarity = 2;   // 周波数の増加率
const persistence = 0.5; // 振幅の減衰率

let total = 0;
let amplitude = 1;
let frequency = 1;
let maxValue = 0;

for (let i = 0; i < octaves; i++) {
  total += noise(time * frequency) * amplitude;
  maxValue += amplitude;
  amplitude *= persistence;
  frequency *= lacunarity;
}

(total / maxValue) * 100 // -100〜100 に正規化
```
