import React, { useState, useCallback } from 'react'
import styles from './ImageInput.module.css'

interface ImageInputProps {
  imageUrl?: string | null
  imageWidth?: number
  imageHeight?: number
  isLoading?: boolean
  error?: string | null
  onFileSelect?: (file: File) => void
  onRemove?: () => void
}

export const ImageInput: React.FC<ImageInputProps> = ({
  imageUrl,
  imageWidth,
  imageHeight,
  isLoading = false,
  error = null,
  onFileSelect,
  onRemove
}) => {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && onFileSelect) {
      onFileSelect(files[0])
    }
  }, [onFileSelect])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && onFileSelect) {
      onFileSelect(files[0])
    }
  }, [onFileSelect])

  const handleClick = useCallback(() => {
    if (!imageUrl) {
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
  }, [imageUrl, onFileSelect])

  const containerClasses = [
    styles.container,
    isDragOver && styles.dragOver,
    imageUrl && styles.hasImage
  ].filter(Boolean).join(' ')

  return (
    <div
      className={containerClasses}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
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

      {!isLoading && !imageUrl && (
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
          >
            ファイルを選択
          </button>
        </div>
      )}

      {!isLoading && imageUrl && (
        <>
          <img 
            src={imageUrl} 
            alt="Original" 
            className={styles.imagePreview}
          />
          {imageWidth && imageHeight && (
            <div className={styles.imageInfo}>
              <span className={styles.dimensions}>
                {imageWidth} × {imageHeight} px
              </span>
            </div>
          )}
          {onRemove && (
            <button
              className={styles.removeButton}
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
            >
              削除
            </button>
          )}
        </>
      )}

      {error && (
        <div className={styles.error}>{error}</div>
      )}
    </div>
  )
}