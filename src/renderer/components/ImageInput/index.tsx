import React, { useCallback } from 'react'
import styles from './ImageInput.module.css'
import { ErrorInfo } from '../../utils/errorMessages'
import { ErrorDisplay } from '../ErrorDisplay'

interface ImageInputProps {
  hasImage?: boolean
  fileName?: string | null
  imageWidth?: number
  imageHeight?: number
  isLoading?: boolean
  error?: ErrorInfo | null
  onFileSelect?: (file: File) => void
  onRemove?: () => void
  onOpenDialog?: () => void
  onDismissError?: () => void
}

export const ImageInput: React.FC<ImageInputProps> = ({
  hasImage = false,
  fileName,
  imageWidth,
  imageHeight,
  isLoading = false,
  error = null,
  onFileSelect,
  onRemove: _onRemove,
  onOpenDialog,
  onDismissError
}) => {
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && onFileSelect) {
      onFileSelect(files[0])
    }
  }, [onFileSelect])

  const handleClick = useCallback(() => {
    if (onOpenDialog) {
      onOpenDialog()
    } else {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement
        if (target.files && target.files[0] && onFileSelect) {
          onFileSelect(target.files[0])
        }
      }
      input.click()
    }
  }, [onFileSelect, onOpenDialog])

  const containerClasses = [
    styles.container,
    hasImage && styles.hasImage
  ].filter(Boolean).join(' ')

  return (
    <div
      className={containerClasses}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label={hasImage ? `選択された画像: ${fileName}` : '画像を選択'}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {isLoading && (
        <div className={styles.loading}>画像を読み込み中...</div>
      )}

      {!isLoading && !hasImage && (
        <div className={styles.dropzone}>
          <div className={styles.icon}>📁</div>
          <p className={styles.text}>
            画像をドラッグ&ドロップ<br />
            または
          </p>
          <button 
            className={styles.browseButton}
            onClick={(e) => {
              e.stopPropagation()
              handleClick()
            }}
            aria-label="ファイルを選択"
            title="画像ファイルを選択 (Cmd/Ctrl + O)"
          >
            ファイルを選択
          </button>
        </div>
      )}

      {!isLoading && hasImage && (
        <>
          <div className={styles.imageDisplay}>
            {fileName && (
              <div className={styles.fileName}>{fileName}</div>
            )}
            {imageWidth && imageHeight && (
              <div className={styles.imageInfo}>
                <span className={styles.dimensions}>
                  {imageWidth} × {imageHeight} px
                </span>
              </div>
            )}
            <p className={styles.hint}>クリックして別の画像を選択</p>
          </div>
        </>
      )}

      {error && (
        <ErrorDisplay
          error={error}
          onDismiss={onDismissError}
          onRetry={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement
              if (target.files && target.files[0] && onFileSelect) {
                onFileSelect(target.files[0])
              }
            }
            input.click()
          }}
        />
      )}
    </div>
  )
}