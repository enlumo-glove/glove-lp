# ENLUMO 3D Customizer v2

GitHub Pages用です。

## 必須ファイル
このフォルダ直下に `glove.glb` を置いてください。

- index.html
- styles.css
- app.js
- glove.glb ← 3Dグローブ本体

GLB内のメッシュ/マテリアル名に `lace` が入る部分はレース色、
`stitch` が入る部分はステッチ色、それ以外は本体色として扱います。

刺繍文字の「3Dモデル表面への貼り付け」は、実際のglove.glbの形状・UVを確認してから次段階で実装する想定です。
