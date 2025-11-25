import React, { useState } from 'react';
import { Database, Save, AlertCircle, ShieldAlert } from 'lucide-react';

export const SupabaseSetup: React.FC = () => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !key) return;

    // Basic security check warning
    if (key.startsWith('eyJ') && key.length > 200 && !key.includes('public') && process.env.NODE_ENV !== 'production') {
        const confirm = window.confirm("Atenção: Verifique se você copiou a chave 'anon' / 'public'. Se você usar a chave 'service_role', seu banco de dados ficará vulnerável. Deseja continuar?");
        if (!confirm) return;
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
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-bold text-amber-800">Segurança da API Key</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Use APENAS a chave <strong>anon public</strong> encontrada em:
                  <br/>
                  <span className="font-mono text-xs bg-amber-100 px-1 rounded">Dashboard &gt; Settings &gt; API</span>
                  <br/>
                  Nunca utilize a chave `service_role` neste campo.
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
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg shadow-sm transition-all active:scale-[0.98]"
            >
              <Save size={18} />
              Salvar e Conectar Seguro
            </button>
          </form>
          
          <p className="text-center text-xs text-gray-400 mt-4">
            Seus dados são salvos apenas no navegador para esta sessão.
          </p>
        </div>
      </div>
    </div>
  );
};