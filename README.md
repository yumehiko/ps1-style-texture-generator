# PS1 Style Texture Generator

通常の画像をPlayStation 1風のレトロゲームテクスチャに変換するmacOS用デスクトップアプリケーション。

![PS1 Style Texture Generator](docs/screenshot.png)

## 特徴

- 🎮 画像解像度の削減（32px〜512px）
- 🎨 色数制限（4〜256色）とディザリング処理
- 👁️ リアルタイム2D/3Dプレビュー（立方体へのテクスチャ自動適用）
- 💾 PNG形式での保存
- 🖥️ レトロターミナル風UI（黒背景・緑文字）

## ダウンロード

最新版は[Releasesページ](https://github.com/yumehiko/ps1-style-texture-generator/releases)からダウンロードできます。

### 対応OS
- macOS（Intel/Apple Silicon）
- Windows（予定）
- Linux（予定）

## 使い方

1. アプリケーションを起動
2. 「ファイルを選択」ボタンをクリックして画像を読み込み
3. パラメータを調整：
   - **解像度**: テクスチャのサイズ（32px〜512px）
   - **色数**: 使用する色の数（4〜256色）
   - **ディザリング**: ディザリング処理の有無
4. 2D/3Dプレビューで結果を確認
5. 「画像を保存」ボタンで保存

## 開発

### 必要な環境
- Node.js 20以上
- npm

### セットアップ
```bash
git clone https://github.com/yumehiko/ps1-style-texture-generator.git
cd ps1-style-texture-generator
npm install
```

### 開発サーバーの起動
```bash
npm run dev
```

### ビルド
```bash
npm run build
```

### アプリケーションのパッケージング
```bash
npm run dist
```

## 技術スタック

- [Electron](https://www.electronjs.org/) - デスクトップアプリケーションフレームワーク
- [React](https://react.dev/) - UIライブラリ
- [TypeScript](https://www.typescriptlang.org/) - 型安全なJavaScript
- [Three.js](https://threejs.org/) - 3Dグラフィックス
- [Vite](https://vitejs.dev/) - ビルドツール

## ライセンス

ISC License