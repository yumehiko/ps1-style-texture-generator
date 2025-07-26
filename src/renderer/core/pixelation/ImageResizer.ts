export interface Dimensions {
  width: number;
  height: number;
}

export class ImageResizer {
  calculateNewDimensions(width: number, height: number, targetSize: number): Dimensions {
    if (width <= 0 || height <= 0) {
      throw new Error('Invalid dimensions');
    }
    if (targetSize <= 0) {
      throw new Error('Invalid target size');
    }

    const longerSide = Math.max(width, height);

    // 既に目標サイズ以下の場合はそのまま返す
    if (longerSide <= targetSize) {
      return { width, height };
    }

    // 長辺を基準にスケール率を計算
    const scale = targetSize / longerSide;

    return {
      width: Math.round(width * scale),
      height: Math.round(height * scale)
    };
  }

  resize(imageData: ImageData, targetSize: number): ImageData {
    const { width: newWidth, height: newHeight } = this.calculateNewDimensions(
      imageData.width,
      imageData.height,
      targetSize
    );

    // 元のサイズと同じ場合はそのまま返す
    if (newWidth === imageData.width && newHeight === imageData.height) {
      return new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
      );
    }

    // 新しいImageDataを作成
    const newData = new Uint8ClampedArray(newWidth * newHeight * 4);
    
    // バイリニア補間でリサイズ
    const scaleX = imageData.width / newWidth;
    const scaleY = imageData.height / newHeight;

    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const srcX = x * scaleX;
        const srcY = y * scaleY;

        // 四隅の座標
        const x0 = Math.floor(srcX);
        const x1 = Math.min(x0 + 1, imageData.width - 1);
        const y0 = Math.floor(srcY);
        const y1 = Math.min(y0 + 1, imageData.height - 1);

        // 補間係数
        const fx = srcX - x0;
        const fy = srcY - y0;

        // 四隅のピクセルインデックス
        const idx00 = (y0 * imageData.width + x0) * 4;
        const idx01 = (y0 * imageData.width + x1) * 4;
        const idx10 = (y1 * imageData.width + x0) * 4;
        const idx11 = (y1 * imageData.width + x1) * 4;

        // 目標ピクセルのインデックス
        const targetIdx = (y * newWidth + x) * 4;

        // バイリニア補間
        for (let i = 0; i < 4; i++) {
          const v00 = imageData.data[idx00 + i];
          const v01 = imageData.data[idx01 + i];
          const v10 = imageData.data[idx10 + i];
          const v11 = imageData.data[idx11 + i];

          const v0 = v00 * (1 - fx) + v01 * fx;
          const v1 = v10 * (1 - fx) + v11 * fx;
          const v = v0 * (1 - fy) + v1 * fy;

          newData[targetIdx + i] = Math.round(v);
        }
      }
    }

    return new ImageData(newData, newWidth, newHeight);
  }
}