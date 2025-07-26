/// <reference lib="dom" />
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fileService } from './fileService'

// Electron APIのモック
const mockElectronAPI = {
  openFile: vi.fn(),
  saveFile: vi.fn()
}

// グローバルwindowオブジェクトの設定
global.window = {
  electronAPI: mockElectronAPI
} as unknown as Window & typeof globalThis

// 画像関連のモック
const mockImage = {
  onload: null as ((this: HTMLImageElement, ev: Event) => void) | null,
  onerror: null as ((this: HTMLImageElement, ev: Event) => void) | null,
  src: '',
  width: 100,
  height: 100
}

global.Image = vi.fn().mockImplementation(() => mockImage) as unknown as typeof Image
global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test')
global.URL.revokeObjectURL = vi.fn()

// Canvas関連のモック
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(),
  toBlob: vi.fn()
}

const mockContext = {
  drawImage: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn()
}

global.document.createElement = vi.fn().mockImplementation((tagName: string) => {
  if (tagName === 'canvas') {
    return mockCanvas
  }
  return {}
})

describe('FileService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCanvas.getContext.mockReturnValue(mockContext)
  })

  describe('loadImage', () => {
    it('正常に画像を読み込む', async () => {
      const mockArrayBuffer = new ArrayBuffer(8)
      mockElectronAPI.openFile.mockResolvedValue({
        canceled: false,
        filePath: '/test/image.png',
        data: mockArrayBuffer
      })

      mockContext.getImageData.mockReturnValue({
        width: 100,
        height: 100,
        data: new Uint8ClampedArray(40000) // 100x100x4
      })

      const resultPromise = fileService.loadImage()

      // 画像ロードイベントをトリガー
      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload.call(mockImage as unknown as HTMLImageElement, new Event('load'))
        }
      }, 0)

      const result = await resultPromise

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        width: 100,
        height: 100,
        data: expect.any(Uint8ClampedArray)
      })
      expect(result.filePath).toBe('/test/image.png')
    })

    it('ファイル選択がキャンセルされた場合', async () => {
      mockElectronAPI.openFile.mockResolvedValue({
        canceled: true
      })

      const result = await fileService.loadImage()

      expect(result.success).toBe(false)
      expect(result.error).toBeUndefined()
    })

    it('APIエラーが発生した場合', async () => {
      mockElectronAPI.openFile.mockResolvedValue({
        canceled: false,
        error: 'ファイルアクセスエラー'
      })

      const result = await fileService.loadImage()

      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('api-error')
      expect(result.error?.message).toBe('ファイルアクセスエラー')
    })

    it('画像の読み込みに失敗した場合', async () => {
      const mockArrayBuffer = new ArrayBuffer(8)
      mockElectronAPI.openFile.mockResolvedValue({
        canceled: false,
        filePath: '/test/image.png',
        data: mockArrayBuffer
      })

      const resultPromise = fileService.loadImage()

      // 画像エラーイベントをトリガー
      setTimeout(() => {
        if (mockImage.onerror) {
          mockImage.onerror.call(mockImage as unknown as HTMLImageElement, new Event('error'))
        }
      }, 0)

      const result = await resultPromise

      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('file-read')
      expect(result.error?.message).toContain('読み込みに失敗')
    })
  })

  describe('saveImage', () => {
    const mockImageData = {
      width: 100,
      height: 100,
      data: new Uint8ClampedArray(40000)
    }

    const mockParams = {
      resolution: 256,
      colorDepth: 16,
      dithering: true
    }

    it('正常に画像を保存する（元ファイル名なし）', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' })
      mockBlob.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(4))
      
      mockCanvas.toBlob.mockImplementation((callback: (blob: Blob | null) => void) => {
        callback(mockBlob)
      })

      mockElectronAPI.saveFile.mockResolvedValue({
        canceled: false,
        filePath: '/test/output.png'
      })

      const result = await fileService.saveImage(mockImageData, mockParams)

      expect(result.success).toBe(true)
      expect(result.filePath).toBe('/test/output.png')
      expect(mockElectronAPI.saveFile).toHaveBeenCalledWith(
        expect.any(ArrayBuffer),
        'ps1-texture_16_100.png'
      )
    })

    it('正常に画像を保存する（元ファイル名あり）', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' })
      mockBlob.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(4))
      
      mockCanvas.toBlob.mockImplementation((callback: (blob: Blob | null) => void) => {
        callback(mockBlob)
      })

      mockElectronAPI.saveFile.mockResolvedValue({
        canceled: false,
        filePath: '/test/mario_16_100.png'
      })

      const result = await fileService.saveImage(mockImageData, mockParams, 'mario.jpg')

      expect(result.success).toBe(true)
      expect(result.filePath).toBe('/test/mario_16_100.png')
      expect(mockElectronAPI.saveFile).toHaveBeenCalledWith(
        expect.any(ArrayBuffer),
        'mario_16_100.png'
      )
    })

    it('保存がキャンセルされた場合', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' })
      mockBlob.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(4))
      
      mockCanvas.toBlob.mockImplementation((callback: (blob: Blob | null) => void) => {
        callback(mockBlob)
      })

      mockElectronAPI.saveFile.mockResolvedValue({
        canceled: true
      })

      const result = await fileService.saveImage(mockImageData, mockParams)

      expect(result.success).toBe(false)
      expect(result.error).toBeUndefined()
    })

    it('保存時にAPIエラーが発生した場合', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' })
      mockBlob.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(4))
      
      mockCanvas.toBlob.mockImplementation((callback: (blob: Blob | null) => void) => {
        callback(mockBlob)
      })

      mockElectronAPI.saveFile.mockResolvedValue({
        canceled: false,
        error: 'ディスクエラー'
      })

      const result = await fileService.saveImage(mockImageData, mockParams)

      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('api-error')
      expect(result.error?.message).toBe('ディスクエラー')
    })

    it('画像変換に失敗した場合', async () => {
      mockCanvas.toBlob.mockImplementation((callback: (blob: Blob | null) => void) => {
        callback(null)
      })

      const result = await fileService.saveImage(mockImageData, mockParams)

      expect(result.success).toBe(false)
      expect(result.error?.type).toBe('file-save')
      expect(result.error?.message).toContain('変換に失敗')
    })
  })

  describe('generateFilenameSuffix', () => {
    it('正しいサフィックスを生成する（横長画像）', () => {
      const params = {
        resolution: 256,
        colorDepth: 16,
        dithering: true
      }
      const imageData = {
        width: 256,
        height: 128,
        data: new Uint8ClampedArray(0)
      }

      const suffix = fileService.generateFilenameSuffix(params, imageData)
      
      expect(suffix).toBe('_16_256')
    })

    it('正しいサフィックスを生成する（縦長画像）', () => {
      const params = {
        resolution: 128,
        colorDepth: 32,
        dithering: false
      }
      const imageData = {
        width: 64,
        height: 128,
        data: new Uint8ClampedArray(0)
      }

      const suffix = fileService.generateFilenameSuffix(params, imageData)
      
      expect(suffix).toBe('_32_128')
    })

    it('正しいサフィックスを生成する（正方形画像）', () => {
      const params = {
        resolution: 64,
        colorDepth: 8,
        dithering: true
      }
      const imageData = {
        width: 64,
        height: 64,
        data: new Uint8ClampedArray(0)
      }

      const suffix = fileService.generateFilenameSuffix(params, imageData)
      
      expect(suffix).toBe('_8_64')
    })
  })
})