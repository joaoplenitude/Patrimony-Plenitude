import { createClient } from '@supabase/supabase-js';

// Função segura para ler variáveis de ambiente ou localStorage
const getConfig = (key: string, storageKey: string) => {
  // Tenta ler do process.env (seguro agora com o polyfill no index.html)
  // ou do import.meta.env (padrão Vite)
  const envVal = process.env[key] || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]);
  
  if (envVal) return envVal;
  
  // Fallback para localStorage (configuração manual)
  if (typeof window !== 'undefined') {
    return localStorage.getItem(storageKey);
  }
  
  return null;
};

const supabaseUrl = getConfig('SUPABASE_URL', 'sb_url');
const supabaseAnonKey = getConfig('SUPABASE_ANON_KEY', 'sb_key');

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