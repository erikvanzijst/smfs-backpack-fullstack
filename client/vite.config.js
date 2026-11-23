import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In development the API runs separately; proxy it so the client can use
    // the same relative /api path it uses in production.
    proxy: {
      '/api': process.env.API_PROXY_TARGET || 'http://localhost:3000',
    },
  },
})
