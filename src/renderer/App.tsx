import React, { useCallback, useEffect } from 'react'
import { AppProvider, useAppContext } from './contexts'
import { ProcessingParams } from './types/processing'
import {
  ImageInput,
  Preview2D,
  Preview3D,
  ParameterControls,
  SaveButton,
  HelpOverlay
} from './components'
import { useSaveImage, useImageProcessor, useKeyboardShortcuts } from './hooks'
import { fileService } from './services'
import { getErrorInfo, ErrorMessages } from './utils/errorMessages'
import './styles/globals.css'

const AppContent: React.FC = () => {
  const { state, dispatch } = useAppContext()
  const { handleSave, isSaving, saveMessage, canSave } = useSaveImage()
  const { clearError } = useImageProcessor()
  
  // ファイル選択処理（ダイアログ経由）
  const handleFileDialog = useCallback(async () => {
    const result = await fileService.loadImage()
    if (result.success && result.data) {
      const fileName = result.filePath ? result.filePath.split('/').pop() : undefined
      dispatch({ type: 'SET_ORIGINAL_IMAGE', payload: { imageData: result.data, fileName } })
    } else if (result.error) {
      dispatch({ type: 'SET_ERROR', payload: getErrorInfo(result.error) })
    }
  }, [dispatch])
  
  // ファイル選択処理（ドラッグ&ドロップ経由）
  const handleFileSelect = useCallback(async (file: File) => {
    try {
      // ファイル形式チェック
      const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!acceptedTypes.includes(file.type)) {
        dispatch({ type: 'SET_ERROR', payload: {
          key: 'FILE_INVALID_FORMAT',
          message: ErrorMessages.FILE_INVALID_FORMAT,
          recoverable: true
        }})
        return
      }
      
      // ファイルサイズチェック（50MB）
      const maxSize = 50 * 1024 * 1024
      if (file.size > maxSize) {
        dispatch({ type: 'SET_ERROR', payload: {
          key: 'FILE_TOO_LARGE',
          message: ErrorMessages.FILE_TOO_LARGE,
          recoverable: true
        }})
        return
      }
      const arrayBuffer = await file.arrayBuffer()
      const blob = new Blob([arrayBuffer])
      const url = URL.createObjectURL(blob)
      const img = new Image()
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
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
          
          const processedData = {
            width: imageData.width,
            height: imageData.height,
            data: imageData.data
          }
          dispatch({ type: 'SET_ORIGINAL_IMAGE', payload: { imageData: processedData, fileName: file.name } })
          
          URL.revokeObjectURL(url)
          resolve()
        }
        
        img.onerror = () => {
          URL.revokeObjectURL(url)
          reject(new Error('画像の読み込みに失敗しました'))
        }
        
        img.src = url
      })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: getErrorInfo(error) })
    }
  }, [dispatch])
  
  // 画像削除処理
  const handleRemove = useCallback(() => {
    dispatch({ type: 'RESET' })
    clearError()
  }, [dispatch, clearError])
  
  // パラメータ変更ハンドラー
  const handleParameterChange = useCallback((params: Partial<ProcessingParams>) => {
    dispatch({ type: 'UPDATE_PARAMETERS', payload: params })
  }, [dispatch])
  
  // ファイルダイアログを開くハンドラー
  const handleOpenFile = useCallback(() => {
    handleFileDialog()
  }, [handleFileDialog])
  
  // キーボードショートカットの設定
  useKeyboardShortcuts({
    onOpenFile: handleFileDialog,
    onSaveFile: canSave ? handleSave : undefined,
    onReset: handleRemove
  })
  
  // ObjectURLのクリーンアップ
  useEffect(() => {
    return () => {
      // コンポーネントアンマウント時のクリーンアップ
    }
  }, [])
  
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">PS1 TEXTURE GENERATOR</h1>
      </header>
      
      <main className="app-main" role="main">
        <div className="app-grid">
          {/* 左側パネル: 入力とコントロール */}
          <section className="panel panel-left" aria-label="入力とパラメータ設定">
            <div className="input-section">
              <div>
                <div className="panel-header">
                  <h2>INPUT</h2>
                </div>
                <div className="panel-content">
                  <ImageInput 
                    hasImage={!!state.originalImage}
                    fileName={state.originalFileName}
                    imageWidth={state.originalImage?.width}
                    imageHeight={state.originalImage?.height}
                    isLoading={state.isProcessing}
                    error={state.error}
                    onFileSelect={handleFileSelect}
                    onRemove={handleRemove}
                    onOpenDialog={handleOpenFile}
                    onDismissError={() => dispatch({ type: 'SET_ERROR', payload: null })}
                  />
                </div>
              </div>
              
              <div className="parameters-section">
                <div className="panel-header">
                  <h2>PARAMETERS</h2>
                </div>
                <div className="panel-content">
                  <ParameterControls 
                    parameters={state.parameters}
                    isDisabled={state.isProcessing}
                    onParameterChange={handleParameterChange}
                  />
                </div>
              </div>
            </div>
          </section>
          
          {/* 右側パネル: プレビュー */}
          <section className="panel panel-right" aria-label="プレビュー">
            <div className="panel-header">
              <h2>PREVIEW</h2>
            </div>
            <div className="panel-content preview-container">
              <div className="preview-2d">
                <Preview2D />
              </div>
              <div className="preview-3d">
                <Preview3D />
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <footer className="app-footer">
        <div className="status-bar">
          <span>READY</span>
          <span className="separator">|</span>
          <span>SYSTEM OK</span>
        </div>
        <SaveButton 
          onSave={handleSave}
          isSaving={isSaving}
          isDisabled={!canSave || isSaving}
          message={saveMessage}
        />
      </footer>
      <HelpOverlay />
    </div>
  )
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App