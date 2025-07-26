import { app, BrowserWindow } from 'electron'
import path from 'path'
import { setupFileDialog, setupSaveDialog } from './dialogs'
import { createApplicationMenu } from './menu'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default',
    backgroundColor: '#0a0a0a', // レトロターミナル風の背景色
    show: false // 準備完了まで表示しない
  })

  // ウィンドウの準備完了時に表示
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  // IPCハンドラーをセットアップ
  setupFileDialog()
  setupSaveDialog()
  
  // アプリケーションメニューを作成
  createApplicationMenu()
  
  // メインウィンドウを作成
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})