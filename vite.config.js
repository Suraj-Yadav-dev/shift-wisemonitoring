import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        // The base URL of Google Scripts
        target: 'https://script.google.com',
        changeOrigin: true,
        secure: false,
        // Using your NEW personal script path
        rewrite: (path) => path.replace(/^\/api\/update/, '/macros/s/AKfycbxpBlVgt1TXWreJ6Ue-Xw08VzEq7KK8XebNNr7-YYifeEf6r8vDt6OuiQ7Ru9vq2pJT/exec'),
        // Force Vite to follow the Google redirect automatically
        followRedirects: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy Error:', err);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Google Response Status:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})