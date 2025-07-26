import { useState } from 'react'
import { useAppContext } from '../contexts'
import { fileService } from '../services'

export interface SaveMessage {
  type: 'success' | 'error' | 'warning'
  text: string
}

export const useSaveImage = () => {
  const { state } = useAppContext()
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<SaveMessage | null>(null)

  const handleSave = async () => {
    if (!state.processedImage) return

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const result = await fileService.saveImage(
        state.processedImage,
        state.parameters,
        state.originalFileName || undefined
      )

      if (result.success) {
        setSaveMessage({
          type: 'success',
          text: `保存完了: ${result.filePath?.split('/').pop() || 'ファイル'}`
        })
        setTimeout(() => setSaveMessage(null), 3000)
      } else if (!result.error) {
        // キャンセルの場合
        setSaveMessage({
          type: 'warning',
          text: '保存をキャンセルしました'
        })
      } else {
        setSaveMessage({
          type: 'error',
          text: result.error?.message || '保存に失敗しました'
        })
      }
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '予期しないエラーが発生しました'
      })
    } finally {
      setIsSaving(false)
    }
  }

  return {
    handleSave,
    isSaving,
    saveMessage,
    canSave: !!state.processedImage
  }
}