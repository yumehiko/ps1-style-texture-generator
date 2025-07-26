import React from 'react';
import { useAppContext } from '../../contexts';
import { useCanvas } from '../../hooks/useCanvas';
import { LoadingOverlay } from '../LoadingOverlay';
import './Preview2D.module.css';

export const Preview2D: React.FC = () => {
  const { state } = useAppContext();
  const { processedImage, isProcessing, error } = state;
  const canvasRef = useCanvas(processedImage);

  // ローディング状態（LoadingOverlayはposition:absoluteなので親要素内に表示）

  // エラー状態
  if (error) {
    return (
      <div className="preview-2d-container">
        <div className="preview-error">
          <span className="error-icon">!</span>
          <span className="error-text">ERROR</span>
          <span className="error-message">{error.message}</span>
        </div>
      </div>
    );
  }

  // 画像未選択状態
  if (!processedImage) {
    return (
      <div className="preview-2d-container">
        <div className="preview-empty">
          <span className="empty-text">NO IMAGE</span>
          <span className="empty-subtext">SELECT AN IMAGE TO PROCESS</span>
        </div>
      </div>
    );
  }

  // 画像表示
  return (
    <div className="preview-2d-container" style={{ position: 'relative' }}>
      <LoadingOverlay 
        isLoading={isProcessing}
        message="画像を処理中..."
      />
      <div className="preview-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="preview-canvas"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
      {processedImage && (
        <div className="preview-info">
          <span className="info-item">
            {processedImage.width} × {processedImage.height} PX
          </span>
          <span className="info-separator">|</span>
          <span className="info-item">
            {state.parameters.colorDepth} COLORS
          </span>
        </div>
      )}
    </div>
  );
};