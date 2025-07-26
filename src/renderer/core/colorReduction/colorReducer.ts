export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export class ColorReducer {
  private palette: Color[] = [];

  /**
   * 画像の色数を指定された数に削減する
   * @param imageData 元の画像データ
   * @param colorCount 削減後の色数 (4-256)
   * @returns 色数削減後の画像データ
   */
  reduceColors(imageData: ImageData, colorCount: number): ImageData {
    // 画像からユニークな色を抽出
    const uniqueColors = this.extractUniqueColors(imageData);
    
    // 既に指定色数以下の場合はそのまま返す
    if (uniqueColors.length <= colorCount) {
      this.palette = uniqueColors;
      return new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
      );
    }

    // k-means法でパレットを生成
    this.palette = this.generatePalette(imageData, colorCount);

    // 各ピクセルを最も近いパレット色に置き換え
    const result = new ImageData(imageData.width, imageData.height);
    const data = imageData.data;
    const resultData = result.data;

    for (let i = 0; i < data.length; i += 4) {
      const color = {
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
        a: data[i + 3]
      };

      const nearestColor = this.findNearestColor(color);
      resultData[i] = nearestColor.r;
      resultData[i + 1] = nearestColor.g;
      resultData[i + 2] = nearestColor.b;
      resultData[i + 3] = nearestColor.a;
    }

    return result;
  }

  /**
   * k-means法でカラーパレットを生成する
   * @param imageData 元の画像データ
   * @param k クラスタ数（パレットの色数）
   * @returns 生成されたカラーパレット
   */
  generatePalette(imageData: ImageData, k: number): Color[] {
    const pixels = this.extractPixels(imageData);
    
    // 空の画像の場合は空のパレットを返す
    if (pixels.length === 0) {
      return [];
    }

    // 初期クラスタ中心をランダムに選択
    const centers = this.initializeCenters(pixels, k);
    
    // k-meansアルゴリズムの実行
    const maxIterations = 10;
    for (let iter = 0; iter < maxIterations; iter++) {
      // 各ピクセルを最も近いクラスタに割り当て
      const clusters: Color[][] = Array(k).fill(null).map(() => []);
      
      for (const pixel of pixels) {
        const nearestIndex = this.findNearestCenterIndex(pixel, centers);
        clusters[nearestIndex].push(pixel);
      }

      // クラスタ中心を更新
      let hasChanged = false;
      for (let i = 0; i < k; i++) {
        if (clusters[i].length > 0) {
          const newCenter = this.calculateCentroid(clusters[i]);
          if (!this.colorsEqual(centers[i], newCenter)) {
            centers[i] = newCenter;
            hasChanged = true;
          }
        }
      }

      // 収束したら終了
      if (!hasChanged) {
        break;
      }
    }

    // 空のクラスタを除外
    return centers.filter(center => center !== null);
  }

  /**
   * 現在のカラーパレットを取得する
   * @returns カラーパレット
   */
  getColorPalette(): Color[] {
    return this.palette;
  }

  /**
   * 画像からユニークな色を抽出する
   */
  private extractUniqueColors(imageData: ImageData): Color[] {
    const colorMap = new Map<string, Color>();
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const key = `${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3]}`;
      if (!colorMap.has(key)) {
        colorMap.set(key, {
          r: data[i],
          g: data[i + 1],
          b: data[i + 2],
          a: data[i + 3]
        });
      }
    }

    return Array.from(colorMap.values());
  }

  /**
   * 画像からピクセルデータを抽出する
   */
  private extractPixels(imageData: ImageData): Color[] {
    const pixels: Color[] = [];
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // 完全に透明なピクセルは除外
      if (data[i + 3] > 0) {
        pixels.push({
          r: data[i],
          g: data[i + 1],
          b: data[i + 2],
          a: data[i + 3]
        });
      }
    }

    return pixels;
  }

  /**
   * k-meansの初期クラスタ中心を選択する
   */
  private initializeCenters(pixels: Color[], k: number): Color[] {
    const centers: Color[] = [];
    const used = new Set<string>();

    // k++初期化（簡易版）
    while (centers.length < k && centers.length < pixels.length) {
      const index = Math.floor(Math.random() * pixels.length);
      const pixel = pixels[index];
      const key = `${pixel.r},${pixel.g},${pixel.b},${pixel.a}`;
      
      if (!used.has(key)) {
        centers.push({ ...pixel });
        used.add(key);
      }
    }

    return centers;
  }

  /**
   * 最も近いクラスタ中心のインデックスを見つける
   */
  private findNearestCenterIndex(color: Color, centers: Color[]): number {
    let minDistance = Infinity;
    let nearestIndex = 0;

    for (let i = 0; i < centers.length; i++) {
      const distance = this.colorDistance(color, centers[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    return nearestIndex;
  }

  /**
   * 色のリストの重心を計算する
   */
  private calculateCentroid(colors: Color[]): Color {
    if (colors.length === 0) {
      return { r: 0, g: 0, b: 0, a: 255 };
    }

    const sum = colors.reduce(
      (acc, color) => ({
        r: acc.r + color.r,
        g: acc.g + color.g,
        b: acc.b + color.b,
        a: acc.a + color.a
      }),
      { r: 0, g: 0, b: 0, a: 0 }
    );

    return {
      r: Math.round(sum.r / colors.length),
      g: Math.round(sum.g / colors.length),
      b: Math.round(sum.b / colors.length),
      a: Math.round(sum.a / colors.length)
    };
  }

  /**
   * パレットから最も近い色を見つける
   */
  private findNearestColor(color: Color): Color {
    let minDistance = Infinity;
    let nearestColor = this.palette[0];

    for (const paletteColor of this.palette) {
      const distance = this.colorDistance(color, paletteColor);
      if (distance < minDistance) {
        minDistance = distance;
        nearestColor = paletteColor;
      }
    }

    return nearestColor;
  }

  /**
   * 2つの色の距離を計算する（ユークリッド距離）
   */
  private colorDistance(c1: Color, c2: Color): number {
    const dr = c1.r - c2.r;
    const dg = c1.g - c2.g;
    const db = c1.b - c2.b;
    const da = c1.a - c2.a;
    return Math.sqrt(dr * dr + dg * dg + db * db + da * da);
  }

  /**
   * 2つの色が等しいかチェックする
   */
  private colorsEqual(c1: Color, c2: Color): boolean {
    return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && c1.a === c2.a;
  }
}