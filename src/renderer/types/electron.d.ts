// Electron API type definitions for renderer process

export interface ElectronAPI {
  openFile: () => Promise<{
    canceled: boolean
    filePath?: string
    data?: ArrayBuffer
    error?: string
  }>
  saveFile: (data: ArrayBuffer) => Promise<{
    canceled: boolean
    filePath?: string
    error?: string
  }>
  onMenuAction: (callback: (action: string) => void) => () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}