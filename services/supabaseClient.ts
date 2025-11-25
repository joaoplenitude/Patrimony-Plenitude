import { createClient } from '@supabase/supabase-js';

// Função para obter credenciais de Ambiente ou LocalStorage
const getSupabaseConfig = () => {
  const envUrl = process.env.SUPABASE_URL;
  const envKey = process.env.SUPABASE_ANON_KEY;
  
  // Em ambiente de demonstração, permitimos salvar no localStorage
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('sb_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('sb_key') : null;

  return {
    url: envUrl || localUrl || '',
    key: envKey || localKey || ''
  };
};

const { url, key } = getSupabaseConfig();

// Validação básica de URL para evitar crash na inicialização
const isValidUrl = (u: string) => {
  try {
    const obj = new URL(u);
    return obj.protocol === 'http:' || obj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Exporta null se não estiver configurado corretamente.
// O App.tsx vai checar isso e renderizar a tela de Setup se necessário.
export const supabase = isValidUrl(url) && key 
  ? createClient(url, key) 
  : null;