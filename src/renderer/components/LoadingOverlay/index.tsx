import React from 'react';
import styles from './LoadingOverlay.module.css';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  message = '処理中...',
  progress 
}) => {
  if (!isLoading) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.spinner}>
          <span className={styles.dot1}>.</span>
          <span className={styles.dot2}>.</span>
          <span className={styles.dot3}>.</span>
        </div>
        <div className={styles.message}>{message}</div>
        {progress !== undefined && progress > 0 && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <div className={styles.progressText}>{Math.round(progress)}%</div>
          </div>
        )}
      </div>
    </div>
  );
};