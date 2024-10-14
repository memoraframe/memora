import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({exclude: ["webdav"]})
    ],
    build: {
      rollupOptions: {
        external: [
          "sharp"
        ]
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: [
          "sharp"
        ]
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@types': resolve('src/types')
      }
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        external: [
          "sharp"
        ]
      }
    }
  }
})
