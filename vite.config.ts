
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente baseadas no 'mode' (development/production)
  // Fix: replaced process.cwd() with '.' to avoid TypeScript errors in environments without @types/node
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    define: {
      // Expõe as variáveis para o código fonte através de process.env
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'process.env.VITE_SUPABASE_KEY': JSON.stringify(env.VITE_SUPABASE_KEY || ''),
    },
    server: {
      host: true,
      port: 3000
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      // Otimização para produção
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
    }
  };
});