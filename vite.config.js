import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // The deployed commit (Vercel sets VERCEL_GIT_COMMIT_SHA), attached to error reports.
  define: {
    'import.meta.env.VITE_RELEASE': JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Vitest: unit tests live next to the code as *.test.js(x); jsdom provides window/localStorage.
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}'],
    restoreMocks: true,
  },
})
