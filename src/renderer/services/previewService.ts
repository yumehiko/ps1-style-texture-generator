import type { ImageData } from '../types/image';

interface PreviewData {
  processedImage: ImageData | null;
  canvasElement: HTMLCanvasElement | null;
  textureData: ImageData | null;
}

interface PreviewUpdateOptions {
  imageData: ImageData;
  targetCanvas?: HTMLCanvasElement;
}

class PreviewService {
  private previewData: PreviewData = {
    processedImage: null,
    canvasElement: null,
    textureData: null,
  };

  private subscribers: Set<(data: PreviewData) => void> = new Set();

  /**
   * プレビューデータを更新
   */
  async updatePreview(options: PreviewUpdateOptions): Promise<void> {
    try {
      const { imageData, targetCanvas } = options;

      // 処理済み画像データを保存
      this.previewData.processedImage = {
        width: imageData.width,
        height: imageData.height,
        data: new Uint8ClampedArray(imageData.data),
      };

      // 2Dプレビュー用のCanvas更新
      if (targetCanvas) {
        this.previewData.canvasElement = targetCanvas;
        await this.updateCanvas(targetCanvas, imageData);
      }

      // 3Dテクスチャ用データを準備
      this.previewData.textureData = {
        width: imageData.width,
        height: imageData.height,
        data: new Uint8ClampedArray(imageData.data),
      };

      // 購読者に通知
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to update preview:', error);
      throw new Error('Preview update failed');
    }
  }

  /**
   * Canvasに画像データを描画
   */
  private async updateCanvas(canvas: HTMLCanvasElement, imageData: ImageData): Promise<void> {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }

    // Canvasのサイズを画像に合わせる
    canvas.width = imageData.width;
    canvas.height = imageData.height;

    // ImageDataオブジェクトを作成して描画
    const canvasImageData = new ImageData(
      imageData.data,
      imageData.width,
      imageData.height
    );
    ctx.putImageData(canvasImageData, 0, 0);
  }

  /**
   * 現在のプレビューデータを取得
   */
  getPreviewData(): PreviewData {
    return { ...this.previewData };
  }

  /**
   * 処理済み画像データを取得
   */
  getProcessedImage(): ImageData | null {
    return this.previewData.processedImage
      ? {
          width: this.previewData.processedImage.width,
          height: this.previewData.processedImage.height,
          data: new Uint8ClampedArray(this.previewData.processedImage.data),
        }
      : null;
  }

  /**
   * 3Dテクスチャ用データを取得
   */
  getTextureData(): ImageData | null {
    return this.previewData.textureData
      ? {
          width: this.previewData.textureData.width,
          height: this.previewData.textureData.height,
          data: new Uint8ClampedArray(this.previewData.textureData.data),
        }
      : null;
  }

  /**
   * プレビューデータをクリア
   */
  clearPreview(): void {
    this.previewData = {
      processedImage: null,
      canvasElement: null,
      textureData: null,
    };
    this.notifySubscribers();
  }

  /**
   * 変更を購読
   */
  subscribe(callback: (data: PreviewData) => void): () => void {
    this.subscribers.add(callback);
    
    // 初回呼び出し
    callback(this.getPreviewData());
    
    // 購読解除関数を返す
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * 購読者に通知
   */
  private notifySubscribers(): void {
    const data = this.getPreviewData();
    this.subscribers.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error('Subscriber callback error:', error);
      }
    });
  }

  /**
   * Canvas要素からBlobを生成（保存用）
   */
  async toBlob(format: 'png' | 'jpeg' = 'png', quality = 1.0): Promise<Blob | null> {
    if (!this.previewData.canvasElement) {
      console.error('No canvas element available for blob conversion');
      return null;
    }

    return new Promise((resolve) => {
      this.previewData.canvasElement!.toBlob(
        (blob) => resolve(blob),
        `image/${format}`,
        quality
      );
    });
  }

  /**
   * メモリクリーンアップ
   */
  dispose(): void {
    this.clearPreview();
    this.subscribers.clear();
  }
}

// シングルトンインスタンスをエクスポート
export const previewService = new PreviewService();