import { createClient } from '@supabase/supabase-js';

// Helper para ler variáveis de ambiente de forma segura em diferentes builds (Vite, CRA, Next, etc)
const getEnvVar = (key: string) => {
  // 1. Tenta padrão Vite (import.meta.env)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${key}`]) {
    // @ts-ignore
    return import.meta.env[`VITE_${key}`];
  }

  // 2. Tenta padrão Node/CRA (process.env)
  if (typeof process !== 'undefined' && process.env) {
    // Tenta nome exato
    if (process.env[key]) return process.env[key];
    // Tenta prefixo React App
    if (process.env[`REACT_APP_${key}`]) return process.env[`REACT_APP_${key}`];
    // Tenta prefixo Vite no process
    if (process.env[`VITE_${key}`]) return process.env[`VITE_${key}`];
  }

  return null;
};

const getSupabaseConfig = () => {
  // Nomes das variáveis que você deve configurar no Render:
  // 1. SUPABASE_URL
  // 2. SUPABASE_ANON_KEY
  
  const envUrl = getEnvVar('SUPABASE_URL');
  const envKey = getEnvVar('SUPABASE_ANON_KEY');

  // Se encontrou no ambiente (Deploy), usa eles e ignora o localStorage
  if (envUrl && envKey) {
    return { url: envUrl, key: envKey };
  }
  
  // Fallback: Se não tem env vars, tenta ler do LocalStorage (Configuração Manual via tela Setup)
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('sb_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('sb_key') : null;

  return {
    url: localUrl || '',
    key: localKey || ''
  };
};

const { url, key } = getSupabaseConfig();

// Validação básica de URL
const isValidUrl = (u: string) => {
  try {
    if (!u) return false;
    const obj = new URL(u);
    return obj.protocol === 'http:' || obj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Se tivermos URL e Key válidas, criamos o cliente. 
// Caso contrário exportamos null, o que fará o App.tsx mostrar a tela de Setup.
export const supabase = isValidUrl(url) && key 
  ? createClient(url, key) 
  : null;