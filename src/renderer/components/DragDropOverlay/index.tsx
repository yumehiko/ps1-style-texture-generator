import React from 'react'
import styles from './DragDropOverlay.module.css'

interface DragDropOverlayProps {
  isVisible: boolean
}

export const DragDropOverlay: React.FC<DragDropOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.icon}>📥</div>
        <p className={styles.text}>
          画像をドロップして開く
        </p>
      </div>
    </div>
  )
}