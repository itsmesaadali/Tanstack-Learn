import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'url'

import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'


const config = defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    devtools(),
    nitro(),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  optimizeDeps: {
    exclude: ['@tanstack/start-server-core', '@tanstack/react-router'],
  },
 nitro: {
    rollupConfig: {
      external: ['pg'], // Tell Rollup not to try and bundle pg
      output: {
        interop: 'auto', // Helps with CommonJS/ESM compatibility
      },
    },
  },
})

export default config
