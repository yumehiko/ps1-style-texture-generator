import { describe, it, expect, beforeEach } from 'vitest';
import { ColorReducer } from './colorReducer';

describe('ColorReducer', () => {
  let colorReducer: ColorReducer;

  beforeEach(() => {
    colorReducer = new ColorReducer();
  });

  describe('色数削減', () => {
    it('4色に削減できる', () => {
      const imageData = new ImageData(
        new Uint8ClampedArray([
          255, 0, 0, 255,    // 赤
          0, 255, 0, 255,    // 緑
          0, 0, 255, 255,    // 青
          255, 255, 0, 255,  // 黄
          128, 128, 128, 255 // グレー
        ]),
        5, 1
      );

      const result = colorReducer.reduceColors(imageData, 4);
      
      // パレットが4色になっていることを確認
      const palette = colorReducer.getColorPalette();
      expect(palette.length).toBe(4);
      
      // 結果の画像データのサイズが正しいことを確認
      expect(result.width).toBe(5);
      expect(result.height).toBe(1);
      expect(result.data.length).toBe(20); // 5ピクセル × 4チャンネル
    });

    it('256色に削減できる', () => {
      // グラデーション画像を作成（300色）
      const pixels = 300;
      const data = new Uint8ClampedArray(pixels * 4);
      for (let i = 0; i < pixels; i++) {
        data[i * 4] = i % 256;     // R
        data[i * 4 + 1] = (i * 2) % 256; // G
        data[i * 4 + 2] = (i * 3) % 256; // B
        data[i * 4 + 3] = 255;     // A
      }
      const imageData = new ImageData(data, pixels, 1);

      colorReducer.reduceColors(imageData, 256);
      
      // パレットが256色以下になっていることを確認
      const palette = colorReducer.getColorPalette();
      expect(palette.length).toBeLessThanOrEqual(256);
      expect(palette.length).toBeGreaterThan(0);
    });

    it('既に指定色数以下の場合はそのまま返す', () => {
      const imageData = new ImageData(
        new Uint8ClampedArray([
          255, 0, 0, 255,   // 赤
          0, 255, 0, 255    // 緑
        ]),
        2, 1
      );

      colorReducer.reduceColors(imageData, 16);
      
      // パレットが元の色数（2色）になっていることを確認
      const palette = colorReducer.getColorPalette();
      expect(palette.length).toBe(2);
    });
  });

  describe('カラーパレット生成', () => {
    it('k-means法でパレットを生成できる', () => {
      const imageData = new ImageData(
        new Uint8ClampedArray([
          255, 0, 0, 255,    // 赤
          250, 5, 5, 255,    // ほぼ赤
          0, 255, 0, 255,    // 緑
          5, 250, 5, 255,    // ほぼ緑
          0, 0, 255, 255,    // 青
          5, 5, 250, 255     // ほぼ青
        ]),
        6, 1
      );

      const palette = colorReducer.generatePalette(imageData, 3);
      
      // 3色のパレットが生成されることを確認
      expect(palette.length).toBe(3);
      
      // 各色がRGBA形式であることを確認
      palette.forEach(color => {
        expect(color).toHaveProperty('r');
        expect(color).toHaveProperty('g');
        expect(color).toHaveProperty('b');
        expect(color).toHaveProperty('a');
        expect(color.r).toBeGreaterThanOrEqual(0);
        expect(color.r).toBeLessThanOrEqual(255);
        expect(color.g).toBeGreaterThanOrEqual(0);
        expect(color.g).toBeLessThanOrEqual(255);
        expect(color.b).toBeGreaterThanOrEqual(0);
        expect(color.b).toBeLessThanOrEqual(255);
        expect(color.a).toBe(255);
      });
    });
  });

  describe('エッジケース', () => {
    it('単色画像を処理できる', () => {
      const imageData = new ImageData(
        new Uint8ClampedArray([
          128, 128, 128, 255,
          128, 128, 128, 255,
          128, 128, 128, 255,
          128, 128, 128, 255
        ]),
        2, 2
      );

      colorReducer.reduceColors(imageData, 16);
      
      // パレットが1色になっていることを確認
      const palette = colorReducer.getColorPalette();
      expect(palette.length).toBe(1);
      expect(palette[0]).toEqual({ r: 128, g: 128, b: 128, a: 255 });
    });

    it('透明度を含む画像を処理できる', () => {
      const imageData = new ImageData(
        new Uint8ClampedArray([
          255, 0, 0, 255,   // 不透明な赤
          255, 0, 0, 128,   // 半透明な赤
          0, 255, 0, 64,    // より透明な緑
          0, 0, 255, 0      // 完全に透明な青
        ]),
        4, 1
      );

      const result = colorReducer.reduceColors(imageData, 4);
      
      // 透明度が保持されていることを確認
      expect(result.data[3]).toBe(255);  // 不透明
      expect(result.data[7]).toBe(128);  // 半透明
      expect(result.data[11]).toBe(64);  // より透明
      expect(result.data[15]).toBe(0);   // 完全に透明
    });

    it('空の画像でエラーにならない', () => {
      const imageData = new ImageData(1, 1);
      
      expect(() => {
        colorReducer.reduceColors(imageData, 16);
      }).not.toThrow();
    });
  });

  describe('パフォーマンス', () => {
    it('大きな画像でも適切な時間で処理できる', () => {
      // 256x256のランダムな画像を作成
      const size = 256;
      const data = new Uint8ClampedArray(size * size * 4);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.floor(Math.random() * 256);     // R
        data[i + 1] = Math.floor(Math.random() * 256); // G
        data[i + 2] = Math.floor(Math.random() * 256); // B
        data[i + 3] = 255;                             // A
      }
      const imageData = new ImageData(data, size, size);

      const startTime = performance.now();
      colorReducer.reduceColors(imageData, 16);
      const endTime = performance.now();
      
      // 処理時間が適切な範囲内（例：500ms以内）であることを確認
      expect(endTime - startTime).toBeLessThan(500);
    });
  });
});