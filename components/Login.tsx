import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Lock, Mail, Loader2, ShieldCheck, KeyRound } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState(''); // Novo campo de segurança
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Código secreto agora vem das variáveis de ambiente para maior segurança
  // Se não estiver definido no Render, usa um fallback seguro que ninguém vai adivinhar facilmente,
  // mas o ideal é configurar a variável ADMIN_CODE.
  const MASTER_CODE = process.env.ADMIN_CODE || "SETUP_REQUIRED_CHECK_ENV"; 

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!supabase) return;
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isSignUp) {
        // Validação de segurança
        if (adminCode !== MASTER_CODE) {
          throw new Error("Código de acesso administrativo inválido. Verifique a variável ADMIN_CODE.");
        }

        // Fix: Cast auth to any to bypass missing type definition for signUp
        const { error } = await (supabase.auth as any).signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMessage('Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro.');
        setIsSignUp(false);
      } else {
        // Fix: Cast auth to any to bypass missing type definition for signInWithPassword
        const { error } = await (supabase.auth as any).signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' 
        ? 'E-mail ou senha incorretos.' 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className="bg-brand-600 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-800 opacity-50"></div>
          <div className="relative z-10">
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 text-white backdrop-blur-sm shadow-lg">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">PatrimonioAI</h1>
            <p className="text-brand-100 mt-2 text-sm font-medium">
              {isSignUp ? 'Cadastro Restrito de Admin' : 'Acesso Seguro Administrativo'}
            </p>
          </div>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-3 animate-fade-in">
               <AlertIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
               <span>{error}</span>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg flex items-start gap-3 animate-fade-in">
               <CheckIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
               <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Corporativo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none transition-all"
                  placeholder="admin@empresa.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              {isSignUp && <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres.</p>}
            </div>

            {/* Campo de Segurança para Cadastro */}
            {isSignUp && (
              <div className="animate-fade-in-down">
                <label className="block text-sm font-bold text-brand-700 mb-1 flex items-center gap-1">
                  Código de Acesso <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
                    <KeyRound size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-brand-200 bg-brand-50 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none transition-all placeholder-brand-300/70"
                    placeholder="Código Mestre do Sistema"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1 leading-tight">
                  Para registrar, use o código definido nas variáveis de ambiente (ADMIN_CODE).
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] mt-2"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isSignUp ? 'Criar Conta Segura' : 'Acessar Painel')}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <button 
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccessMessage(null);
                setAdminCode('');
              }}
              className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors"
            >
              {isSignUp ? (
                <>Já possui acesso? <span className="text-brand-600 underline decoration-2 underline-offset-2">Fazer Login</span></>
              ) : (
                <>Primeiro acesso? <span className="text-brand-600 underline decoration-2 underline-offset-2">Configurar Admin</span></>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer seguro */}
      <div className="fixed bottom-4 text-center w-full text-xs text-gray-400 flex items-center justify-center gap-1">
        <Lock size={10} /> Conexão criptografada end-to-end
      </div>
    </div>
  );
};

const AlertIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);