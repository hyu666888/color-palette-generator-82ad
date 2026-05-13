import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/color-palette-generator-82ad/',
  plugins: [react(), tailwindcss()],
})
