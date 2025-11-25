import React, { useState } from 'react';
import { Database, Save, AlertCircle, ShieldAlert } from 'lucide-react';

export const SupabaseSetup: React.FC = () => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !key || isSaving) return;
    setIsSaving(true);
    
    // Basic security check warning
    if (key.startsWith('eyJ') && key.length > 200 && !key.includes('public')) {
        const confirm = window.confirm("Atenção: A chave que você colou parece ser uma 'service_role'. Utilizá-la no navegador é extremamente inseguro. Por favor, confirme que você está usando a chave 'anon' pública. Deseja continuar mesmo assim?");
        if (!confirm) {
          setIsSaving(false);
          return;
        }
    }

    localStorage.setItem('sb_url', url);
    localStorage.setItem('sb_key', key);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden">
        <div className="bg-emerald-600 p-6 text-white flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <Database size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Conectar Banco de Dados</h1>
            <p className="text-emerald-100 text-sm">Configuração segura do Supabase</p>
          </div>
        </div>

        <div className="p-8">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-bold text-blue-800">Primeira Configuração Necessária</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Este aplicativo roda 100% no seu navegador. Para conectar ao seu banco de dados Supabase de forma segura, por favor insira as chaves do seu projeto abaixo.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project URL</label>
              <input
                type="url"
                required
                placeholder="https://xyz.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Public Anon Key</label>
              <input
                type="text"
                required
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono text-sm break-all"
              />
               <p className="text-xs text-amber-700 mt-2 p-2 bg-amber-50 rounded-md flex items-start gap-2">
                  <ShieldAlert className="w-5 h-4 flex-shrink-0 mt-0.5" />
                  <span>Use <strong>APENAS</strong> a chave `anon public`. Nunca use a `service_role`.</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-70"
            >
              <Save size={18} />
              {isSaving ? 'Conectando...' : 'Salvar e Conectar'}
            </button>
          </form>
          
          <p className="text-center text-xs text-gray-400 mt-4">
            Seus dados são salvos com segurança apenas no seu navegador.
          </p>
        </div>
      </div>
    </div>
  );
};