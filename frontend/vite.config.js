import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    // Output directory
    outDir: 'dist',

    // Generate sourcemaps for production debugging (optional)
    sourcemap: false,

    // Optimize bundle size - using esbuild for faster builds
    minify: 'esbuild',

    // Esbuild minification options
    esbuildOptions: {
      drop: ['console', 'debugger'], // Remove console.logs and debuggers in production
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 600,

    // Rollup-specific options
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'socket-vendor': ['socket.io-client'],
        },

        // Generate more readable chunk names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    // Target modern browsers for smaller bundles
    target: 'es2015',

    // CSS code splitting
    cssCodeSplit: true,

    // Reduce bundle size by tree-shaking
    reportCompressedSize: true,
  },

  // Development server configuration
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: false,
  },

  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: false,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'socket.io-client'],
    exclude: [],
  },

  // Enable CSS preprocessing optimizations
  css: {
    devSourcemap: false,
  },
});
