import { ImageResizer } from '../core/pixelation/ImageResizer';
import { DitheringProcessor } from '../core/dithering/DitheringProcessor';
import { ColorReducer } from '../core/colorReduction/colorReducer';

export interface ProcessingRequest {
  type: 'process';
  id: string;
  imageData: ImageData;
  params: {
    resolution: number;
    colorDepth: number;
    dithering: boolean;
  };
}

export interface ProcessingResponse {
  type: 'result' | 'error' | 'progress';
  id: string;
  result?: ImageData;
  error?: string;
  progress?: number;
}

// Web Workerのコンテキストでの型キャスト
const ctx = self as unknown as Worker;

// 画像処理インスタンス
const imageResizer = new ImageResizer();
const ditheringProcessor = new DitheringProcessor();
const colorReducer = new ColorReducer();

/**
 * 画像処理パイプラインを実行
 */
async function processImage(
  imageData: ImageData,
  params: ProcessingRequest['params']
): Promise<ImageData> {
  try {
    let result = imageData;
    
    // Step 1: リサイズ処理 (30%)
    ctx.postMessage({
      type: 'progress',
      progress: 10
    } as ProcessingResponse);
    
    result = imageResizer.resize(result, params.resolution);
    
    ctx.postMessage({
      type: 'progress',
      progress: 30
    } as ProcessingResponse);
    
    // Step 2: ディザリング処理を適用する場合 (60%)
    if (params.dithering) {
      result = ditheringProcessor.applyFloydSteinberg(result, params.colorDepth);
      
      ctx.postMessage({
        type: 'progress',
        progress: 60
      } as ProcessingResponse);
    } else {
      // Step 2: 色数削減のみ (60%)
      result = colorReducer.reduceColors(result, params.colorDepth);
      
      ctx.postMessage({
        type: 'progress',
        progress: 60
      } as ProcessingResponse);
    }
    
    // 処理完了 (100%)
    ctx.postMessage({
      type: 'progress',
      progress: 100
    } as ProcessingResponse);
    
    return result;
  } catch (error) {
    throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * メッセージハンドラー
 */
ctx.addEventListener('message', async (event) => {
  const { type, id, imageData, params } = event.data;
  
  if (type !== 'process') {
    return;
  }
  
  try {
    // 入力検証
    if (!imageData || !imageData.data || imageData.width <= 0 || imageData.height <= 0) {
      throw new Error('Invalid image data');
    }
    
    if (params.resolution < 32 || params.resolution > 512) {
      throw new Error('Resolution must be between 32 and 512');
    }
    
    if (params.colorDepth < 4 || params.colorDepth > 256) {
      throw new Error('Color depth must be between 4 and 256');
    }
    
    // 画像処理を実行
    const result = await processImage(imageData, params);
    
    // 結果を返送
    ctx.postMessage({
      type: 'result',
      id,
      result
    } as ProcessingResponse);
    
  } catch (error) {
    // エラーを返送
    ctx.postMessage({
      type: 'error',
      id,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    } as ProcessingResponse);
  }
});

// Worker開始時のログ
console.log('Image processing worker initialized');