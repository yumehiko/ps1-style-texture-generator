import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ProcessingParams } from '../types/processing';

// モックの設定
const mockPostMessage = vi.fn();
const mockAddEventListener = vi.fn();
const mockTerminate = vi.fn();

// モジュールのモック - imageProcessorがインポートされる前に設定
vi.mock('../workers/imageProcessing.worker.ts?worker', () => {
  return {
    default: class MockWorker {
      postMessage = mockPostMessage;
      addEventListener = mockAddEventListener;
      terminate = mockTerminate;
    }
  };
});

// モックの後にインポート
import { ImageProcessorService } from './imageProcessor';

describe('ImageProcessorService', () => {
  let service: ImageProcessorService;
  let messageHandler: ((event: MessageEvent) => void) | null = null;
  let errorHandler: ((event: ErrorEvent) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    messageHandler = null;
    errorHandler = null;
    
    // addEventListenerのモックを設定
    mockAddEventListener.mockImplementation((event: string, handler: (event: MessageEvent | ErrorEvent) => void) => {
      if (event === 'message') {
        messageHandler = handler;
      } else if (event === 'error') {
        errorHandler = handler;
      }
    });

    // 新しいサービスインスタンスを作成
    service = new ImageProcessorService();
  });

  afterEach(() => {
    if (service) {
      service.dispose();
    }
  });

  describe('processImage', () => {
    it('should successfully process an image', async () => {
      const testImageData = new ImageData(
        new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]),
        2,
        1
      );

      const params: ProcessingParams = {
        resolution: 64,
        colorDepth: 16,
        dithering: true,
      };

      // 処理を開始
      const processPromise = service.processImage(testImageData, params);

      // postMessageが呼ばれたことを確認
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'process',
          id: expect.any(String),
          imageData: expect.any(ImageData),
          params,
        })
      );

      // 成功レスポンスをシミュレート
      const resultData = new ImageData(new Uint8ClampedArray([128, 128, 128, 255]), 1, 1);
      const requestId = mockPostMessage.mock.calls[0][0].id;
      
      if (messageHandler) {
        messageHandler({
          data: {
            type: 'result',
            id: requestId,
            result: resultData,
          },
        } as MessageEvent);
      }

      // 結果を確認
      const result = await processPromise;
      expect(result.success).toBe(true);
      expect(result.data).toEqual(resultData);
      expect(result.error).toBeUndefined();
    });

    it('should handle processing errors', async () => {
      const testImageData = new ImageData(new Uint8ClampedArray(4), 1, 1);
      const params: ProcessingParams = {
        resolution: 32,
        colorDepth: 8,
        dithering: false,
      };

      const processPromise = service.processImage(testImageData, params);
      const requestId = mockPostMessage.mock.calls[0][0].id;

      // エラーレスポンスをシミュレート
      if (messageHandler) {
        messageHandler({
          data: {
            type: 'error',
            id: requestId,
            error: 'Processing failed',
          },
        } as MessageEvent);
      }

      const result = await processPromise;
      expect(result.success).toBe(false);
      expect(result.error).toBe('Processing failed');
      expect(result.data).toBeUndefined();
    });

    it('should report progress updates', async () => {
      const testImageData = new ImageData(new Uint8ClampedArray(4), 1, 1);
      const params: ProcessingParams = {
        resolution: 128,
        colorDepth: 32,
        dithering: true,
      };

      const progressUpdates: number[] = [];
      const progressCallback = (progress: number) => {
        progressUpdates.push(progress);
      };

      const processPromise = service.processImage(testImageData, params, progressCallback);
      const requestId = mockPostMessage.mock.calls[0][0].id;

      // プログレス更新をシミュレート
      if (messageHandler) {
        [10, 30, 60, 100].forEach((progress) => {
          messageHandler({
            data: {
              type: 'progress',
              id: requestId,
              progress,
            },
          } as MessageEvent);
        });

        // 最終結果を送信
        messageHandler({
          data: {
            type: 'result',
            id: requestId,
            result: new ImageData(new Uint8ClampedArray(4), 1, 1),
          },
        } as MessageEvent);
      }

      await processPromise;
      expect(progressUpdates).toEqual([10, 30, 60, 100]);
    });
  });

  describe('cancelAllProcessing', () => {
    it('should cancel all pending operations', async () => {
      const testImageData = new ImageData(new Uint8ClampedArray(4), 1, 1);
      const params: ProcessingParams = {
        resolution: 256,
        colorDepth: 64,
        dithering: false,
      };

      // 複数の処理を開始
      const promise1 = service.processImage(testImageData, params);
      const promise2 = service.processImage(testImageData, params);

      // キャンセル
      service.cancelAllProcessing();

      // 両方の処理がキャンセルされることを確認
      const [result1, result2] = await Promise.all([promise1, promise2]);
      
      expect(result1.success).toBe(false);
      expect(result1.error).toBe('Processing cancelled');
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Processing cancelled');
    });
  });

  describe('getProcessingCount', () => {
    it('should return the number of active processing tasks', () => {
      const testImageData = new ImageData(new Uint8ClampedArray(4), 1, 1);
      const params: ProcessingParams = {
        resolution: 128,
        colorDepth: 16,
        dithering: true,
      };

      expect(service.getProcessingCount()).toBe(0);

      // 処理を開始
      service.processImage(testImageData, params);
      expect(service.getProcessingCount()).toBe(1);

      service.processImage(testImageData, params);
      expect(service.getProcessingCount()).toBe(2);

      // キャンセルして確認
      service.cancelAllProcessing();
      expect(service.getProcessingCount()).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle worker errors', async () => {
      const testImageData = new ImageData(new Uint8ClampedArray(4), 1, 1);
      const params: ProcessingParams = {
        resolution: 128,
        colorDepth: 16,
        dithering: true,
      };

      // 処理を開始
      const promise1 = service.processImage(testImageData, params);
      
      // Workerエラーをシミュレート
      if (errorHandler) {
        errorHandler(new ErrorEvent('error', { message: 'Worker crashed' }));
      }

      // エラーで終了することを確認
      await expect(promise1).rejects.toThrow('Worker error occurred');
    });
  });
});