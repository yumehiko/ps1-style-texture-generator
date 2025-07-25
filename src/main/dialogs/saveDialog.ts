import { dialog, ipcMain } from 'electron'
import { writeFile } from 'fs/promises'
import path from 'path'

export interface SaveFileResult {
  canceled: boolean
  filePath?: string
  error?: string
}

export function setupSaveDialog(): void {
  ipcMain.handle('dialog:saveFile', async (_, data: ArrayBuffer): Promise<SaveFileResult> => {
    try {
      const result = await dialog.showSaveDialog({
        title: 'Save Processed Image',
        defaultPath: `ps1-texture-${Date.now()}.png`,
        filters: [
          { name: 'PNG Image', extensions: ['png'] },
          { name: 'JPEG Image', extensions: ['jpg', 'jpeg'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (result.canceled || !result.filePath) {
        return { canceled: true }
      }

      const filePath = result.filePath
      
      // Ensure proper extension
      const ext = path.extname(filePath).toLowerCase()
      const finalPath = ['.png', '.jpg', '.jpeg'].includes(ext) 
        ? filePath 
        : filePath + '.png'

      // Convert ArrayBuffer to Buffer for writing
      const buffer = Buffer.from(data)
      await writeFile(finalPath, buffer)

      return {
        canceled: false,
        filePath: finalPath
      }
    } catch (error) {
      return {
        canceled: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })
}