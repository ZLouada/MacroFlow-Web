import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to backend server during development
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy WebSocket connections
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
      // Proxy health check endpoints
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Code splitting strategy for optimal caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
          ],
          'i18n-vendor': ['i18next', 'react-i18next'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
  },
  // Optimize deps for faster dev startup
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      '@tanstack/react-virtual',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
    ],
  },
});
