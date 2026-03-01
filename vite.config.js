import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Build: 2026-03-01-v2 — FiscalAdvisor + SubsidyWinWin + WowEffects + PWA
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_ANTHROPIC_API_KEY': JSON.stringify(env.VITE_ANTHROPIC_API_KEY || ''),
      'import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_STRIPE_PUBLISHABLE_KEY || ''),
      'import.meta.env.VITE_STRIPE_PAYMENT_LINK_49': JSON.stringify(env.VITE_STRIPE_PAYMENT_LINK_49 || ''),
      'import.meta.env.VITE_STRIPE_PAYMENT_LINK_SUB': JSON.stringify(env.VITE_STRIPE_PAYMENT_LINK_SUB || ''),
      'import.meta.env.VITE_BUILD_DATE': JSON.stringify('2026-03-01'),
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
