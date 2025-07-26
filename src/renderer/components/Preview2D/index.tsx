import React from 'react';
import { useAppContext } from '../../contexts';
import { useCanvas } from '../../hooks/useCanvas';
import { LoadingOverlay } from '../LoadingOverlay';
import styles from './Preview2D.module.css';

export const Preview2D: React.FC = () => {
  const { state } = useAppContext();
  const { processedImage, isProcessing, error } = state;
  const canvasRef = useCanvas(processedImage);

  // ローディング状態（LoadingOverlayはposition:absoluteなので親要素内に表示）

  // エラー状態
  if (error) {
    return (
      <div className={styles['preview-2d-container']}>
        <div className={styles['preview-error']}>
          <span className={styles['error-icon']}>!</span>
          <span className={styles['error-text']}>ERROR</span>
          <span className={styles['error-message']}>{error.message}</span>
        </div>
      </div>
    );
  }

  // 画像未選択状態
  if (!processedImage) {
    return (
      <div className={styles['preview-2d-container']}>
        <div className={styles['preview-empty']}>
          <span className={styles['empty-text']}>NO IMAGE</span>
          <span className={styles['empty-subtext']}>SELECT AN IMAGE TO PROCESS</span>
        </div>
      </div>
    );
  }

  // 画像表示
  return (
    <div className={styles['preview-2d-container']}>
      <LoadingOverlay 
        isLoading={isProcessing}
        message="画像を処理中..."
      />
      <div className={styles['preview-canvas-wrapper']}>
        <canvas
          ref={canvasRef}
          className={styles['preview-canvas']}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
    </div>
  );
};