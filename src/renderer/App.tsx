import React from 'react'
import { AppProvider } from './contexts'
import {
  ImageInput,
  ImagePreview,
  Preview3D,
  ParameterControls,
  SaveButton
} from './components'
import './styles/globals.css'

const AppContent: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">PS1 TEXTURE GENERATOR</h1>
      </header>
      
      <main className="app-main">
        <div className="app-grid">
          {/* 左側パネル: 入力とコントロール */}
          <section className="panel panel-left">
            <div className="panel-header">
              <h2>INPUT</h2>
            </div>
            <div className="panel-content">
              <ImageInput />
            </div>
            
            <div className="panel-header">
              <h2>PARAMETERS</h2>
            </div>
            <div className="panel-content">
              <ParameterControls />
            </div>
            
            <div className="panel-actions">
              <SaveButton />
            </div>
          </section>
          
          {/* 右側パネル: プレビュー */}
          <section className="panel panel-right">
            <div className="panel-header">
              <h2>PREVIEW</h2>
            </div>
            <div className="panel-content preview-container">
              <div className="preview-2d">
                <ImagePreview />
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