/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeAll } from 'vitest';
import { ImageResizer } from './ImageResizer';

// ImageDataのポリフィル (Node.js環境用)
beforeAll(() => {
  if (typeof ImageData === 'undefined') {
    (globalThis as any).ImageData = class ImageData {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      colorSpace: 'srgb' | 'display-p3';

      constructor(data: Uint8ClampedArray | number, width: number, height?: number) {
        if (data instanceof Uint8ClampedArray) {
          if (data.length !== width * (height ?? 0) * 4) {
            throw new Error('Invalid data length');
          }
          this.data = data;
          this.width = width;
          this.height = height ?? 0;
        } else {
          this.width = data;
          this.height = width;
          this.data = new Uint8ClampedArray(this.width * this.height * 4);
        }
        this.colorSpace = 'srgb';
      }
    };
  }
});

describe('ImageResizer', () => {
  describe('resize', () => {
    it('長辺基準でリサイズし、アスペクト比を維持する (横長画像)', () => {
      const resizer = new ImageResizer();
      const inputWidth = 1920;
      const inputHeight = 1080;
      const targetSize = 256;

      const result = resizer.calculateNewDimensions(inputWidth, inputHeight, targetSize);

      expect(result.width).toBe(256);
      expect(result.height).toBe(144);
      expect(result.width / result.height).toBeCloseTo(inputWidth / inputHeight, 2);
    });

    it('長辺基準でリサイズし、アスペクト比を維持する (縦長画像)', () => {
      const resizer = new ImageResizer();
      const inputWidth = 1080;
      const inputHeight = 1920;
      const targetSize = 256;

      const result = resizer.calculateNewDimensions(inputWidth, inputHeight, targetSize);

      expect(result.width).toBe(144);
      expect(result.height).toBe(256);
      expect(result.width / result.height).toBeCloseTo(inputWidth / inputHeight, 2);
    });

    it('正方形画像は両辺が同じサイズになる', () => {
      const resizer = new ImageResizer();
      const inputWidth = 1024;
      const inputHeight = 1024;
      const targetSize = 256;

      const result = resizer.calculateNewDimensions(inputWidth, inputHeight, targetSize);

      expect(result.width).toBe(256);
      expect(result.height).toBe(256);
    });

    it('既に目標サイズ以下の画像はリサイズしない', () => {
      const resizer = new ImageResizer();
      const inputWidth = 200;
      const inputHeight = 150;
      const targetSize = 256;

      const result = resizer.calculateNewDimensions(inputWidth, inputHeight, targetSize);

      expect(result.width).toBe(200);
      expect(result.height).toBe(150);
    });

    it('ImageData形式の画像をリサイズできる', () => {
      const resizer = new ImageResizer();
      const width = 4;
      const height = 4;
      const data = new Uint8ClampedArray(width * height * 4);
      
      // テスト用のピクセルデータを作成 (赤、緑、青、白のパターン)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          if (x < 2 && y < 2) {
            // 左上: 赤
            data[index] = 255;
            data[index + 1] = 0;
            data[index + 2] = 0;
            data[index + 3] = 255;
          } else if (x >= 2 && y < 2) {
            // 右上: 緑
            data[index] = 0;
            data[index + 1] = 255;
            data[index + 2] = 0;
            data[index + 3] = 255;
          } else if (x < 2 && y >= 2) {
            // 左下: 青
            data[index] = 0;
            data[index + 1] = 0;
            data[index + 2] = 255;
            data[index + 3] = 255;
          } else {
            // 右下: 白
            data[index] = 255;
            data[index + 1] = 255;
            data[index + 2] = 255;
            data[index + 3] = 255;
          }
        }
      }

      const inputImageData: ImageData = {
        data,
        width,
        height,
        colorSpace: 'srgb'
      };

      const result = resizer.resize(inputImageData, 2);

      expect(result.width).toBe(2);
      expect(result.height).toBe(2);
      expect(result.data.length).toBe(2 * 2 * 4);
      
      // 各象限の代表色が保持されていることを確認
      const resultData = result.data;
      // 左上ピクセル (赤)
      expect(resultData[0]).toBeGreaterThan(200);
      expect(resultData[1]).toBeLessThan(50);
      expect(resultData[2]).toBeLessThan(50);
      
      // 右上ピクセル (緑)
      expect(resultData[4]).toBeLessThan(50);
      expect(resultData[5]).toBeGreaterThan(200);
      expect(resultData[6]).toBeLessThan(50);
    });

    it('アルファチャンネルを保持する', () => {
      const resizer = new ImageResizer();
      const width = 2;
      const height = 2;
      const data = new Uint8ClampedArray(width * height * 4);
      
      // 半透明の赤いピクセルを作成
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255;     // R
        data[i + 1] = 0;   // G
        data[i + 2] = 0;   // B
        data[i + 3] = 128; // A (半透明)
      }

      const inputImageData: ImageData = {
        data,
        width,
        height,
        colorSpace: 'srgb'
      };

      const result = resizer.resize(inputImageData, 1);

      expect(result.width).toBe(1);
      expect(result.height).toBe(1);
      expect(result.data[3]).toBeCloseTo(128, 0);
    });

    it('無効な入力に対してエラーを投げる', () => {
      const resizer = new ImageResizer();

      expect(() => {
        resizer.calculateNewDimensions(0, 100, 256);
      }).toThrow('Invalid dimensions');

      expect(() => {
        resizer.calculateNewDimensions(100, 0, 256);
      }).toThrow('Invalid dimensions');

      expect(() => {
        resizer.calculateNewDimensions(100, 100, 0);
      }).toThrow('Invalid target size');
    });
  });

  describe('パフォーマンス', () => {
    it('大きな画像でも効率的にリサイズできる', () => {
      const resizer = new ImageResizer();
      const width = 1920;
      const height = 1080;
      const data = new Uint8ClampedArray(width * height * 4);

      const inputImageData: ImageData = {
        data,
        width,
        height,
        colorSpace: 'srgb'
      };

      const startTime = performance.now();
      const result = resizer.resize(inputImageData, 256);
      const endTime = performance.now();

      expect(result.width).toBe(256);
      expect(result.height).toBe(144);
      expect(endTime - startTime).toBeLessThan(100); // 100ms以内
    });
  });
});