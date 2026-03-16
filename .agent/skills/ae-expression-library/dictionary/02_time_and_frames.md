# ⏱ 時間・フレーム関連

タイムライン上の時間、フレーム、キーフレームに関するエクスプレッション集。

---

## グローバル時間変数

### 📌 time（現在の時間）
**用途**: 現在のタイムライン位置を秒単位で取得
**適用先**: Any
**難易度**: ⭐

```javascript
// time はコンポの先頭からの秒数（小数）
time    // 1秒 → 1.0, 1.5秒 → 1.5

// 基本的な使い方
time * 100;         // 100ピクセル/秒の移動
time * 360;         // 360度/秒の回転（1秒1回転）
Math.sin(time * 3); // 3Hz の波
```

```
time の値:
0s  0.5s  1s  1.5s  2s  2.5s  3s
|----|----|----|----|----|----|
0   0.5  1.0  1.5  2.0  2.5  3.0
```

---

### 📌 framesToTime / timeToFrames
**用途**: フレーム数と秒数を相互変換
**適用先**: Any
**難易度**: ⭐

```javascript
// フレーム → 秒
framesToTime(30)     // 30fps なら 1.0秒

// 秒 → フレーム
timeToFrames(time)   // 現在のフレーム番号

// 5フレームごとに値を切り替え
Math.floor(timeToFrames(time) / 5) % 2
```

**パラメータ解説:**
| 関数 | 引数 | 戻り値 |
|------|------|--------|
| `framesToTime(frames)` | フレーム数 | 秒数 |
| `timeToFrames(t)` | 秒数（省略可＝現在時刻） | フレーム数 |

---

## レイヤー時間

### 📌 inPoint / outPoint
**用途**: レイヤーの開始/終了時間を取得
**適用先**: Any
**難易度**: ⭐

```javascript
// レイヤーの開始からの経過時間
time - inPoint

// レイヤーの残り時間
outPoint - time

// レイヤーの全体の長さ
outPoint - inPoint
```

```
コンポタイムライン:
|-------|===========|--------|
0s     inPoint   outPoint   comp end
        ↑                    
     time - inPoint = 0
```

---

### 📌 レイヤー開始からの正規化時間（0〜1）
**用途**: レイヤーの始点〜終点を 0〜1 に正規化
**適用先**: Any
**難易度**: ⭐

```javascript
const progress = (time - inPoint) / (outPoint - inPoint);
// progress: 0.0（開始）→ 1.0（終了）

// 例: Opacity をレイヤー寿命で 0→100 に変化
linear(progress, 0, 1, 0, 100)
```

> [!TIP]
> `clamp(progress, 0, 1)` でオーバーシュートを防止できる。

---

## キーフレーム操作

### 📌 numKeys / key() / nearestKey()
**用途**: キーフレーム情報にアクセス
**適用先**: Any
**難易度**: ⭐⭐

```javascript
// キーフレーム数
thisProperty.numKeys

// 特定キーの時間と値
key(1).time    // 1番目のキーの時間
key(1).value   // 1番目のキーの値

// 最後のキー
key(numKeys).time
key(numKeys).value

// 最も近いキー
nearestKey(time).index  // 現在時刻に最も近いキーの番号
```

**図解:**
```
キーフレーム配置:
key(1)      key(2)      key(3)
  ◆-----------◆-----------◆
  |           |           |
  t=0.5s     t=1.5s     t=3.0s
  v=0        v=100      v=50
```

---

### 📌 velocity / speed（速度）
**用途**: プロパティの変化速度を取得
**適用先**: Any
**難易度**: ⭐⭐

```javascript
// 速度（方向を含むベクトル）
thisProperty.velocity           // 現在の速度
thisProperty.velocityAtTime(t)  // 時刻 t の速度

// 速さ（スカラー、方向なし）
thisProperty.speed              // 現在の速さ
thisProperty.speedAtTime(t)     // 時刻 t の速さ
```

| プロパティ | 戻り値 | 説明 |
|-----------|--------|------|
| `velocity` | Array/Number | 変化の速度（方向あり） |
| `speed` | Number | 変化の速さ（絶対値） |

---

## 時間のリマッピング

### 📌 timeRemap
**用途**: 時間をリマッピングしてスロー/早送りを制御
**適用先**: Time Remap
**難易度**: ⭐⭐

```javascript
// 2倍速
time * 2

// 0.5倍速（スローモーション）
time * 0.5

// 逆再生
thisLayer.source.duration - time

// ピンポン（往復再生）
const dur = thisLayer.source.duration;
const cycle = time % (dur * 2);
(cycle < dur) ? cycle : dur * 2 - cycle;
```

```
通常:    |→→→→→→→→|
2倍速:   |→→→→→→→→→→→→→→→→|（同じ時間で2倍進む）
逆再生:  |←←←←←←←←|
ピンポン: |→→→→→→→→|←←←←←←←←|→→→→→→→→|
```

---

### 📌 posterizeTime（コマ打ち）
**用途**: フレームレートを下げてコマ撮り風にする
**適用先**: Any（先頭に記述）
**難易度**: ⭐

```javascript
posterizeTime(8); // 8fpsに制限（カクカクした動き）
// その後に通常のエクスプレッション
time * 200
```

```
30fps (通常):  ∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙
 8fps (コマ打ち): ∙···∙···∙···∙···∙···∙···∙···∙···
                  ↑   ↑   ↑   ↑  (8回/秒だけ更新)
```

> [!TIP]
> アニメ風の動き（2コマ打ち）は `posterizeTime(12)` が定番。手描きアニメ風は `posterizeTime(8)`。

---

## コンポジション時間

### 📌 comp duration / displayStartTime
**用途**: コンポジションの時間情報を取得
**適用先**: Any
**難易度**: ⭐

```javascript
// コンポジションの長さ（秒）
thisComp.duration

// コンポジションの表示開始時間
thisComp.displayStartTime

// フレームレート
thisComp.frameDuration  // 1フレームの秒数（30fps → 0.0333...）
1 / thisComp.frameDuration  // fps値（30）

// 現在のフレーム番号
Math.floor(time / thisComp.frameDuration)
```
