import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      babel: {
        parserOpts: {
          plugins: ['jsx', 'typescript']
        }
      }
    }),
  ],
  server: {
    host: true,
    port: 3000,
    strictPort: false
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'lucide-react'],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
  },
});
