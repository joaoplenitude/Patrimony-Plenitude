import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Aumenta o limite de aviso de tamanho de chunk (opcional, mas bom para logs mais limpos)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      // CRÍTICO: Lista de dependências que NÃO devem ser empacotadas pelo Vite.
      // O Vite vai ignorar esses imports durante o build, e o navegador vai 
      // resolvê-los usando o <script type="importmap"> definido no index.html.
      // Isso resolve o erro "Rollup failed to resolve import 'react-is'" e outros erros de dependência.
      external: [
        'react',
        'react-dom',
        'recharts',
        '@supabase/supabase-js',
        '@google/genai',
        'lucide-react'
      ],
      output: {
        // Garante que o output continue usando "import ... from 'react'"
        // para que o importmap do navegador funcione.
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
});