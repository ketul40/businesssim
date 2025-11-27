import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle size visualization (only in build mode)
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }) as any,
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Production build optimizations
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage', 'firebase/functions'],
          'icons-vendor': ['lucide-react'],
          
          // Feature chunks
          'simulation': [
            './src/components/ChatInterface.tsx',
            './src/components/MessageList.tsx',
            './src/components/MessageInput.tsx',
            './src/hooks/useSimulation.ts',
          ],
          'scenarios': [
            './src/components/ScenarioSelect.tsx',
            './src/components/ScenarioCard.tsx',
            './src/components/ScenarioModal.tsx',
          ],
          'feedback': [
            './src/components/Feedback.tsx',
            './src/components/CriteriaScores.tsx',
            './src/components/MissedOpportunities.tsx',
            './src/components/MomentsThatMattered.tsx',
            './src/components/PracticeDrills.tsx',
          ],
          'progress': [
            './src/components/ProgressDashboard.tsx',
            './src/components/SessionList.tsx',
            './src/components/StatsGrid.tsx',
          ],
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 500, // 500KB warning threshold
    // Source maps for production debugging (optional)
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
  },
});
