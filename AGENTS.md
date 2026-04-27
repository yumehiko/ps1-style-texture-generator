# PS1スタイルテクスチャジェネレーター

## 概要
通常の画像をPlayStation 1風のレトロゲームテクスチャに変換するmacOS用デスクトップアプリ。
- 画像の解像度削減（32-512px）
- 色数制限（4-256色）とディザリング処理
- リアルタイム2D/3Dプレビュー（立方体へのテクスチャ自動適用）
- PNG形式での保存

## 技術スタック
- Electron + React + TypeScript + Vite
- Three.js（3Dプレビュー）
- Web Workers（非同期画像処理）
- レトロターミナル風UI（黒背景・緑文字）

## 基本コマンド
```bash
# Lint実行
npm run lint

# 型チェック
npm run typecheck

# テスト実行（応答不要）
npm test -- --run
```

## プロジェクト構造
- `/src/main/` - Electronメインプロセス
- `/src/renderer/` - レンダラープロセス（React UI）
- `/src/renderer/core/` - 画像処理コアロジック
- `/src/renderer/components/` - UIコンポーネント
- `/specs/core/` - 要件・設計・タスク管理