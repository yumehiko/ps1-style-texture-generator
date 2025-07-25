const { spawn } = require('child_process')
const { existsSync } = require('fs')
const { join } = require('path')

const mainPath = join(__dirname, 'dist/main/index.js')

function startElectron() {
  if (existsSync(mainPath)) {
    const electron = spawn('electron', [mainPath], {
      env: { ...process.env, NODE_ENV: 'development' },
      stdio: 'inherit'
    })
    
    electron.on('close', (code) => {
      if (code !== 0) {
        console.error(`Electron exited with code ${code}`)
      }
    })
  } else {
    console.log('Waiting for main process to compile...')
    setTimeout(startElectron, 1000)
  }
}

startElectron()