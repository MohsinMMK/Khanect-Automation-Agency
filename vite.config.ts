import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true,
    strictPort: false,
  },

  preview: {
    port: 3001,
    host: '0.0.0.0',
  },

  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lenis', 'gsap'],
        },
      },
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js', 'recharts'],
  },

  esbuild: {
    drop: ['console', 'debugger'],
  },
});
