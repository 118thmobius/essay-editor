import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    root: '.',
    build: {
      outDir: 'dist'
    },
    server: {
      proxy: {
        '/api/grade': {
          target: env.VITE_API_TARGET,
          changeOrigin: true,
          rewrite: () => '/grade',
          secure: true
        }
      }
    }
  };
})