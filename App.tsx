import React, { useState, useEffect } from 'react';
import { User, Asset } from './types';
import { supabase } from './services/supabaseClient';
import { Login } from './components/Login';
import { SupabaseSetup } from './components/SupabaseSetup';
import { AssetList } from './components/AssetList';
import { GlobalAssetList } from './components/GlobalAssetList';
import { AddAssetModal } from './components/AddAssetModal';
import { DashboardStats } from './components/DashboardStats';
import { ConfirmModal } from './components/ConfirmModal';
import { 
  Users, 
  Search, 
  UserPlus, 
  Plus, 
  ChevronDown,
  ChevronUp,
  PackageOpen,
  Briefcase,
  Trash2,
  List,
  LogOut,
  Loader2
} from 'lucide-react';

type ViewMode = 'users' | 'assets';

type PendingAction = 
  | { type: 'DELETE_USER'; userId: string }
  | { type: 'DELETE_ASSET'; userId: string; assetId: string }
  | null;

function App() {
  // Se Supabase não estiver configurado, mostra tela de setup
  if (!supabase) {
    return <SupabaseSetup />;
  }

  const [session, setSession] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  const [search, setSearch] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('users');
  
  const [isAssetModalOpen, setAssetModalOpen] = useState(false);
  const [selectedUserIdForAsset, setSelectedUserIdForAsset] = useState<string | null>(null);
  
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUser, setNewUserUser] = useState('');

  // Auth
  useEffect(() => {
    (supabase.auth as any).getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setIsLoadingSession(false);
    });

    const {
      data: { subscription },
    } = (supabase.auth as any).onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Busca colaboradores + assets
  const fetchData = async () => {
    if (!session) return;
    setLoadingData(true);
    
    const { data: collaboratorsData, error: collabError } = await supabase
      .from('collaborators')
      .select('*');

    if (collabError) {
      console.error('Error fetching collaborators:', collabError);
      setLoadingData(false);
      return;
    }

    const { data: assetsData, error: assetsError } = await supabase
      .from('assets')
      .select('*');

    if (assetsError) {
      console.error('Error fetching assets:', assetsError);
      setLoadingData(false);
      return;
    }

    const mappedUsers: User[] = collaboratorsData.map((collab: any) => {
      const userAssets = assetsData
        .filter((a: any) => a.collaborator_id === collab.id)
        .map((a: any) => ({
          id: a.id,
          assetTag: a.asset_tag,
          name: a.name,
          category: a.category,
          description: a.description,
          acquisitionDate: a.acquisition_date
        }));

      return {
        id: collab.id,
        fullName: collab.full_name,
        username: collab.username,
        assets: userAssets
      };
    });

    setUsers(mappedUsers);
    setLoadingData(false);
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const handleLogout = async () => {
    await (supabase.auth as any).signOut();
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newUserName || !newUserUser) return;
    
    const { error } = await supabase
      .from('collaborators')
      .insert([{ full_name: newUserName, username: newUserUser }]);

    if (error) {
      alert('Erro ao criar colaborador: ' + error.message);
    } else {
      fetchData();
      setNewUserName('');
      setNewUserUser('');
      setIsAddUserOpen(false);
    }
  };

  const requestDeleteUser = (userId: string) => {
    setPendingAction({ type: 'DELETE_USER', userId });
  };

  const requestDeleteAsset = (userId: string, assetId: string) => {
    setPendingAction({ type: 'DELETE_ASSET', userId, assetId });
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    if (pendingAction.type === 'DELETE_USER') {
      const { error } = await supabase
        .from('collaborators')
        .delete()
        .eq('id', pendingAction.userId);
      
      if (error) alert('Erro ao excluir: ' + error.message);
      else {
        setUsers(prev => prev.filter(u => u.id !== pendingAction.userId));
        if (expandedUserId === pendingAction.userId) setExpandedUserId(null);
      }
    } 
    else if (pendingAction.type === 'DELETE_ASSET') {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', pendingAction.assetId);

      if (error) alert('Erro ao excluir: ' + error.message);
      else {
        setUsers(prev => prev.map(user => {
          if (user.id === pendingAction.userId) {
            return {
              ...user,
              assets: user.assets.filter(a => a.id !== pendingAction.assetId)
            };
          }
          return user;
        }));
      }
    }
    setPendingAction(null);
  };

  const openAssetModal = (userId: string) => {
    setSelectedUserIdForAsset(userId);
    setAssetModalOpen(true);
  };

  const handleAddAsset = async (assetData: Omit<Asset, 'id'>) => {
    if (!selectedUserIdForAsset) return;

    const { error } = await supabase
      .from('assets')
      .insert([{
        collaborator_id: selectedUserIdForAsset,
        name: assetData.name,
        asset_tag: assetData.assetTag,
        category: assetData.category,
        description: assetData.description,
        acquisition_date: assetData.acquisitionDate
      }]);

    if (error) {
      alert('Erro ao adicionar equipamento: ' + error.message);
    } else {
      fetchData();
    }
  };

  const toggleUserExpand = (userId: string) => {
    setExpandedUserId(prev => prev === userId ? null : userId);
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.assets.some(a => a.assetTag.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-brand-600 w-10 h-10" />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 text-white p-2 rounded-lg">
              <PackageOpen size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">
              Patrimonio<span className="text-brand-600">AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
               <span className="text-xs text-gray-500 hidden sm:inline">{session.user.email}</span>
               <button 
                 onClick={handleLogout}
                 className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                 title="Sair"
               >
                 <LogOut size={18} />
               </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loadingData ? (
           <div className="flex flex-col items-center justify-center py-20 text-gray-400">
             <Loader2 size={40} className="animate-spin mb-4 text-brand-500" />
             <p>Carregando base de dados...</p>
           </div>
        ) : (
          <>
            {/* Dashboard Stats */}
            <DashboardStats users={users} />

            {/* Controls & Navigation */}
            <div className="flex flex-col gap-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="bg-gray-200 p-1 rounded-lg inline-flex">
                  <button 
                    onClick={() => setViewMode('users')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'users' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Users size={16} /> Colaboradores
                  </button>
                  <button 
                    onClick={() => setViewMode('assets')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'assets' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List size={16} /> Todos Equipamentos
                  </button>
                </div>

                <button
                  onClick={() => setIsAddUserOpen(!isAddUserOpen)}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm w-full sm:w-auto justify-center"
                >
                  <UserPlus size={18} />
                  Novo Responsável
                </button>
              </div>

              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder={viewMode === 'users' ? "Buscar usuário ou patrimônio..." : "Buscar equipamento, categoria ou responsável..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-sm shadow-sm"
                />
              </div>
            </div>

            {/* Add User Form */}
            {isAddUserOpen && (
              <form onSubmit={handleAddUser} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6 animate-fade-in">
                <h3 className="font-semibold text-gray-800 mb-4">Cadastrar Novo Responsável</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Nome Completo</label>
                    <input
                      required
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      placeholder="Ex: João da Silva"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Nome de Usuário (ID)</label>
                    <input
                      required
                      type="text"
                      value={newUserUser}
                      onChange={(e) => setNewUserUser(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      placeholder="Ex: jsilva"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsAddUserOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 text-sm bg-brand-600 text-white hover:bg-brand-700 rounded-md font-medium"
                  >
                    Salvar Usuário
                  </button>
                </div>
              </form>
            )}

            {/* Main Content */}
            {viewMode === 'assets' ? (
              <GlobalAssetList 
                users={users} 
                onRemoveAsset={requestDeleteAsset} 
                search={search} 
              />
            ) : (
              <div className="space-y-4">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                      <Users size={48} strokeWidth={1} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Nenhum resultado encontrado</h3>
                    <p className="text-gray-500">Tente buscar por outro termo ou adicione um novo usuário.</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div 
                      key={user.id} 
                      className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                        expandedUserId === user.id 
                          ? 'border-brand-300 ring-4 ring-brand-50 shadow-md' 
                          : 'border-gray-200 shadow-sm hover:border-gray-300'
                      }`}
                    >
                      <div 
                        className="p-4 sm:px-6 flex items-center justify-between cursor-pointer select-none"
                        onClick={() => toggleUserExpand(user.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            expandedUserId === user.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <h3 className={`font-semibold text-base ${
                              expandedUserId === user.id ? 'text-brand-700' : 'text-gray-900'
                            }`}>
                              {user.fullName}
                            </h3>
                            <div className="flex items-center text-xs text-gray-500 gap-2">
                              <span className="flex items-center gap-1"><Briefcase size={12}/> {user.username}</span>
                              <span>•</span>
                              <span>{user.assets.length} {user.assets.length === 1 ? 'item' : 'itens'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openAssetModal(user.id);
                            }}
                            type="button"
                            className="hidden sm:flex items-center gap-1 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-full transition-colors"
                          >
                            <Plus size={14} /> Adicionar
                          </button>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              requestDeleteUser(user.id);
                            }}
                            type="button"
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Remover Colaborador"
                          >
                            <Trash2 size={18} />
                          </button>

                          {expandedUserId === user.id ? (
                            <ChevronUp className="text-gray-400" size={20} />
                          ) : (
                            <ChevronDown className="text-gray-400" size={20} />
                          )}
                        </div>
                      </div>

                      {expandedUserId === user.id && (
                        <div className="border-t border-gray-100 bg-gray-50/50 p-4 sm:px-6 animate-fade-in-down">
                          <div className="flex justify-between items-center mb-3 sm:hidden">
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                              Equipamentos
                            </h4>
                            <button 
                              onClick={() => openAssetModal(user.id)}
                              type="button"
                              className="text-xs font-semibold text-brand-600 flex items-center gap-1"
                            >
                              <Plus size={14} /> Adicionar
                            </button>
                          </div>
                          
                          <AssetList 
                            assets={user.assets} 
                            onRemove={(assetId) => requestDeleteAsset(user.id, assetId)} 
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>

      <AddAssetModal
        isOpen={isAssetModalOpen}
        onClose={() => setAssetModalOpen(false)}
        onAdd={handleAddAsset}
        userName={users.find(u => u.id === selectedUserIdForAsset)?.fullName || ''}
      />

      <ConfirmModal 
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        onConfirm={handleConfirmAction}
        isDestructive={true}
        title={pendingAction?.type === 'DELETE_USER' ? "Remover Colaborador" : "Remover Equipamento"}
        message={pendingAction?.type === 'DELETE_USER' 
          ? "Tem certeza que deseja remover este colaborador? Todos os equipamentos vinculados serão excluídos permanentemente do banco de dados." 
          : "Tem certeza que deseja remover este equipamento do sistema?"
        }
        confirmLabel={pendingAction?.type === 'DELETE_USER' ? "Excluir Colaborador" : "Excluir Item"}
      />
    </div>
  );
}

export default App;
