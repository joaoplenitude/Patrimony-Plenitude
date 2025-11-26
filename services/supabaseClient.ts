import { createClient } from '@supabase/supabase-js';

// Função segura para ler configuração
const getConfig = (key: string, storageKey: string) => {
  // 1. Tenta variáveis substituídas pelo Vite no build
  if (key === 'SUPABASE_URL' && process.env.SUPABASE_URL) return process.env.SUPABASE_URL;
  if (key === 'SUPABASE_ANON_KEY' && process.env.SUPABASE_ANON_KEY) return process.env.SUPABASE_ANON_KEY;

  // 2. Tenta import.meta.env (compatível com Vite)
  const metaEnv = (import.meta as any).env?.[key];
  if (metaEnv) return metaEnv;

  // 3. Fallback para localStorage (config manual no navegador)
  if (typeof window !== 'undefined') {
    return localStorage.getItem(storageKey);
  }

  return null;
};

const supabaseUrl = getConfig('SUPABASE_URL', 'sb_url');
const supabaseAnonKey = getConfig('SUPABASE_ANON_KEY', 'sb_key');

// Validação de URL
const isValidUrl = (u: string | null): u is string => {
  try {
    if (!u) return false;
    const obj = new URL(u);
    return obj.protocol === 'http:' || obj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Inicializa o cliente se houver credenciais
export const supabase = isValidUrl(supabaseUrl) && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
  