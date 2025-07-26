import React from 'react'
import styles from './ClearButton.module.css'

interface ClearButtonProps {
  onClear: () => void
  isDisabled: boolean
  className?: string
}

export const ClearButton: React.FC<ClearButtonProps> = ({ 
  onClear,
  isDisabled,
  className 
}) => {
  return (
    <button 
      onClick={onClear}
      disabled={isDisabled}
      className={className ? `${styles.button} ${className}` : styles.button}
      aria-label="画像とパラメータをクリア"
      title="画像とパラメータをクリア (Cmd/Ctrl + Shift + X)"
    >
      CLEAR
    </button>
  )
}