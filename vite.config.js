import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router', 'react-router-dom']
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  optimizeDeps: {
    include: ['prop-types', 'react', 'react-dom', 'react-router', 'react-router-dom']
  },
  build: {
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 900,
		rollupOptions: {
			output: {
				// Simplificar el splitting para evitar condiciones de ejecución cruzada
				manualChunks(id) {
					const norm = id.replace(/\\/g, '/')
					if (norm.includes('node_modules')) {
						return 'vendor'
					}
				}
			}
		}
  }
})
