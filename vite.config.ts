import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { ProxyOptions } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy for SerpAPI - improved configuration for reliability
      '/api/serpapi': {
        target: 'https://serpapi.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/serpapi/, ''),
        configure: (proxy, _options) => {
          // Log original path before proxy
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // @ts-ignore
            console.log('Original SerpAPI request:', req.method, req.url);
            // @ts-ignore
            console.log('Proxying to SerpAPI:', proxyReq.protocol + '//' + proxyReq.host + proxyReq.path);
          });
          proxy.on('error', (err, _req, _res) => {
            // @ts-ignore
            console.log('SerpAPI proxy error:', err);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // @ts-ignore
            console.log('SerpAPI response received:', proxyRes.statusCode, req.url);
          });
        },
      } as ProxyOptions,
      
      // Dynamic proxying for any domain
      '^/api/([-a-zA-Z0-9]+\\.[a-zA-Z0-9]+\\.[a-zA-Z0-9]+)(.*)': {
        target: 'https://$1',
        changeOrigin: true,
        rewrite: (path) => {
          const matches = path.match(/^\/api\/([-a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9]+)(.*)/);
          return matches ? matches[2] : path;
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            // @ts-ignore
            console.log('Dynamic proxy error:', err);
          });
        },
      } as ProxyOptions,
      
      // Simpler proxy for second-level domains
      '^/api/([-a-zA-Z0-9]+\\.[a-zA-Z0-9]+)(.*)': {
        target: 'https://$1',
        changeOrigin: true,
        rewrite: (path) => {
          const matches = path.match(/^\/api\/([-a-zA-Z0-9]+\.[a-zA-Z0-9]+)(.*)/);
          return matches ? matches[2] : path;
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            // @ts-ignore
            console.log('Dynamic proxy error:', err);
          });
        },
      } as ProxyOptions,
    },
  },
})
