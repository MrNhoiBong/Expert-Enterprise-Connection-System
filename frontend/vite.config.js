import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// cấu hình server để host 0.0.0.0 và port 6060
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 6060
  }
})
