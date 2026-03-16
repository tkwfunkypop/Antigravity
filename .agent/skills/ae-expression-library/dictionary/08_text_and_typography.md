# ✏️ テキスト・タイポグラフィ

sourceText, テキストアニメーター、カウンター等のテキスト関連エクスプレッション集。

---

## 基本テキスト操作

### 📌 sourceText（テキスト内容の動的変更）
**用途**: テキストレイヤーの表示内容をエクスプレッションで制御
**適用先**: Source Text
**難易度**: ⭐

```javascript
// 固定テキスト
"Hello, World!"

// 他レイヤーのテキストを参照
thisComp.layer("DataSource").text.sourceText

// 複数行のテキスト
"1行目\n2行目\n3行目"
```

---

### 📌 タイプライター効果
**用途**: 文字が1文字ずつ表示される
**適用先**: Source Text
**難易度**: ⭐⭐

```javascript
const fullText = "こんにちは、世界！";
const charsPerSec = 5; // 1秒あたりの表示文字数
const elapsed = time - inPoint;
const numChars = Math.min(Math.floor(elapsed * charsPerSec), fullText.length);
fullText.substring(0, numChars)
```

```
0.0s: |
0.2s: こ|
0.4s: こん|
0.6s: こんに|
0.8s: こんにち|
1.0s: こんにちは|
  ...
```

---

### 📌 カーソル付きタイプライター
**用途**: 点滅カーソル付きのタイプライター
**適用先**: Source Text
**難易度**: ⭐⭐

```javascript
const fullText = "Hello World";
const charsPerSec = 5;
const elapsed = time - inPoint;
const numChars = Math.min(Math.floor(elapsed * charsPerSec), fullText.length);
const cursor = (Math.sin(time * 6) > 0) ? "│" : " ";

if (numChars >= fullText.length) {
  fullText + cursor;  // 入力完了後もカーソル点滅
} else {
  fullText.substring(0, numChars) + cursor;
}
```

---

### 📌 数値カウンター
**用途**: 数値がカウントアップ/ダウンする表示
**適用先**: Source Text
**難易度**: ⭐⭐

```javascript
const startVal = 0;
const endVal = 10000;
const duration = 3; // カウント秒数
const decimals = 0; // 小数点以下の桁数

const progress = ease(time, inPoint, inPoint + duration, 0, 1);
const currentVal = startVal + (endVal - startVal) * progress;

// カンマ区切りフォーマット
currentVal.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
```

```
0.0s:      0
0.5s:  1,234
1.0s:  3,456
1.5s:  5,678
2.0s:  7,890
3.0s: 10,000 ← 最終値
```

> [!TIP]
> `decimals = 2` で小数点以下2桁表示。通貨表示には `"¥" +` をプレフィックスに追加。

---

### 📌 スライダーからカウンター表示
**用途**: エフェクトのスライダー値をテキスト表示
**適用先**: Source Text
**難易度**: ⭐

```javascript
const val = effect("Slider Control")("Slider");
Math.round(val).toString()
```

---

### 📌 ゼロパディング（桁揃え）
**用途**: 数値を指定桁数にゼロ埋めして表示
**適用先**: Source Text
**難易度**: ⭐

```javascript
const num = Math.floor(time * 30); // フレームカウンター
const digits = 5; // 桁数
const padded = ("0".repeat(digits) + num).slice(-digits);
padded  // "00001", "00002", ...
```

---

## 時間表示

### 📌 タイムコード表示
**用途**: 現在時刻をタイムコード形式で表示
**適用先**: Source Text
**難易度**: ⭐⭐

```javascript
const fps = 1 / thisComp.frameDuration;
const totalFrames = Math.floor(time * fps);

const hours = Math.floor(totalFrames / (fps * 3600));
const minutes = Math.floor((totalFrames % (fps * 3600)) / (fps * 60));
const seconds = Math.floor((totalFrames % (fps * 60)) / fps);
const frames = totalFrames % fps;

function pad(n) { return ("0" + n).slice(-2); }

pad(hours) + ":" + pad(minutes) + ":" + pad(seconds) + ":" + pad(frames)
// → "00:01:23:15"
```

---

### 📌 日付・時刻の表示
**用途**: 現在の日付や時刻を表示（静的）
**適用先**: Source Text
**難易度**: ⭐

```javascript
// 現在の日付
const d = new Date(2026, 2, 11); // 固定日付の場合
const year = d.getFullYear();
const month = ("0" + (d.getMonth() + 1)).slice(-2);
const day = ("0" + d.getDate()).slice(-2);
year + "/" + month + "/" + day
// → "2026/03/11"
```

---

### 📌 カウントダウン / カウントアップタイマー
**用途**: 経過時間やカウントダウンを表示
**適用先**: Source Text
**難易度**: ⭐⭐

```javascript
// カウントダウンタイマー
const totalSeconds = 60; // 60秒カウントダウン
const remaining = Math.max(0, totalSeconds - (time - inPoint));
const min = Math.floor(remaining / 60);
const sec = Math.floor(remaining % 60);
("0" + min).slice(-2) + ":" + ("0" + sec).slice(-2)
// → "00:59", "00:58", ... "00:00"
```

---

## テキストスタイルの制御

### 📌 テキストスタイルの動的変更（AE 2024+）
**用途**: フォントサイズ、カラーなどをエクスプレッションで制御
**適用先**: Source Text
**難易度**: ⭐⭐⭐

```javascript
// AE 2024以降: テキストスタイルオブジェクト
const style = text.sourceText.createStyle();
style.setFontSize(48)
     .setFillColor([1, 0, 0, 1])
     .setText("Red Large Text");
```

> [!IMPORTANT]
> `createStyle()` は AE 2024 以降でのみ使用可能。旧バージョンでは利用不可。

---

## テキスト演算

### 📌 文字列の結合・操作
**用途**: 複数の値や文字列を組み合わせてテキストを生成
**適用先**: Source Text
**難易度**: ⭐

```javascript
// 文字列結合
"Score: " + Math.round(time * 100)

// テンプレートリテラル
const score = Math.round(time * 100);
`Score: ${score} / Level: ${Math.floor(score / 100) + 1}`

// 改行を含む複数行
const name = thisComp.layer("NameLayer").text.sourceText;
const title = thisComp.layer("TitleLayer").text.sourceText;
`${name}\n${title}`
```

---

### 📌 ランダムテキスト（マトリックス風）
**用途**: ランダムな文字列をフレームごとに生成
**適用先**: Source Text
**難易度**: ⭐⭐

```javascript
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
const length = 20;
let result = "";
for (let i = 0; i < length; i++) {
  seedRandom(i + timeToFrames(time) * 100, true);
  result += chars[Math.floor(random() * chars.length)];
}
result
```

---

### 📌 マーカーテキストの表示
**用途**: レイヤーマーカーのコメントをテキストとして表示
**適用先**: Source Text
**難易度**: ⭐⭐

```javascript
const m = thisLayer.marker;
if (m.numKeys > 0) {
  const idx = m.nearestKey(time).index;
  if (m.key(idx).time <= time) {
    m.key(idx).comment;
  } else if (idx > 1) {
    m.key(idx - 1).comment;
  } else {
    "";
  }
} else {
  "";
}
```

> [!TIP]
> マーカーのコメントに字幕テキストを入れておけば、タイミングごとに自動切替するテロップシステムになる。
