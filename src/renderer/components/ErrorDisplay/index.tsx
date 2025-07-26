import React from 'react';
import styles from './ErrorDisplay.module.css';
import { ErrorInfo } from '../../utils/errorMessages';

interface ErrorDisplayProps {
  error: ErrorInfo | null;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onDismiss, onRetry }) => {
  if (!error) return null;

  return (
    <div className={styles.errorContainer} role="alert">
      <div className={styles.errorIcon}>⚠</div>
      <div className={styles.errorContent}>
        <div className={styles.errorMessage}>{error.message}</div>
        {error.details && (
          <details className={styles.errorDetails}>
            <summary>詳細情報</summary>
            <code>{error.details}</code>
          </details>
        )}
      </div>
      <div className={styles.errorActions}>
        {error.recoverable && onRetry && (
          <button 
            className={styles.retryButton} 
            onClick={onRetry}
            aria-label="再試行"
          >
            再試行
          </button>
        )}
        {onDismiss && (
          <button 
            className={styles.dismissButton} 
            onClick={onDismiss}
            aria-label="エラーを閉じる"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};