import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// CORS origin from environment variable (defaults to wanyumba.com)
// Note: In vite.config.ts, use process.env instead of import.meta.env
const CORS_ORIGIN = process.env.VITE_CORS_ORIGIN || 'https://wanyumba.com'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    cors: {
      origin: CORS_ORIGIN,
      credentials: true,
    },
  },
})

