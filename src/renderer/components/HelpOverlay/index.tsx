import React, { useEffect, useState } from 'react';
import styles from './HelpOverlay.module.css';

interface Shortcut {
  key: string;
  description: string;
}

const shortcuts: Shortcut[] = [
  { key: 'Cmd/Ctrl + O', description: '画像を開く' },
  { key: 'Cmd/Ctrl + S', description: '画像を保存' },
  { key: 'Cmd/Ctrl + Shift + R', description: 'リセット' },
  { key: '?', description: 'このヘルプを表示' },
];

export const HelpOverlay: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setVisible(true);
      }
    };

    const handleKeyUp = (e: globalThis.KeyboardEvent) => {
      if (e.key === '?' || e.key === 'Shift') {
        setVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <h2 className={styles.title}>KEYBOARD SHORTCUTS</h2>
        <div className={styles.shortcuts}>
          {shortcuts.map((shortcut, index) => (
            <div key={index} className={styles.shortcut}>
              <span className={styles.key}>{shortcut.key}</span>
              <span className={styles.separator}>:</span>
              <span className={styles.description}>{shortcut.description}</span>
            </div>
          ))}
        </div>
        <p className={styles.hint}>? キーを離すと閉じます</p>
      </div>
    </div>
  );
};