import React from 'react'
import styles from './SaveButton.module.css'

interface SaveButtonProps {
  onSave: () => void
  isSaving: boolean
  isDisabled: boolean
}

export const SaveButton: React.FC<SaveButtonProps> = ({ 
  onSave,
  isSaving,
  isDisabled
}) => {
  const buttonClasses = [
    styles.button,
    isSaving && styles.saving
  ].filter(Boolean).join(' ')

  return (
    <button 
      onClick={onSave}
      disabled={isDisabled}
      className={buttonClasses}
      aria-label="画像をPNG形式で保存"
      aria-busy={isSaving}
      title="画像をPNG形式で保存 (Cmd/Ctrl + S)"
    >
      {isSaving ? 'SAVING...' : 'EXPORT PNG'}
    </button>
  )
}