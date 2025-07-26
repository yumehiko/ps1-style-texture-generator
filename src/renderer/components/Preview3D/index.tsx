import React from 'react';
import { useAppContext } from '../../contexts';
import { useThreeScene } from '../../hooks';
import styles from './Preview3D.module.css';

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
      <div className={styles['preview-3d-container']}>
        <div className={styles['preview-3d-error']}>
          <span className={styles['error-icon']}>⚠</span>
          <span className={styles['error-text']}>3D PREVIEW UNAVAILABLE</span>
          <span className={styles['error-detail']}>{webGLError}</span>
        </div>
      </div>
    );
  }

  // 画像未選択状態でも3Dシーンは表示
  const showEmptyMessage = !processedImage;

  return (
    <div className={styles['preview-3d-container']}>
      <div ref={mountRef} className={styles['preview-3d-mount']} />
      {showEmptyMessage && (
        <div className={styles['preview-3d-empty']}>
          <span className={styles['empty-text']}>3D PREVIEW</span>
          <span className={styles['empty-subtext']}>TEXTURE WILL BE APPLIED TO CUBE</span>
        </div>
      )}
      {isSceneReady && !showEmptyMessage && (
        <div className={styles['preview-3d-controls']}>
          <span className={styles['control-hint']}>DRAG TO ROTATE • SCROLL TO ZOOM</span>
        </div>
      )}
    </div>
  );
};