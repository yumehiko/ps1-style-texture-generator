// 共通定数定義

// アプリケーション情報
export const APP_NAME = 'PS1 Style Texture Generator'
export const APP_VERSION = '1.0.0'

// 画像処理関連の定数
export const IMAGE_FORMATS = {
  INPUT: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
  OUTPUT: ['png', 'jpg', 'jpeg']
} as const

export const DEFAULT_PARAMETERS = {
  resolution: 256, // デフォルトの解像度（長辺）
  colorCount: 16, // デフォルトの色数
  ditherStrength: 0.5, // ディザリング強度 (0-1)
  pixelSize: 1 // ピクセルサイズ倍率
} as const

export const LIMITS = {
  MIN_RESOLUTION: 16,
  MAX_RESOLUTION: 1024,
  MIN_COLOR_COUNT: 2,
  MAX_COLOR_COUNT: 256,
  MAX_FILE_SIZE: 50 * 1024 * 1024 // 50MB
} as const

// IPC チャンネル名
export const IPC_CHANNELS = {
  DIALOG: {
    OPEN_FILE: 'dialog:openFile',
    SAVE_FILE: 'dialog:saveFile'
  },
  MENU: {
    OPEN_FILE: 'menu:openFile',
    SAVE_FILE: 'menu:saveFile'
  }
} as const

// エラーメッセージ
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: `File size exceeds the maximum limit of ${LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB`,
  INVALID_FORMAT: 'Invalid file format. Please select an image file.',
  PROCESSING_FAILED: 'Failed to process the image. Please try again.',
  SAVE_FAILED: 'Failed to save the file. Please check permissions and try again.',
  WEBGL_NOT_SUPPORTED: 'WebGL is not supported in your browser. 3D preview will be disabled.'
} as const