import { createClient } from '@supabase/supabase-js';

// Função segura para ler configuração
const getConfig = (key: string, storageKey: string) => {
  // 1. Tenta ler variáveis injetadas pelo Vite (define no vite.config.ts)
  // O acesso direto via process.env.NOME_DA_VAR é necessário para a substituição funcionar
  if (key === 'SUPABASE_URL' && process.env.SUPABASE_URL) return process.env.SUPABASE_URL;
  if (key === 'SUPABASE_ANON_KEY' && process.env.SUPABASE_ANON_KEY) return process.env.SUPABASE_ANON_KEY;
  
  // 2. Fallback para verificação genérica (caso não tenha sido substituído)
  const envVal = process.env[key] || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]);
  if (envVal) return envVal;
  
  // 3. Fallback para localStorage (configuração manual via tela de Setup)
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