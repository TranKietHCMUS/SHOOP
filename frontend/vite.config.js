import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Đọc biến môi trường từ file .env trong thư mục cha
  const rootEnvPath = path.resolve(__dirname, '../.env')
  let rootEnv = {}
  
  // Đọc file .env từ thư mục gốc dự án (parent)
  if (fs.existsSync(rootEnvPath)) {
    console.log('Found root .env file, loading variables...')
    const envContent = fs.readFileSync(rootEnvPath, 'utf-8')
    
    // Parse nội dung file .env
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
      if (match) {
        const key = match[1]
        let value = match[2] || ''
        
        // Loại bỏ dấu nháy nếu có
        value = value.replace(/^['"]|['"]$/g, '')
        
        // Lưu các biến bắt đầu bằng VITE_
        if (key.startsWith('VITE_')) {
          rootEnv[key] = value
        }
      }
    })
    
    console.log('Loaded variables from root .env:', Object.keys(rootEnv))
  } else {
    console.log('No root .env file found at:', rootEnvPath)
  }
  
  // Load biến môi trường từ current directory (có thể ghi đè root)
  const env = loadEnv(mode, process.cwd(), '')
  
  // Kết hợp biến môi trường từ cả hai nguồn
  const combinedEnv = { ...rootEnv, ...env }
  
  // Đặt giá trị fallback cho các biến quan trọng nếu chưa được định nghĩa
  const VITE_API_URL = combinedEnv.VITE_API_URL
  const VITE_GOOGLE_MAPS_API_KEY = combinedEnv.VITE_GOOGLE_MAPS_API_KEY
  console.log('Final environment variables:', {
    VITE_API_URL,
    VITE_GOOGLE_MAPS_API_KEY,
    mode
  })
  
  return {
    plugins: [react()],
    server: {
      host: 'localhost',
      port: 3000,
      hmr: {
        host: 'localhost',
        protocol: 'ws',
        port: 3000
      },
      proxy: {
        '/api': {
          target: VITE_API_URL,
          // target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    define: {
      // Inject biến môi trường vào code
      'import.meta.env.VITE_API_URL': JSON.stringify(VITE_API_URL),
      'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(VITE_GOOGLE_MAPS_API_KEY)
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true
    }
  }
})