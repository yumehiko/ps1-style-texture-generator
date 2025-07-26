/* global DragEvent */
import { useState, useCallback, useRef, useEffect } from 'react'

interface UseDragDropOptions {
  onFileSelect?: (file: File) => void
  acceptedTypes?: string[]
  onInvalidFile?: (file: File) => void
}

export const useDragDrop = ({ onFileSelect, acceptedTypes, onInvalidFile }: UseDragDropOptions) => {
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  // ファイルがドラッグされているかチェック
  const isFileDrag = useCallback((e: DragEvent) => {
    if (!e.dataTransfer) return false
    
    // itemsがある場合はそれを使用
    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === 'file') {
          return true
        }
      }
    }
    
    // typesでチェック
    return e.dataTransfer.types.includes('Files')
  }, [])

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isFileDrag(e)) return
    
    dragCounter.current++
    if (dragCounter.current === 1) {
      setIsDragging(true)
    }
  }, [isFileDrag])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    dragCounter.current = 0
    setIsDragging(false)
    
    if (!e.dataTransfer || !e.dataTransfer.files || e.dataTransfer.files.length === 0) {
      return
    }
    
    const file = e.dataTransfer.files[0]
    
    // ファイルタイプのチェック
    if (acceptedTypes && acceptedTypes.length > 0) {
      const isAccepted = acceptedTypes.includes(file.type)
      if (!isAccepted) {
        if (onInvalidFile) {
          onInvalidFile(file)
        }
        return
      }
    }
    
    if (onFileSelect) {
      onFileSelect(file)
    }
  }, [onFileSelect, acceptedTypes, onInvalidFile])

  useEffect(() => {
    // document全体にイベントリスナーを追加
    document.addEventListener('dragenter', handleDragEnter)
    document.addEventListener('dragleave', handleDragLeave)
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)

    return () => {
      // クリーンアップ
      document.removeEventListener('dragenter', handleDragEnter)
      document.removeEventListener('dragleave', handleDragLeave)
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
    }
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop])

  return {
    isDragging
  }
}