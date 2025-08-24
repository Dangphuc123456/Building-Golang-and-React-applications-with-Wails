import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Tạo alias 'wailsjs' trỏ tới thư mục wailsjs ngoài src
      'wailsjs': path.resolve(__dirname, 'wailsjs'),
    },
  },
})