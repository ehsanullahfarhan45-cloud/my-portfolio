import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        inlineDynamicImports: false,
        chunkFileNames: 'assets/[name]-[hash].js',
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/')

          if (normalizedId.includes('node_modules')) {
            if (normalizedId.includes('@firebase/app')) return 'firebase-app'
            if (normalizedId.includes('@firebase/auth')) return 'firebase-auth'
            if (normalizedId.includes('@firebase/firestore')) return 'firebase-firestore'
            if (normalizedId.includes('@firebase/')) return 'firebase-shared'
            if (normalizedId.includes('/firebase/app')) return 'firebase-app'
            if (normalizedId.includes('/firebase/auth')) return 'firebase-auth'
            if (normalizedId.includes('/firebase/firestore')) return 'firebase-firestore'
            if (normalizedId.includes('firebase')) return 'firebase-core'
            if (normalizedId.includes('framer-motion')) return 'framer'
            if (normalizedId.includes('lucide-react')) return 'icons'
            if (normalizedId.includes('react-router-dom')) return 'router'
            if (normalizedId.includes('react-dom') || normalizedId.includes('react')) return 'react'
            return 'vendor'
          }

          if (normalizedId.includes('/src/pages/Home.jsx')) return 'home'
          if (normalizedId.includes('/src/pages/AdminLogin.jsx')) return 'admin-login'
          if (normalizedId.includes('/src/pages/AdminDashboard.jsx')) return 'admin-dashboard'
          if (normalizedId.includes('/src/components/')) return 'shared-ui'
        }
      }
    }
  },
  server: {
    host: true,
    port: 3000
  }
})