import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    define: {
      // Expose VITE_ANTHROPIC_API_KEY même si absent du .env local
      'import.meta.env.VITE_ANTHROPIC_API_KEY': JSON.stringify(
        env.VITE_ANTHROPIC_API_KEY || ''
      ),
    },
    preview: {
      port: process.env.PORT || 4173,
      host: '0.0.0.0',
      allowedHosts: 'all',
    },
    build: {
      outDir: 'dist',
    }
  }
})
