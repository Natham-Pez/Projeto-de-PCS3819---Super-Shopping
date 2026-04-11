import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/analytics': {
        target: 'http://143.107.102.8:8090',
        changeOrigin: true,
        secure: false,
      },
      '/lab': {
        target: 'http://143.107.102.8:8090',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})