# 🎯 作例ギャラリー — グリッド系

完成形のエクスプレッションセットを、AE ワークフロー付きで保存した作例集。

---

## 作例 01: ウェーブ付きグリッド

**概要**: グリッド配置しつつ、波のように揺れる動き
**プロパティ数**: 1（Position）
**レイヤー数**: 25（5×5）
**難易度**: ⭐⭐

### AE ワークフロー
1. コンポ: `1920×1080`, `30fps`, `10秒`
2. **シェイプレイヤー → 楕円ツール** ダブルクリック → サイズ `[80, 80]`
3. Position に下記エクスプレッション適用
4. `⌘+D` で24回複製（計25個）
5. カラーバリエーション: 塗りカラーに `hslToRgb([(index-1)/thisComp.numLayers, 0.7, 0.5, 1])` を適用

### Position
```javascript
const columns = 5;
const spacingX = 200;
const spacingY = 200;
const startX = 160;
const startY = 160;

const col = (index - 1) % columns;
const row = Math.floor((index - 1) / columns);
const wave = Math.sin((time * 2 - row * 0.3 - col * 0.2) * 2 * Math.PI) * 30;

[startX + col * spacingX, startY + row * spacingY + wave]
```

---

## 作例 02: 爆発→グリッド集合

**概要**: ランダム位置からグリッドに整列するアニメーション
**プロパティ数**: 3（Position, Rotation, Scale）
**レイヤー数**: 16（4×4）
**難易度**: ⭐⭐

### AE ワークフロー
1. コンポ: `1920×1080`, `30fps`, `5秒`
2. **シェイプレイヤー → 長方形ツール** ダブルクリック → サイズ `[160, 160]`, 角丸 `20`
3. Position, Rotation, Scale に各エクスプレッション適用
4. `⌘+D` で15回複製（計16個）
5. 色バリエーション（塗りカラー）:
   ```
   seedRandom(index, true);
   const p = [hexToRgb("#FF6633"), hexToRgb("#3399FF"), hexToRgb("#33CC66"), hexToRgb("#FF33CC")];
   p[Math.floor(random(0, p.length))]
   ```

### Position
```javascript
const columns = 4;
const spacingX = 200;
const spacingY = 200;
const startX = 280;
const startY = 200;

const col = (index - 1) % columns;
const row = Math.floor((index - 1) / columns);
const gridPos = [startX + col * spacingX, startY + row * spacingY];

seedRandom(index, true);
const randomPos = [random(0, thisComp.width), random(0, thisComp.height)];

const delay = (index - 1) * 0.05;
const t = ease(time, inPoint + delay, inPoint + delay + 0.8, 0, 1);
linear(t, 0, 1, randomPos, gridPos)
```

### Rotation
```javascript
seedRandom(index, true);
const startRot = random(-180, 180);
const delay = (index - 1) * 0.05;
const t = ease(time, inPoint + delay, inPoint + delay + 0.8, 0, 1);
linear(t, 0, 1, startRot, 0)
```

### Scale
```javascript
const delay = (index - 1) * 0.05;
const t = ease(time, inPoint + delay, inPoint + delay + 0.6, 0, 1);
const overshoot = t + Math.sin(t * Math.PI) * 0.2 * (1 - t);
const s = overshoot * 100;
[s, s]
```

---

## 作例 03: 呼吸するグリッド

**概要**: 中心から脈打つように膨張収縮するドットグリッド
**プロパティ数**: 3（Position, Scale, Opacity）
**レイヤー数**: 64（8×8）
**背景**: 黒 `#111111`
**難易度**: ⭐⭐

### AE ワークフロー
1. コンポ: `1920×1080`, `30fps`, `10秒`
2. **レイヤー → 新規 → 平面** → 黒（`#111111`）→ 一番下に配置
3. **シェイプレイヤー → 楕円ツール** ダブルクリック → サイズ `[40, 40]`, 塗り: 白
4. Position, Scale, Opacity に各エクスプレッション適用
5. `⌘+D` で63回複製（計64個）倍々で増やすと効率的

### Position
```javascript
const columns = 8;
const center = [thisComp.width / 2, thisComp.height / 2];
const baseSpacing = 120;

const col = (index - 1) % columns - (columns - 1) / 2;
const row = Math.floor((index - 1) / columns) - (columns - 1) / 2;

const breathe = 1 + Math.sin(time * 1.5) * 0.2;

center + [col * baseSpacing * breathe, row * baseSpacing * breathe]
```

### Scale
```javascript
const breathe = Math.sin(time * 1.5);
const columns = 8;
const col = (index - 1) % columns - (columns - 1) / 2;
const row = Math.floor((index - 1) / columns) - (columns - 1) / 2;
const distFromCenter = Math.sqrt(col * col + row * row);

const s = 100 + breathe * (30 - distFromCenter * 3);
[Math.max(20, s), Math.max(20, s)]
```

### Opacity
```javascript
const columns = 8;
const col = (index - 1) % columns - (columns - 1) / 2;
const row = Math.floor((index - 1) / columns) - (columns - 1) / 2;
const distFromCenter = Math.sqrt(col * col + row * row);
linear(distFromCenter, 0, 5, 100, 30)
```

---

## 作例 04: Instagram ギャラリー風ポップアップ

