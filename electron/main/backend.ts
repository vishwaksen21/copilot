import { spawn, ChildProcess } from 'child_process'
import { join } from 'path'
import { app } from 'electron'
import http from 'http'
import { is } from '@electron-toolkit/utils'

let backendProcess: ChildProcess | null = null
const BACKEND_PORT = 8000

export async function startBackend(): Promise<ChildProcess | null> {
  const isDev = is.dev

  // Check if backend is already running
  try {
    const healthy = await checkHealth(`http://127.0.0.1:${BACKEND_PORT}/api/v1/health`)
    if (healthy) {
      console.log('[Backend] Already running on port', BACKEND_PORT)
      return null
    }
  } catch {
    // Not running, need to start it
  }

  let command: string
  let args: string[] = []
  let cwd: string

  if (isDev) {
    command = process.platform === 'win32' ? 'python' : 'python3'
    args = ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', String(BACKEND_PORT)]
    cwd = join(process.cwd(), 'backend')
  } else {
    // In production, look for bundled backend executable
    const backendPath = join(
      process.resourcesPath,
      'backend',
      process.platform === 'win32' ? 'backend.exe' : 'backend'
    )
    command = backendPath
    args = []
    cwd = join(process.resourcesPath, 'backend')
  }

  const proc = spawn(command, args, {
    cwd,
    env: {
      ...process.env,
      PORT: String(BACKEND_PORT),
      PYTHONPATH: cwd
    },
    stdio: isDev ? 'pipe' : 'ignore'
  })

  proc.on('error', (error) => {
    console.error('[Backend] Process error:', error.message)
  })

  proc.on('exit', (code) => {
    console.log(`[Backend] Process exited with code ${code}`)
    backendProcess = null
  })

  backendProcess = proc
  return proc
}

export function stopBackend(proc: ChildProcess): void {
  if (proc && !proc.killed) {
    proc.kill('SIGTERM')
    setTimeout(() => {
      if (proc && !proc.killed) {
        proc.kill('SIGKILL')
      }
    }, 5000)
  }
}

export async function waitForBackend(
  healthUrl: string,
  retries: number = 30,
  interval: number = 1000
): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const healthy = await checkHealth(healthUrl)
      if (healthy) return true
    } catch {
      // Backend not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, interval))
  }
  return false
}

function checkHealth(url: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode === 200)
    })
    req.on('error', reject)
    req.setTimeout(2000, () => {
      req.destroy()
      reject(new Error('Health check timeout'))
    })
  })
}
