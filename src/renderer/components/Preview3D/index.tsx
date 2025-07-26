import React from 'react';
import { useAppContext } from '../../contexts';
import { useThreeScene } from '../../hooks';
import './Preview3D.module.css';

export const Preview3D: React.FC = () => {
  const { state } = useAppContext();
  const { processedImage, previewRotation } = state;
  
  const { mountRef, webGLError, isSceneReady } = useThreeScene({
    processedImage,
    previewRotation
  });

  // WebGLエラー表示
  if (webGLError) {
    return (
      <div className="preview-3d-container">
        <div className="preview-3d-error">
          <span className="error-icon">⚠</span>
          <span className="error-text">3D PREVIEW UNAVAILABLE</span>
          <span className="error-detail">{webGLError}</span>
        </div>
      </div>
    );
  }

  // 画像未選択状態
  if (!processedImage) {
    return (
      <div className="preview-3d-container">
        <div className="preview-3d-empty">
          <span className="empty-text">3D PREVIEW</span>
          <span className="empty-subtext">TEXTURE WILL BE APPLIED TO CUBE</span>
        </div>
        <div ref={mountRef} className="preview-3d-mount" />
      </div>
    );
  }

  return (
    <div className="preview-3d-container">
      <div ref={mountRef} className="preview-3d-mount" />
      {isSceneReady && (
        <div className="preview-3d-controls">
          <span className="control-hint">DRAG TO ROTATE • SCROLL TO ZOOM</span>
        </div>
      )}
    </div>
  );
};