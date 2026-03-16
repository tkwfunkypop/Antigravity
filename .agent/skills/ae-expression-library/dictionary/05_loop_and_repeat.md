# 🔄 ループ・繰り返し

キーフレームアニメーションを自動的にループ・反復させるエクスプレッション集。

---

## loopOut（後方ループ）

### 📌 loopOut("cycle") — 基本ループ
**用途**: 最後のキーフレーム以降、アニメーションを繰り返す
**適用先**: Any（キーフレーム必須）
**難易度**: ⭐

```javascript
loopOut("cycle")
```

```
キーフレーム:  ◆────◆    ◆────◆    ◆────◆
              ╱    ╲    ╱    ╲    ╱    ╲
             ╱      ╲  ╱      ╲  ╱      ╲
            ╱        ╲╱        ╲╱        ╲
元:         |── 1周期 ──|
loopOut:    |── 1周期 ──|── 1周期 ──|── 1周期 ──|
```

---

### 📌 loopOut("pingpong") — 往復ループ
**用途**: 最後のキーフレーム以降、往復（逆再生→正再生→…）を繰り返す
**適用先**: Any（キーフレーム必須）
**難易度**: ⭐

```javascript
loopOut("pingpong")
```

```
cycle:      ╱╲  ╱╲  ╱╲  ╱╲
           ╱  ╲╱  ╲╱  ╲╱  ╲    ← ジャンプあり

pingpong:   ╱╲  ╱╲  ╱╲  ╱╲
           ╱  ╲╱  ╲╱  ╲╱  ╲    ← 滑らかに折り返す
```

> [!TIP]
> `pingpong` は「行って戻る」ので、始点と終点の値が異なるアニメーションに最適。`cycle` は始点と終点が同じ値のときに自然な繋がりになる。

---

### 📌 loopOut("offset") — オフセットループ
**用途**: ループするたびに値が蓄積される
**適用先**: Position / Rotation（累積移動・累積回転に便利）
**難易度**: ⭐⭐

```javascript
loopOut("offset")
```

```
cycle:     ╱╲╱╲╱╲╱╲  ← 同じ位置で繰り返す
offset:    ╱╲ ╱╲  ╱╲  ╱╲  ← 毎回上に積み重なる
              ╱     ╱     ╱
             ╱     ╱     ╱
```

---

### 📌 loopOut("continue") — 速度維持
**用途**: 最後のキーフレームの速度を維持して直進
**適用先**: Position / Scale
**難易度**: ⭐

```javascript
loopOut("continue")
```

```
キー:      ╱╲
          ╱  ╲
         ╱    ╲────────  ← 最後のキーの速度で直進
```

---

### 📌 loopOut のオプション引数
**用途**: ループに使うキーフレーム数を制限
**適用先**: Any
**難易度**: ⭐⭐

```javascript
// 全キーフレームでループ（デフォルト）
loopOut("cycle", 0)

// 最後の2つのキーフレームだけでループ
loopOut("cycle", 2)

// 最後の3つのキーフレームでループ
loopOut("cycle", 3)
```

**パラメータ解説:**
| 引数 | 型 | 説明 |
|------|-----|------|
| 第1引数 | String | ループタイプ: `"cycle"`, `"pingpong"`, `"offset"`, `"continue"` |
| 第2引数 | Number | 使用するキーフレーム数（0=全部、2=最後の2つ） |

---

## loopIn（前方ループ）

### 📌 loopIn — 前方にループ
**用途**: 最初のキーフレーム以前にループを適用
**適用先**: Any（キーフレーム必須）
**難易度**: ⭐

```javascript
loopIn("cycle")
loopIn("pingpong")
loopIn("offset")
loopIn("continue")
```

```
           ◆ 最初のキー
loopIn:    |←← ここにループ ←←|    元のアニメーション →→|
loopOut:   |→ 元のアニメーション →|→→ ここにループ →→→|
```

---

## 両方向ループ

### 📌 loopIn + loopOut 組み合わせ
**用途**: 前後両方にループを適用
**適用先**: Any
**難易度**: ⭐⭐

```javascript
// 両方向にループ
loopIn("cycle") + loopOut("cycle") - value
```

> [!WARNING]
> 単純に `loopIn() + loopOut()` だけでは値が二重に加算される。`- value` で補正が必要。

---

## ループの応用パターン

### 📌 指定回数だけループ
**用途**: 無限ループではなく、特定回数で停止
**適用先**: Any
**難易度**: ⭐⭐

```javascript
const maxLoops = 3; // ループ回数
if (numKeys > 1) {
  const cycleDuration = key(numKeys).time - key(1).time;
  const elapsed = time - key(numKeys).time;
  if (elapsed > 0 && elapsed < cycleDuration * maxLoops) {
    loopOut("cycle");
  } else if (elapsed >= cycleDuration * maxLoops) {
    key(numKeys).value;
  } else {
    value;
  }
} else {
  value;
}
```

---

### 📌 ループ速度を徐々に変化
**用途**: ループしながら速度を上げる/下げる
**適用先**: Any
**難易度**: ⭐⭐⭐

```javascript
// ループしながら徐々に加速
const acceleration = 1.5; // 加速率

if (numKeys > 1) {
  const cycleDuration = key(numKeys).time - key(1).time;
  const elapsed = Math.max(0, time - key(numKeys).time);
  const loopCount = elapsed / cycleDuration;
  const speedMultiplier = Math.pow(acceleration, loopCount);
  
  const adjustedTime = key(1).time + (elapsed * speedMultiplier) % cycleDuration;
  thisProperty.valueAtTime(adjustedTime);
} else {
  value;
}
```

---

### 📌 キーフレームなしの擬似ループ
**用途**: キーフレームなしで周期的な動きを作る
**適用先**: Any
**難易度**: ⭐

```javascript
// キーフレーム不要のサイン波ループ
const amp = 50;
const period = 2; // 周期（秒）
amp * Math.sin(time / period * 2 * Math.PI)
```

> [!TIP]
> `loopOut` はキーフレームが必要だが、`Math.sin(time * freq)` パターンならキーフレームなしでループ可能。
