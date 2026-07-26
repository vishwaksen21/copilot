import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: resolve('electron/main/index.ts')
      },
      rollupOptions: {
        external: ['electron']
      }
    },
    resolve: {
      alias: {
        '@shared': resolve('electron/shared')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: resolve('electron/preload/index.ts')
      },
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  renderer: {
    root: '.',
    build: {
      rollupOptions: {
        input: 'index.html'
      }
    },
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
