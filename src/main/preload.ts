import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

// Type definitions for the exposed API
export interface ElectronAPI {
  openFile: () => Promise<{
    canceled: boolean
    filePath?: string
    data?: ArrayBuffer
    error?: string
  }>
  saveFile: (data: ArrayBuffer, defaultFilename?: string) => Promise<{
    canceled: boolean
    filePath?: string
    error?: string
  }>
  onMenuAction: (callback: (action: string) => void) => () => void
}

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (data: ArrayBuffer, defaultFilename?: string) => ipcRenderer.invoke('dialog:saveFile', data, defaultFilename),
  
  // メニューアクションのリスナー
  onMenuAction: (callback: (action: string) => void) => {
    const handler = (_event: IpcRendererEvent, action: string) => callback(action)
    
    // リスナーを登録
    ipcRenderer.on('menu:openFile', () => handler({} as IpcRendererEvent, 'openFile'))
    ipcRenderer.on('menu:saveFile', () => handler({} as IpcRendererEvent, 'saveFile'))
    
    // クリーンアップ関数を返す
    return () => {
      ipcRenderer.removeAllListeners('menu:openFile')
      ipcRenderer.removeAllListeners('menu:saveFile')
    }
  }
})