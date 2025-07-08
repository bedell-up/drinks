import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxy API calls to Flask backend
      '/register': 'http://localhost:5001',
      '/token': 'http://localhost:5001',
      '/users': 'http://localhost:5001',
      '/inventory': 'http://localhost:5001',
      '/scan-barcode': 'http://localhost:5001',
    }
  },
  build: {
    outDir: 'dist'
  }
});
