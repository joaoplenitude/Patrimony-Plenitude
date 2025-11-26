import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente do sistema (Render) ou arquivo .env
  // O terceiro parâmetro '' permite carregar variáveis que não começam com VITE_
  // Fix: Use '.' instead of process.cwd() to avoid TS error about missing process types
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    // Define variáveis globais para substituição em tempo de build.
    // Isso é essencial para Sites Estáticos no Render, pois não há servidor Node rodando.
    define: {
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.ADMIN_CODE': JSON.stringify(env.ADMIN_CODE),
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        // Mantém a estratégia de usar CDN (ImportMap) para reduzir tamanho do bundle
        // e evitar erros de dependências ausentes (como react-is) no ambiente de build.
        external: [
          'react',
          'react-dom',
          'recharts',
          '@supabase/supabase-js',
          '@google/genai',
          'lucide-react'
        ],
        output: {
          format: 'es', 
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            recharts: 'Recharts',
            '@supabase/supabase-js': 'supabase',
            '@google/genai': 'googleGenai',
            'lucide-react': 'lucide'
          }
        }
      }
    }
  };
});