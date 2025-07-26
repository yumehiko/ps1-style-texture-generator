import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onOpenFile?: () => void;
  onSaveFile?: () => void;
  onReset?: () => void;
}

export const useKeyboardShortcuts = ({
  onOpenFile,
  onSaveFile,
  onReset
}: ShortcutHandlers) => {
  const handleKeyDown = useCallback((event: globalThis.KeyboardEvent) => {
    // macOSではCmd、WindowsではCtrlを使用
    const isMod = event.metaKey || event.ctrlKey;
    
    if (isMod) {
      switch (event.key.toLowerCase()) {
        case 'o':
          event.preventDefault();
          onOpenFile?.();
          break;
        case 's':
          event.preventDefault();
          onSaveFile?.();
          break;
        case 'r':
          if (event.shiftKey) {
            event.preventDefault();
            onReset?.();
          }
          break;
      }
    }
  }, [onOpenFile, onSaveFile, onReset]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // ショートカット情報を返す
  return {
    shortcuts: [
      { key: 'Cmd/Ctrl + O', description: '画像を開く' },
      { key: 'Cmd/Ctrl + S', description: '画像を保存' },
      { key: 'Cmd/Ctrl + Shift + R', description: 'リセット' }
    ]
  };
};