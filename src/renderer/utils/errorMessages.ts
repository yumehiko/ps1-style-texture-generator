export const ErrorMessages = {
  // ファイル関連エラー
  FILE_INVALID_FORMAT: '対応していないファイル形式です。JPEG、PNG、GIF、WebP形式の画像を選択してください。',
  FILE_TOO_LARGE: 'ファイルサイズが大きすぎます（最大50MB）。より小さな画像を選択してください。',
  FILE_READ_ERROR: 'ファイルの読み込みに失敗しました。ファイルが破損している可能性があります。',
  FILE_SAVE_ERROR: '画像の保存に失敗しました。別の場所を選択してください。',
  FILE_SAVE_PERMISSION: '選択した場所への書き込み権限がありません。',
  FILE_SAVE_DISK_FULL: 'ディスク容量が不足しています。',
  
  // 画像処理エラー
  PROCESSING_TIMEOUT: '画像処理がタイムアウトしました。より小さな画像でお試しください。',
  PROCESSING_MEMORY: 'メモリ不足のため処理を完了できませんでした。',
  PROCESSING_INVALID_DATA: '画像データが無効です。別の画像でお試しください。',
  
  // 3Dプレビューエラー
  WEBGL_NOT_SUPPORTED: 'お使いの環境ではWebGLがサポートされていません。3Dプレビューは利用できません。',
  WEBGL_CONTEXT_LOST: 'GPUリソースが失われました。ページを再読み込みしてください。',
  
  // 一般的なエラー
  UNKNOWN_ERROR: '予期しないエラーが発生しました。アプリケーションを再起動してください。',
  NETWORK_ERROR: 'ネットワークエラーが発生しました。接続を確認してください。',
} as const;

export type ErrorMessageKey = keyof typeof ErrorMessages;

export interface ErrorInfo {
  key: ErrorMessageKey;
  message: string;
  details?: string;
  recoverable: boolean;
}

export function getErrorInfo(error: unknown): ErrorInfo {
  if (error instanceof Error) {
    // ファイルサイズエラー
    if (error.message.includes('size') || error.message.includes('large')) {
      return {
        key: 'FILE_TOO_LARGE',
        message: ErrorMessages.FILE_TOO_LARGE,
        details: error.message,
        recoverable: true,
      };
    }
    
    // WebGLエラー
    if (error.message.includes('WebGL') || error.message.includes('webgl')) {
      return {
        key: 'WEBGL_NOT_SUPPORTED',
        message: ErrorMessages.WEBGL_NOT_SUPPORTED,
        details: error.message,
        recoverable: true,
      };
    }
    
    // メモリエラー
    if (error.message.includes('memory') || error.message.includes('Memory')) {
      return {
        key: 'PROCESSING_MEMORY',
        message: ErrorMessages.PROCESSING_MEMORY,
        details: error.message,
        recoverable: true,
      };
    }
    
    // タイムアウトエラー
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return {
        key: 'PROCESSING_TIMEOUT',
        message: ErrorMessages.PROCESSING_TIMEOUT,
        details: error.message,
        recoverable: true,
      };
    }
    
    // 権限エラー
    if (error.message.includes('permission') || error.message.includes('Permission')) {
      return {
        key: 'FILE_SAVE_PERMISSION',
        message: ErrorMessages.FILE_SAVE_PERMISSION,
        details: error.message,
        recoverable: true,
      };
    }
  }
  
  // デフォルトエラー
  return {
    key: 'UNKNOWN_ERROR',
    message: ErrorMessages.UNKNOWN_ERROR,
    details: error instanceof Error ? error.message : String(error),
    recoverable: false,
  };
}

export function isRecoverableError(error: unknown): boolean {
  const errorInfo = getErrorInfo(error);
  return errorInfo.recoverable;
}