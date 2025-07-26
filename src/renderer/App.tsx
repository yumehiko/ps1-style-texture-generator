import React, { useState, useCallback } from 'react'
import { AppProvider, useAppContext } from './contexts'
import { ProcessingParams } from './types/processing'
import {
  ImageInput,
  Preview2D,
  Preview3D,
  ParameterControls,
  SaveButton
} from './components'
import { useSaveImage } from './hooks'
import './styles/globals.css'

const AppContent: React.FC = () => {
  const { state, dispatch } = useAppContext()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const { handleSave, isSaving, saveMessage, canSave } = useSaveImage()
  
  // 一時的なファイル処理ハンドラー（後でfileServiceに移動）
  const handleFileSelect = useCallback((file: File) => {
    console.log('File selected:', file.name)
    // TODO: ここでfileServiceを呼び出して画像を処理する
    // 現在は単純にプレビューURLを作成するだけ
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setLocalError(null)
  }, [])
  
  const handleRemove = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setLocalError(null)
  }, [previewUrl])
  
  // パラメータ変更ハンドラー（後でuseImageProcessorフックに移動）
  const handleParameterChange = useCallback((params: Partial<ProcessingParams>) => {
    dispatch({ type: 'UPDATE_PARAMETERS', payload: params })
  }, [dispatch])
  
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">PS1 TEXTURE GENERATOR</h1>
      </header>
      
      <main className="app-main">
        <div className="app-grid">
          {/* 左側パネル: 入力とコントロール */}
          <section className="panel panel-left">
            <div className="input-section">
              <div>
                <div className="panel-header">
                  <h2>INPUT</h2>
                </div>
                <div className="panel-content">
                  <ImageInput 
                    imageUrl={previewUrl}
                    imageWidth={state.originalImage?.width}
                    imageHeight={state.originalImage?.height}
                    isLoading={state.isProcessing}
                    error={localError || state.error}
                    onFileSelect={handleFileSelect}
                    onRemove={handleRemove}
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
          <section className="panel panel-right">
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