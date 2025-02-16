import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,  // 소스맵 활성화
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
