/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.VERCEL ? '/' : (process.env.NODE_ENV === 'production' ? '/pixel-game/' : '/'),
  // @ts-expect-error type mismatch between vite plugin and vitest
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
  }
})
