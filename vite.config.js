import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/NOMBRE_DE_TU_REPO/',
  plugins: [react()],
})
