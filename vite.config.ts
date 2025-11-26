import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Configuração oficial e funcional para Render (Site Estático)
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente (Render + .env)
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Embed das variáveis no bundle (Render não tem process.env em runtime)
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.ADMIN_CODE': JSON.stringify(env.ADMIN_CODE),
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          format: 'es'
        }
      }
    }
  };
});
