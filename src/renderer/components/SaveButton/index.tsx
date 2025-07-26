import React from 'react'

interface SaveButtonProps {
  onClick?: () => void
  isDisabled?: boolean
}

export const SaveButton: React.FC<SaveButtonProps> = ({ 
  onClick,
  isDisabled = false 
}) => {
  return (
    <button 
      onClick={onClick}
      disabled={isDisabled}
      style={{
        padding: 'var(--spacing-sm) var(--spacing-lg)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontWeight: 'bold'
      }}
    >
      Export
    </button>
  )
}