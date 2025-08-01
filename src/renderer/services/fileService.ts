/// <reference types="../types/electron" />
import type { ProcessedImageData } from '../types'
import { ProcessingParams } from '../types'

export interface FileServiceError {
  type: 'file-read' | 'file-save' | 'invalid-format' | 'api-error'
  message: string
  originalError?: unknown
}

export interface LoadImageResult {
  success: boolean
  data?: ProcessedImageData
  filePath?: string
  error?: FileServiceError
}

export interface SaveImageResult {
  success: boolean
  filePath?: string
  error?: FileServiceError
}

class FileService {
  /**
   * 画像ファイルを開くダイアログを表示し、選択された画像を読み込む
   */
  async loadImage(): Promise<LoadImageResult> {
    try {
      // Electron APIを使用してファイル選択ダイアログを表示
      const result = await window.electronAPI.openFile()
      
      if (result.canceled) {
        // キャンセルは正常な操作なのでエラーとして扱わない
        return {
          success: false
        }
      }
      
      if (result.error) {
        return {
          success: false,
          error: {
            type: 'api-error',
            message: result.error
          }
        }
      }
      
      if (!result.data || !result.filePath) {
        return {
          success: false,
          error: {
            type: 'file-read',
            message: 'ファイルデータの読み込みに失敗しました'
          }
        }
      }
      
      // ArrayBufferからProcessedImageDataに変換
      const imageData = await this.arrayBufferToImageData(result.data)
      
      return {
        success: true,
        data: imageData,
        filePath: result.filePath
      }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'file-read',
          message: error instanceof Error ? error.message : '不明なエラーが発生しました',
          originalError: error
        }
      }
    }
  }
  
  /**
   * 処理済み画像をPNG形式で保存
   * @param imageData 保存する画像データ
   * @param params 処理パラメータ（ファイル名生成用）
   * @param originalFileName 元のファイル名（オプション）
   */
  async saveImage(
    imageData: ProcessedImageData,
    params: ProcessingParams,
    originalFileName?: string
  ): Promise<SaveImageResult> {
    try {
      // ImageDataをPNG形式のArrayBufferに変換
      const pngData = await this.imageDataToPNG(imageData)
      
      // デフォルトファイル名を生成
      let defaultFilename = 'ps1-texture'
      if (originalFileName) {
        // 拡張子を除いたファイル名を取得
        const nameWithoutExt = originalFileName.replace(/\.[^/.]+$/, '')
        defaultFilename = nameWithoutExt
      }
      
      // サフィックスを追加
      const suffix = this.generateFilenameSuffix(params, imageData)
      defaultFilename = `${defaultFilename}${suffix}.png`
      
      // Electron APIでファイル保存
      const result = await window.electronAPI.saveFile(pngData, defaultFilename)
      
      if (result.canceled) {
        // キャンセルは正常な操作なのでエラーとして扱わない
        return {
          success: false
        }
      }
      
      if (result.error) {
        return {
          success: false,
          error: {
            type: 'api-error',
            message: result.error
          }
        }
      }
      
      return {
        success: true,
        filePath: result.filePath
      }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'file-save',
          message: error instanceof Error ? error.message : '不明なエラーが発生しました',
          originalError: error
        }
      }
    }
  }
  
  /**
   * ArrayBufferをProcessedImageDataに変換
   */
  private async arrayBufferToImageData(buffer: ArrayBuffer): Promise<ProcessedImageData> {
    return new Promise((resolve, reject) => {
      const blob = new Blob([buffer])
      const url = URL.createObjectURL(blob)
      const img = new Image()
      
      img.onload = () => {
        URL.revokeObjectURL(url)
        
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context の取得に失敗しました'))
          return
        }
        
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, img.width, img.height)
        
        resolve({
          width: imageData.width,
          height: imageData.height,
          data: imageData.data
        })
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('画像の読み込みに失敗しました'))
      }
      
      img.src = url
    })
  }
  
  /**
   * ProcessedImageDataをPNG形式のArrayBufferに変換
   */
  private async imageDataToPNG(imageData: ProcessedImageData): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      canvas.width = imageData.width
      canvas.height = imageData.height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context の取得に失敗しました'))
        return
      }
      
      // ImageDataオブジェクトを作成してキャンバスに描画
      const canvasImageData = new ImageData(
        imageData.data,
        imageData.width,
        imageData.height
      )
      ctx.putImageData(canvasImageData, 0, 0)
      
      // CanvasをBlobに変換
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error('画像の変換に失敗しました'))
            return
          }
          
          const arrayBuffer = await blob.arrayBuffer()
          resolve(arrayBuffer)
        },
        'image/png'
      )
    })
  }
  
  /**
   * ファイル名サフィックスを生成
   * 形式: _色数_サイズ (例: _16_128)
   */
  public generateFilenameSuffix(params: ProcessingParams, imageData: ProcessedImageData): string {
    const longerSide = Math.max(imageData.width, imageData.height)
    return `_${params.colorDepth}_${longerSide}`
  }
}

export const fileService = new FileService()