**概要**: 写真が左上から順にポップアップするギャラリー
**プロパティ数**: 3（Position, Scale, Opacity）
**レイヤー数**: 9（3×3、画像レイヤー）
**難易度**: ⭐⭐

### AE ワークフロー
1. コンポ: `1920×1080`, `30fps`, `5秒`
2. 9枚の画像をプロジェクトにインポート
3. 全画像をタイムラインにドラッグ → 各画像の Scale を `[17, 17]` に調整
4. 各プロパティにエクスプレッション適用
5. 仕上げ: **エフェクト → 遠近 → ドロップシャドウ**（距離5, 柔らかさ15, 不透明度40%）

### Position
```javascript
const columns = 3;
const spacingX = 350;
const spacingY = 350;
const startX = 285;
const startY = 190;

const col = (index - 1) % columns;
const row = Math.floor((index - 1) / columns);
[startX + col * spacingX, startY + row * spacingY]
```

### Scale
```javascript
const delay = (index - 1) * 0.15;
const t = ease(time, inPoint + delay, inPoint + delay + 0.4, 0, 1);
const overshoot = t + Math.sin(t * Math.PI) * 0.15 * (1 - t);
const s = overshoot * 17;
[s, s]
```

### Opacity
```javascript
const delay = (index - 1) * 0.15;
ease(time, inPoint + delay, inPoint + delay + 0.3, 0, 100)
```

---

## 作例 05: マウス追従グリッド（色相グラデーション付き）

**概要**: ポインターレイヤーの位置にグリッドが反応し、位置・サイズ・色・透明度が変化
**プロパティ数**: 4（Position, Scale, Fill Color, Opacity）
**レイヤー数**: 65（Pointer 1個 + 8×8 グリッド）
**難易度**: ⭐⭐⭐

### AE ワークフロー
1. コンポ: `1920×1080`, `30fps`, `10秒`
2. **レイヤー → 新規 → 平面** → 黒（`#111111`）→ 一番下に配置
3. **Pointer レイヤー作成**:
   - シェイプレイヤー → 楕円ツール → サイズ `[100, 100]`, 塗り: 白, Opacity: `80%`
   - 名前を `Pointer` に変更 → **一番上に配置**
   - Position にキーフレーム設定（自由な軌跡）→ `F9` でイージーイーズ
4. **グリッドセル作成**:
   - シェイプレイヤー → 長方形ツール → サイズ `[60, 60]`, 角丸 `10`, 塗り: 仮の色
5. Position, Scale, 塗りカラー, Opacity に各エクスプレッション適用
6. `⌘+D` で63回複製（計64個グリッドセル）

> ⚠️ Pointer が index=1 なので、グリッドは `index - 2` を基準にする

### Position
```javascript
const columns = 8;
const spacing = 120;
const startX = (thisComp.width - (columns - 1) * spacing) / 2;
const startY = (thisComp.height - (columns - 1) * spacing) / 2;

const col = (index - 2) % columns;
const row = Math.floor((index - 2) / columns);
const gridPos = [startX + col * spacing, startY + row * spacing];

const pointer = thisComp.layer("Pointer").transform.position;
const dist = length(gridPos, pointer);
const influence = Math.max(0, 1 - dist / 300);
const dir = (dist > 0) ? normalize(gridPos - pointer) : [0, 0];

gridPos + dir * influence * 80
```

### Scale
```javascript
const columns = 8;
const spacing = 120;
const startX = (thisComp.width - (columns - 1) * spacing) / 2;
const startY = (thisComp.height - (columns - 1) * spacing) / 2;
const col = (index - 2) % columns;
const row = Math.floor((index - 2) / columns);
const gridPos = [startX + col * spacing, startY + row * spacing];

const pointer = thisComp.layer("Pointer").transform.position;
const dist = length(gridPos, pointer);
const influence = Math.max(0, 1 - dist / 300);
const s = 100 + influence * 60;
[s, s]
```

### 塗りカラー（Fill → Color）
```javascript
const columns = 8;
const spacing = 120;
const startX = (thisComp.width - (columns - 1) * spacing) / 2;
const startY = (thisComp.height - (columns - 1) * spacing) / 2;
const col = (index - 2) % columns;
const row = Math.floor((index - 2) / columns);
const gridPos = [startX + col * spacing, startY + row * spacing];

const pointer = thisComp.layer("Pointer").transform.position;
const dist = length(gridPos, pointer);
const influence = clamp(1 - dist / 500, 0, 1);

const hueFromPosition = (col + row) / (columns * 2);
const hueFromTime = time * 0.15;
const hueFromPointer = influence * 0.3;
const hue = (hueFromPosition + hueFromTime + hueFromPointer) % 1;

const saturation = linear(influence, 0, 1, 0.4, 1.0);
const lightness = linear(influence, 0, 1, 0.35, 0.65);

hslToRgb([hue, saturation, lightness, 1])
```

### Opacity
```javascript
const columns = 8;
const spacing = 120;
const startX = (thisComp.width - (columns - 1) * spacing) / 2;
const startY = (thisComp.height - (columns - 1) * spacing) / 2;
const col = (index - 2) % columns;
const row = Math.floor((index - 2) / columns);
const gridPos = [startX + col * spacing, startY + row * spacing];

const pointer = thisComp.layer("Pointer").transform.position;
const dist = length(gridPos, pointer);
linear(dist, 0, 600, 100, 40)
```
