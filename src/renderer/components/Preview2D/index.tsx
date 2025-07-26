import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAppContext } from '../../contexts';
import { useCanvas } from '../../hooks/useCanvas';
import { LoadingOverlay } from '../LoadingOverlay';
import styles from './Preview2D.module.css';

export const Preview2D: React.FC = () => {
  const { state } = useAppContext();
  const { processedImage, isProcessing, error } = state;
  const canvasRef = useCanvas(processedImage);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);
  
  // ズームレベルの管理 (100%, 200%, 400%)
  const [zoomIndex, setZoomIndex] = useState(1); // デフォルトを200%に
  const zoomLevels = [1, 2, 4];
  const currentZoom = zoomLevels[zoomIndex];
  
  const handleClick = useCallback(() => {
    setZoomIndex((prev) => (prev + 1) % zoomLevels.length);
  }, [zoomLevels.length]);
  
  // 画像サイズとコンテナサイズを比較してスクロールが必要か判定
  useEffect(() => {
    if (wrapperRef.current && processedImage) {
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const imageWidth = processedImage.width * currentZoom;
      const imageHeight = processedImage.height * currentZoom;
      
      // 画像がコンテナより大きい場合はスクロールが必要
      setNeedsScroll(imageWidth > wrapperRect.width || imageHeight > wrapperRect.height);
    }
  }, [processedImage, currentZoom]);

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
    <div className={styles['preview-2d-container']} onClick={handleClick}>
      <LoadingOverlay 
        isLoading={isProcessing}
        message="画像を処理中..."
      />
      <div className={styles['zoom-indicator']}>{currentZoom * 100}%</div>
      <div 
        ref={wrapperRef}
        className={`${styles['preview-canvas-wrapper']} ${needsScroll ? styles['scroll-mode'] : styles['center-mode']}`}
      >
        <canvas
          ref={canvasRef}
          className={styles['preview-canvas']}
          style={{
            width: processedImage ? `${processedImage.width * currentZoom}px` : 'auto',
            height: processedImage ? `${processedImage.height * currentZoom}px` : 'auto'
          }}
        />
      </div>
    </div>
  );
};