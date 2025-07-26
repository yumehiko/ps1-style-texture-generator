import { useCallback, useEffect, useRef } from 'react'
import { useAppContext } from '../contexts/AppContext'
import { imageProcessor } from '../services/imageProcessor'
import { ProcessingParams } from '../types/processing'
import { ProcessedImageData } from '../types/image'

/**
 * 画像処理フック
 * 画像処理サービスとAppContextを連携し、
 * パラメータ変更時の自動処理を管理
 */
export const useImageProcessor = () => {
  const { state, dispatch } = useAppContext()
  const processingTimeoutRef = useRef<number | null>(null)
  const lastProcessedParamsRef = useRef<ProcessingParams | null>(null)
  
  /**
   * 画像を処理
   */
  const processImage = useCallback(async (
    image: ProcessedImageData,
    params: ProcessingParams
  ) => {
    // 処理開始
    dispatch({ type: 'SET_PROCESSING', payload: true })
    
    try {
      // 画像処理を実行
      const result = await imageProcessor.processImage(
        image,
        params,
        (progress) => {
          // プログレス通知（現在は使用していないが、将来的に使用可能）
          console.log(`Processing progress: ${progress}%`)
        }
      )
      
      if (result.success && result.data) {
        // 処理成功
        dispatch({ type: 'SET_PROCESSED_IMAGE', payload: result.data })
        lastProcessedParamsRef.current = params
      } else {
        // 処理失敗
        dispatch({ type: 'SET_ERROR', payload: result.error || '画像処理に失敗しました' })
        dispatch({ type: 'SET_PROCESSED_IMAGE', payload: null })
      }
    } catch (error) {
      // エラー処理
      const errorMessage = error instanceof Error ? error.message : '予期しないエラーが発生しました'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      dispatch({ type: 'SET_PROCESSED_IMAGE', payload: null })
    }
  }, [dispatch])
  
  /**
   * デバウンスされた画像処理
   * パラメータが頻繁に変更される場合に処理を遅延
   */
  const debouncedProcessImage = useCallback((
    image: ProcessedImageData,
    params: ProcessingParams,
    delay: number = 300
  ) => {
    // 既存のタイムアウトをクリア
    if (processingTimeoutRef.current) {
      window.clearTimeout(processingTimeoutRef.current)
    }
    
    // 新しいタイムアウトを設定
    processingTimeoutRef.current = window.setTimeout(() => {
      processImage(image, params)
    }, delay)
  }, [processImage])
  
  /**
   * パラメータまたは画像が変更されたときに自動処理
   */
  useEffect(() => {
    const { originalImage, parameters } = state
    
    // 画像が設定されていない場合は処理しない
    if (!originalImage) {
      return
    }
    
    // パラメータが変更されたかチェック
    const paramsChanged = !lastProcessedParamsRef.current ||
      lastProcessedParamsRef.current.resolution !== parameters.resolution ||
      lastProcessedParamsRef.current.colorDepth !== parameters.colorDepth ||
      lastProcessedParamsRef.current.dithering !== parameters.dithering
    
    // パラメータが変更された場合のみ処理
    if (paramsChanged) {
      debouncedProcessImage(originalImage, parameters)
    }
  }, [state, debouncedProcessImage])
  
  /**
   * クリーンアップ
   */
  useEffect(() => {
    return () => {
      // タイムアウトをクリア
      if (processingTimeoutRef.current) {
        window.clearTimeout(processingTimeoutRef.current)
      }
    }
  }, [])
  
  /**
   * 現在の処理状態を取得
   */
  const getProcessingStatus = useCallback(() => {
    return {
      isProcessing: state.isProcessing,
      hasError: !!state.error,
      error: state.error,
      hasProcessedImage: !!state.processedImage
    }
  }, [state.isProcessing, state.error, state.processedImage])
  
  /**
   * 処理をキャンセル
   */
  const cancelProcessing = useCallback(() => {
    // タイムアウトをクリア
    if (processingTimeoutRef.current) {
      window.clearTimeout(processingTimeoutRef.current)
      processingTimeoutRef.current = null
    }
    
    // 処理中のタスクをキャンセル
    imageProcessor.cancelAllProcessing()
    
    // 状態をリセット
    dispatch({ type: 'SET_PROCESSING', payload: false })
  }, [dispatch])
  
  /**
   * エラーをクリア
   */
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null })
  }, [dispatch])
  
  return {
    processImage,
    debouncedProcessImage,
    getProcessingStatus,
    cancelProcessing,
    clearError,
    processingCount: imageProcessor.getProcessingCount()
  }
}