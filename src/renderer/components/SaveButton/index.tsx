import React from 'react'
import type { SaveMessage } from '../../hooks'

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
  return (
    <div className={className}>
      <button 
        onClick={onSave}
        disabled={isDisabled}
        style={{
          padding: 'var(--spacing-sm) var(--spacing-lg)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontWeight: 'bold',
          backgroundColor: isDisabled ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
          color: isDisabled ? 'var(--color-text-inactive)' : 'var(--color-text-primary)',
          border: '1px solid',
          borderColor: isDisabled ? 'var(--color-text-inactive)' : 'var(--color-text-primary)',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: 'all var(--transition-duration) ease-in-out',
          opacity: isSaving ? 0.7 : 1
        }}
      >
        {isSaving ? 'SAVING...' : 'EXPORT PNG'}
      </button>
      
      {message && (
        <div
          style={{
            marginTop: 'var(--spacing-sm)',
            fontSize: '12px',
            color: message.type === 'error' ? 'var(--color-error)' : 'var(--color-text-primary)',
            fontFamily: 'var(--font-family-mono)',
            animation: 'fadeIn 150ms ease-in-out'
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}