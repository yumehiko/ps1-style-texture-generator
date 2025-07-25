export interface ElectronAPI {
  openFile: () => Promise<string | null>
  saveFile: (data: ArrayBuffer) => Promise<void>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}