import { createClient } from '@supabase/supabase-js';

// Em um ambiente de site estático (Render, Vercel, etc.), o código do navegador
// não tem acesso seguro a variáveis de ambiente do servidor.
// Portanto, a única forma robusta é ler a configuração salva no localStorage do navegador.

const supabaseUrl = typeof window !== 'undefined' ? localStorage.getItem('sb_url') : null;
const supabaseAnonKey = typeof window !== 'undefined' ? localStorage.getItem('sb_key') : null;

const isValidUrl = (u: string | null): u is string => {
  try {
    if (!u) return false;
    const obj = new URL(u);
    return obj.protocol === 'http:' || obj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Se tivermos URL e Key válidas do localStorage, criamos o cliente.
// Caso contrário, exportamos `null`. O App.tsx detectará isso e mostrará a tela de Setup.
export const supabase = isValidUrl(supabaseUrl) && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
