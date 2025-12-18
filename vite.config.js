import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxy SDK token requests to our secure server
      '/api/sdktoken': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      // Proxy chat agent requests (uncomment when needed)
      // '/api': {
      //   target: 'http://localhost:8080',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, '/invocations')
      // }
    }
  }
})
