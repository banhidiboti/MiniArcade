import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base:'/MiniArcade/',
  // forward leaderboard calls to the API (npm run api)
  server: { proxy: { '/api': 'http://localhost:3210' } },
  preview: { proxy: { '/api': 'http://localhost:3210' } },
})
