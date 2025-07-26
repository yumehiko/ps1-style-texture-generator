import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React, { ReactNode } from 'react'
import { useImageProcessor } from './useImageProcessor'
import { AppProvider } from '../contexts/AppContext'
import { imageProcessor } from '../services/imageProcessor'
import { ProcessedImageData } from '../types/image'

// imageProcessorサービスをモック
vi.mock('../services/imageProcessor', () => ({
  imageProcessor: {
    processImage: vi.fn(),
    cancelAllProcessing: vi.fn(),
    getProcessingCount: vi.fn(() => 0)
  }
}))

// テスト用のProcessedImageDataを作成
const createTestImageData = (width: number, height: number): ProcessedImageData => {
  const data = new Uint8ClampedArray(width * height * 4)
  return { width, height, data }
}

// ラッパーコンポーネント
const wrapper = ({ children }: { children: ReactNode }) => 
  React.createElement(AppProvider, null, children)

describe('useImageProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })
  
  describe('processImage', () => {
    it('正常に画像を処理する', async () => {
      const mockResult = {
        success: true,
        data: createTestImageData(100, 100)
      }
      
      vi.mocked(imageProcessor.processImage).mockResolvedValueOnce(mockResult)
      
      const { result } = renderHook(() => useImageProcessor(), { wrapper })
      
      const testImage = createTestImageData(200, 200)
      const testParams = {
        resolution: 256,
        colorDepth: 16,
        dithering: true
      }
      
      await act(async () => {
        await result.current.processImage(testImage, testParams)
      })
      
      expect(imageProcessor.processImage).toHaveBeenCalledWith(
        testImage,
        testParams,
        expect.any(Function)
      )
      
      const status = result.current.getProcessingStatus()
      expect(status.hasProcessedImage).toBe(true)
      expect(status.hasError).toBe(false)
    })
    
    it('処理エラーを適切に処理する', async () => {
      const mockResult = {
        success: false,
        error: new Error('Processing failed')
      }
      
      vi.mocked(imageProcessor.processImage).mockResolvedValueOnce(mockResult)
      
      const { result } = renderHook(() => useImageProcessor(), { wrapper })
      
      const testImage = createTestImageData(200, 200)
      const testParams = {
        resolution: 256,
        colorDepth: 16,
        dithering: true
      }
      
      await act(async () => {
        await result.current.processImage(testImage, testParams)
      })
      
      const status = result.current.getProcessingStatus()
      expect(status.hasError).toBe(true)
      expect(status.error).toEqual({
        key: 'UNKNOWN_ERROR',
        message: '予期しないエラーが発生しました。アプリケーションを再起動してください。',
        details: 'Processing failed',
        recoverable: false
      })
      expect(status.hasProcessedImage).toBe(false)
    })
    
    it('例外を適切に処理する', async () => {
      const mockError = new Error('Unexpected error')
      vi.mocked(imageProcessor.processImage).mockRejectedValueOnce(mockError)
      
      const { result } = renderHook(() => useImageProcessor(), { wrapper })
      
      const testImage = createTestImageData(200, 200)
      const testParams = {
        resolution: 256,
        colorDepth: 16,
        dithering: true
      }
      
      await act(async () => {
        await result.current.processImage(testImage, testParams)
      })
      
      const status = result.current.getProcessingStatus()
      expect(status.hasError).toBe(true)
      expect(status.error).toEqual({
        key: 'UNKNOWN_ERROR',
        message: '予期しないエラーが発生しました。アプリケーションを再起動してください。',
        details: 'Unexpected error',
        recoverable: false
      })
    })
  })
  
  describe('debouncedProcessImage', () => {
    it('指定された遅延後に処理を実行する', async () => {
      const mockResult = {
        success: true,
        data: createTestImageData(100, 100)
      }
      
      vi.mocked(imageProcessor.processImage).mockResolvedValueOnce(mockResult)
      
      const { result } = renderHook(() => useImageProcessor(), { wrapper })
      
      const testImage = createTestImageData(200, 200)
      const testParams = {
        resolution: 256,
        colorDepth: 16,
        dithering: true
      }
      
      act(() => {
        result.current.debouncedProcessImage(testImage, testParams, 500)
      })
      
      // まだ実行されていないことを確認
      expect(imageProcessor.processImage).not.toHaveBeenCalled()
      
      // 時間を進める
      await act(async () => {
        vi.advanceTimersByTime(500)
        // processImageが呼ばれるのを待つ
        await vi.waitFor(() => {
          expect(imageProcessor.processImage).toHaveBeenCalled()
        })
      })
      
      expect(imageProcessor.processImage).toHaveBeenCalledWith(
        testImage,
        testParams,
        expect.any(Function)
      )
    })
    
    it('複数回呼び出された場合、最後の呼び出しのみを実行する', async () => {
      const mockResult = {
        success: true,
        data: createTestImageData(100, 100)
      }
      
      vi.mocked(imageProcessor.processImage).mockResolvedValue(mockResult)
      
      const { result } = renderHook(() => useImageProcessor(), { wrapper })
      
      const testImage = createTestImageData(200, 200)
      const params1 = { resolution: 128, colorDepth: 8, dithering: false }
      const params2 = { resolution: 256, colorDepth: 16, dithering: true }
      const params3 = { resolution: 512, colorDepth: 32, dithering: true }
      
      act(() => {
        result.current.debouncedProcessImage(testImage, params1, 300)
        result.current.debouncedProcessImage(testImage, params2, 300)
        result.current.debouncedProcessImage(testImage, params3, 300)
      })
      
      // 時間を進める
      await act(async () => {
        vi.advanceTimersByTime(300)
        // processImageが呼ばれるのを待つ
        await vi.waitFor(() => {
          expect(imageProcessor.processImage).toHaveBeenCalled()
        })
      })
      
      // 最後のパラメータのみで呼び出されることを確認
      expect(imageProcessor.processImage).toHaveBeenCalledTimes(1)
      expect(imageProcessor.processImage).toHaveBeenCalledWith(
        testImage,
        params3,
        expect.any(Function)
      )
    })
  })
  
  describe('cancelProcessing', () => {
    it('処理をキャンセルする', () => {
      const { result } = renderHook(() => useImageProcessor(), { wrapper })
      
      const testImage = createTestImageData(200, 200)
      const testParams = {
        resolution: 256,
        colorDepth: 16,
        dithering: true
      }
      
      // デバウンス処理を開始
      act(() => {
        result.current.debouncedProcessImage(testImage, testParams, 1000)
      })
      
      // キャンセル
      act(() => {
        result.current.cancelProcessing()
      })
      
      // 時間を進めても処理が実行されないことを確認
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      expect(imageProcessor.processImage).not.toHaveBeenCalled()
      expect(imageProcessor.cancelAllProcessing).toHaveBeenCalled()
    })
  })
  
  describe('clearError', () => {
    it('エラーをクリアする', async () => {
      const mockResult = {
        success: false,
        error: new Error('Test error')
      }
      
      vi.mocked(imageProcessor.processImage).mockResolvedValueOnce(mockResult)
      
      const { result } = renderHook(() => useImageProcessor(), { wrapper })
      
      // エラーを発生させる
      await act(async () => {
        await result.current.processImage(
          createTestImageData(200, 200),
          { resolution: 256, colorDepth: 16, dithering: true }
        )
      })
      
      expect(result.current.getProcessingStatus().hasError).toBe(true)
      
      // エラーをクリア
      act(() => {
        result.current.clearError()
      })
      
      expect(result.current.getProcessingStatus().hasError).toBe(false)
      expect(result.current.getProcessingStatus().error).toBe(null)
    })
  })
})