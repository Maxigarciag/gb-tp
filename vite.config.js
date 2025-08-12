import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  build: {
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const norm = id.replace(/\\/g, '/');
          if (norm.includes('node_modules')) {
            if (
              norm.includes('react/') ||
              norm.includes('react-dom') ||
              norm.includes('react-router')
            ) {
              return 'react-vendor'
            }
            if (norm.includes('@supabase')) return 'supabase'
            if (norm.includes('framer-motion')) return 'motion'
            if (norm.includes('recharts')) return 'charts'
            if (
              norm.includes('lucide-react') ||
              norm.includes('@fortawesome') ||
              norm.includes('react-icons')
            ) {
              return 'icons'
            }
            if (norm.includes('@radix-ui')) return 'radix'
            if (norm.includes('zustand')) return 'zustand'
            if (
              norm.includes('react-hook-form') ||
              norm.includes('@hookform') ||
              norm.includes('zod')
            ) {
              return 'forms'
            }
            if (
              norm.includes('clsx') ||
              norm.includes('class-variance-authority') ||
              norm.includes('tailwind-merge')
            ) {
              return 'ui-utils'
            }
            return 'vendor'
          }

          // Agrupar por features grandes para mejorar caché
          if (
            norm.includes('/src/pages/progreso') ||
            norm.includes('/src/components/progreso')
          ) {
            return 'feature-progreso'
          }
          if (
            norm.includes('/src/components/CalendarioRutina') ||
            norm.includes('/src/components/Ejercicio') ||
            norm.includes('/src/components/ListaDias')
          ) {
            return 'feature-rutina'
          }
        }
      }
    }
  }
})
