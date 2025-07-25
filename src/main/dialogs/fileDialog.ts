import { dialog, ipcMain } from 'electron'
import { readFile } from 'fs/promises'

export interface OpenFileResult {
  canceled: boolean
  filePath?: string
  data?: ArrayBuffer
  error?: string
}

export function setupFileDialog(): void {
  ipcMain.handle('dialog:openFile', async (): Promise<OpenFileResult> => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Select Image',
        properties: ['openFile'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (result.canceled || !result.filePaths[0]) {
        return { canceled: true }
      }

      const filePath = result.filePaths[0]
      const buffer = await readFile(filePath)
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      )

      return {
        canceled: false,
        filePath,
        data: arrayBuffer
      }
    } catch (error) {
      return {
        canceled: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })
}