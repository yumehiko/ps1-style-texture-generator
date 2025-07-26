import React from 'react'
import type { SaveMessage } from '../../hooks'
import styles from './SaveButton.module.css'

interface SaveButtonProps {
  onSave: () => void
  isSaving: boolean
  isDisabled: boolean
  message: SaveMessage | null
  className?: string
}

export const SaveButton: React.FC<SaveButtonProps> = ({ 
  onSave,
  isSaving,
  isDisabled,
  message,
  className 
}) => {
  const buttonClasses = [
    styles.button,
    isSaving && styles.saving
  ].filter(Boolean).join(' ')

  const messageClasses = [
    styles.message,
    message?.type === 'error' ? styles.error : styles.success
  ].filter(Boolean).join(' ')

  return (
    <div className={className ? `${styles.container} ${className}` : styles.container}>
      <button 
        onClick={onSave}
        disabled={isDisabled}
        className={buttonClasses}
      >
        {isSaving ? 'SAVING...' : 'EXPORT PNG'}
      </button>
      
      {message && (
        <div className={messageClasses}>
          {message.text}
        </div>
      )}
    </div>
  )
}