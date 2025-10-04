import path from 'path'
import { defineConfig } from 'vite'
// Optional: if vite-plugin-pwa is installed in the subproject, uncomment and configure below
// import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  root: path.resolve(__dirname),
  server: {
    host: true, // listen on all addresses, required for devcontainers
    port: 5173,
    strictPort: true // fail if port is taken instead of auto-picking another
  },
  // build: { outDir: 'dist' },
  // plugins: [VitePWA({/* ... */})]
})
