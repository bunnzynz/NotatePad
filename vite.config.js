import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

let commitHash = process.env.COMMIT_HASH ?? 'dev'
if (commitHash === 'dev') {
  try { commitHash = execSync('git rev-parse --short HEAD').toString().trim() } catch (_) {}
}
const buildTime = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC'

export default defineConfig({
  plugins: [react()],
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
    __BUILD_TIME__:  JSON.stringify(buildTime),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vexflow': ['vexflow'],
          'tone':    ['tone'],
          'vendor':  ['react', 'react-dom', 'zustand'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
  },
})
