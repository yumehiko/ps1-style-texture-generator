import { ProcessingParams } from '../types/processing';
import { ProcessedImageData } from '../types/image';

// Web Workerのインポート（Vite方式）
import ImageProcessingWorker from '../workers/imageProcessing.worker.ts?worker';

// 処理リクエストの型定義
export interface ProcessingRequest {
  type: 'process';
  id: string;
  imageData: ImageData;
  params: ProcessingParams;
}

// 処理レスポンスの型定義
export interface ProcessingResponse {
  type: 'result' | 'error' | 'progress';
  id: string;
  result?: ImageData;
  error?: string;
  progress?: number;
}

// プログレスコールバックの型定義
export type ProgressCallback = (progress: number) => void;

// 処理結果の型定義
export interface ProcessingResult {
  success: boolean;
  data?: ProcessedImageData;
  error?: string;
}

/**
 * 画像処理サービスクラス
 * Web Workerを使用して非同期で画像処理を実行
 */
class ImageProcessorService {
  private worker: Worker | null = null;
  private processingQueue: Map<string, {
    resolve: (result: ProcessingResult) => void;
    reject: (error: Error) => void;
    progressCallback?: ProgressCallback;
  }> = new Map();
  
  constructor() {
    this.initializeWorker();
  }
  
  /**
   * Web Workerを初期化
   */
  private initializeWorker(): void {
    try {
      this.worker = new ImageProcessingWorker();
      this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
      this.worker.addEventListener('error', this.handleWorkerError.bind(this));
    } catch (error) {
      console.error('Failed to initialize Web Worker:', error);
    }
  }
  
  /**
   * Workerからのメッセージを処理
   */
  private handleWorkerMessage(event: MessageEvent<ProcessingResponse>): void {
    const { type, id, result, error, progress } = event.data;
    const pending = this.processingQueue.get(id);
    
    if (!pending) {
      console.warn(`No pending request found for id: ${id}`);
      return;
    }
    
    switch (type) {
      case 'result':
        if (result) {
          // ImageDataをProcessedImageDataに変換
          const processedData: ProcessedImageData = {
            width: result.width,
            height: result.height,
            data: result.data
          };
          pending.resolve({ success: true, data: processedData });
        } else {
          pending.resolve({ success: false, error: 'No result data' });
        }
        this.processingQueue.delete(id);
        break;
        
      case 'error':
        pending.resolve({ success: false, error: error || 'Unknown error' });
        this.processingQueue.delete(id);
        break;
        
      case 'progress':
        if (pending.progressCallback && typeof progress === 'number') {
          pending.progressCallback(progress);
        }
        break;
    }
  }
  
  /**
   * Workerのエラーを処理
   */
  private handleWorkerError(error: ErrorEvent): void {
    console.error('Worker error:', error);
    
    // すべての保留中のリクエストをエラーで終了
    this.processingQueue.forEach((pending) => {
      pending.reject(new Error('Worker error occurred'));
    });
    this.processingQueue.clear();
    
    // Workerを再初期化
    this.terminateWorker();
    this.initializeWorker();
  }
  
  /**
   * 画像を処理
   */
  async processImage(
    imageData: ProcessedImageData,
    params: ProcessingParams,
    progressCallback?: ProgressCallback
  ): Promise<ProcessingResult> {
    if (!this.worker) {
      return { success: false, error: 'Worker not initialized' };
    }
    
    // リクエストIDを生成
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise<ProcessingResult>((resolve, reject) => {
      // キューに追加
      this.processingQueue.set(id, { resolve, reject, progressCallback });
      
      try {
        // Workerにメッセージを送信
        // ProcessedImageDataをImageDataに変換
        const nativeImageData = new ImageData(
          new Uint8ClampedArray(imageData.data),
          imageData.width,
          imageData.height
        );
        
        const request: ProcessingRequest = {
          type: 'process',
          id,
          imageData: this.cloneImageData(nativeImageData),
          params
        };
        
        this.worker!.postMessage(request);
      } catch (error) {
        // 送信エラーの場合はキューから削除
        this.processingQueue.delete(id);
        reject(error);
      }
    });
  }
  
  /**
   * ImageDataをクローン（構造化クローンアルゴリズムを使用）
   */
  private cloneImageData(imageData: ImageData): ImageData {
    return new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );
  }
  
  /**
   * 現在処理中のタスク数を取得
   */
  getProcessingCount(): number {
    return this.processingQueue.size;
  }
  
  /**
   * すべての処理をキャンセル
   */
  cancelAllProcessing(): void {
    this.processingQueue.forEach((pending) => {
      pending.resolve({ success: false, error: 'Processing cancelled' });
    });
    this.processingQueue.clear();
  }
  
  /**
   * Workerを終了
   */
  terminateWorker(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
  
  /**
   * クリーンアップ
   */
  dispose(): void {
    this.cancelAllProcessing();
    this.terminateWorker();
  }
}

// シングルトンインスタンスをエクスポート
export const imageProcessor = new ImageProcessorService();

// テスト用にクラスもエクスポート
export { ImageProcessorService };