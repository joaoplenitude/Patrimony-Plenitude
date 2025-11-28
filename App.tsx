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
import { EditAssetModal } from './components/EditAssetModal';
import { TransferAssetModal } from './components/TransferAssetModal';
import { exportAssetsToExcel } from "./utils/exportExcel";

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
  | { type: 'DELETE_ASSET'; userId: string | null; assetId: string }
  | null;

function App() {
  if (!supabase) return <SupabaseSetup />;

  const [session, setSession] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const [users, setUsers] = useState<User[]>([]);
  const [unassignedAssets, setUnassignedAssets] = useState<Asset[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [search, setSearch] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('users');

  const [isAssetModalOpen, setAssetModalOpen] = useState(false);
  const [selectedUserIdForAsset, setSelectedUserIdForAsset] =
    useState<string | null>(null);

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUser, setNewUserUser] = useState('');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [assetToTransfer, setAssetToTransfer] = useState<Asset | null>(null);

// 🔥🔥🔥 MOVIDO PARA FORA DO fetchData()
  const getAllAssetsFlattened = () => {
    const assigned = users.flatMap(user =>
      user.assets.map(asset => ({
        id: asset.id,
        name: asset.name,
        tag: asset.assetTag,
        category: asset.category,
        description: asset.description,
        acquisitionDate: asset.acquisitionDate,
        status: asset.status,
        responsavel: user.fullName
      }))
    );

    const unassigned = unassignedAssets.map(asset => ({
      id: asset.id,
      name: asset.name,
      tag: asset.assetTag,
      category: asset.category,
      description: asset.description,
      acquisitionDate: asset.acquisitionDate,
      status: asset.status,
      responsavel: "Sem responsável"
    }));

    return [...assigned, ...unassigned];
  };

  // 🔥🔥🔥 MOVIDO PARA FORA TAMBÉM
  const handleExportExcel = () => {
    const allAssets = getAllAssetsFlattened();
    exportAssetsToExcel(allAssets);
  };

  // AUTH
  useEffect(() => {
    (supabase.auth as any)
      .getSession()
      .then(({ data: { session } }: any) => {
        setSession(session);
        setIsLoadingSession(false);
      });

    const {
      data: { subscription }
    } = (supabase.auth as any).onAuthStateChange(
      (_event: any, session: any) => setSession(session)
    );

    return () => subscription.unsubscribe();
  }, []);

  // FETCH DATA
  const fetchData = async () => {
    if (!session) return;
    setLoadingData(true);

    const { data: collaboratorsData } = await supabase
      .from('collaborators')
      .select('*');

    const { data: assetsData } = await supabase.from('assets').select('*');

    // UNASSIGNED
    const unassigned = assetsData
      .filter((a) => a.collaborator_id === null)
      .map((a: any) => ({
        id: a.id,
        assetTag: a.asset_tag,
        name: a.name,
        category: a.category,
        description: a.description ?? '',
        acquisitionDate: a.acquisition_date ?? null,
        collaborator_id: null,
        status: (a.status as 'ativo' | 'desativado') ?? 'ativo'
      }));

    setUnassignedAssets(unassigned);

    // USERS + ASSETS
    const mappedUsers: User[] = collaboratorsData.map((collab: any) => {
      const items = assetsData
        .filter((a) => a.collaborator_id === collab.id)
        .map((a: any) => ({
          id: a.id,
          assetTag: a.asset_tag,
          name: a.name,
          category: a.category,
          description: a.description ?? '',
          acquisitionDate: a.acquisition_date ?? null,
          collaborator_id: a.collaborator_id,
          status: (a.status as 'ativo' | 'desativado') ?? 'ativo'
        }));

      return {
        id: collab.id,
        fullName: collab.full_name,
        username: collab.username,
        assets: items
      };
    });

    setUsers(mappedUsers);
    setLoadingData(false);
  };
  
  useEffect(() => {
    if (session) fetchData();
  }, [session]);
  
  const startTransfer = (asset: Asset) => {
    setAssetToTransfer(asset);
    setTransferModalOpen(true);
  };
  
  const handleTransferAsset = async (assetId: string, newUserId: string | null) => {
  const { error } = await supabase
      .from("assets")
      .update({ collaborator_id: newUserId })
      .eq("id", assetId);
  
    if (!error) {
      fetchData();
    } else {
      alert("Erro ao transferir: " + error.message);
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    await (supabase.auth as any).signOut();
  };

  // ADD USER
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('collaborators').insert([
      {
        full_name: newUserName,
        username: newUserUser
      }
    ]);

    if (error) return alert(error.message);

    setNewUserName('');
    setNewUserUser('');
    setIsAddUserOpen(false);
    fetchData();
  };

  
  // DELETE USER OR ASSET
  const requestDeleteUser = (userId: string) => {
    setPendingAction({ type: 'DELETE_USER', userId });
  };
  
  const requestDeleteAsset = (userId: string | null, assetId: string) => {
    setPendingAction({ type: 'DELETE_ASSET', userId, assetId });
  };
  
  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    
    if (pendingAction.type === 'DELETE_ASSET') {
      const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', pendingAction.assetId);
      
      if (error) alert(error.message);
      else fetchData();
    }
    
    if (pendingAction.type === 'DELETE_USER') {
      const { error } = await supabase
      .from('collaborators')
      .delete()
      .eq('id', pendingAction.userId);
      
      if (error) alert(error.message);
      else fetchData();
    }
    
    setPendingAction(null);
  };
  
  // ADD ASSET
  const handleAddAsset = async (
    assetData: Omit<Asset, 'id' | 'collaborator_id'>
  ) => {
    const acquisitionDateValue =
    assetData.acquisitionDate?.trim() !== '' &&
    assetData.acquisitionDate !== null
    ? assetData.acquisitionDate
    : null;
    
    const { error } = await supabase.from('assets').insert([
      {
        collaborator_id: selectedUserIdForAsset ?? null,
        name: assetData.name,
        asset_tag: assetData.assetTag,
        category: assetData.category,
        description: assetData.description ?? '',
        acquisition_date: acquisitionDateValue,
        status: assetData.status
      }
    ]);
    
    if (error) alert(error.message);
    else fetchData();
  };
  
  // --- ABRIR MODAL DE NOVO EQUIPAMENTO ---
  const openAssetModal = (userId: string | null) => {
    setSelectedUserIdForAsset(userId);
    setAssetModalOpen(true);
  };
  
  // EDIT ASSET
  const startEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setEditModalOpen(true);
  };
  
  const handleSaveAsset = async (asset: Asset) => {
    const { error } = await supabase
    .from('assets')
    .update({
      name: asset.name,
      asset_tag: asset.assetTag,
      category: asset.category,
      description: asset.description ?? '',
        acquisition_date: asset.acquisitionDate || null,
        status: asset.status,
        collaborator_id: asset.collaborator_id ?? null
      })
      .eq('id', asset.id);
      
    if (error) alert(error.message);
    else {
      setEditModalOpen(false);
      fetchData();
    }
  };
  
  // FILTER USERS
  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.assets.some((a) =>
      a.assetTag.toLowerCase().includes(search.toLowerCase())
  )
);

if (isLoadingSession)
  return (
<div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-brand-600" />
      </div>
    );
    
    if (!session) return <Login />;
    
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 text-white p-2 rounded-lg">
              <PackageOpen size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
              Plenitude<span className="text-brand-600">PMP</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:inline">
              {session.user.email}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"
              >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {loadingData ? (
          <div className="flex flex-col items-center py-20 text-gray-500">
            <Loader2 className="animate-spin w-10 h-10 mb-3" />
            Carregando...
          </div>
        ) : (
          <>
            <DashboardStats users={users} />

            {/* FILTERS + SEARCH */}
            <div className="flex flex-col gap-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="bg-gray-200 p-1 rounded-lg inline-flex">
                  <button
                    onClick={() => setViewMode('users')}
                    className={`px-4 py-2 text-sm rounded-md ${
                      viewMode === 'users'
                        ? 'bg-white shadow'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Users size={16} /> Colaboradores
                  </button>

                  <button
                    onClick={() => setViewMode('assets')}
                    className={`px-4 py-2 text-sm rounded-md ${
                      viewMode === 'assets'
                      ? 'bg-white shadow'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}>
                    <List size={16} /> Todos Equipamentos
                  </button>

                </div>
                <div className="p-1 rounded-lg inline-flex gap-2 ">
                  <button
                      onClick={handleExportExcel}
                      className="flex items-center gap-2 mb-6 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow hover:bg-emerald-700">
                      📤 Exportar Excel
                  </button>

                  <button
                    onClick={() => setIsAddUserOpen(!isAddUserOpen)}
                    className="flex items-center gap-2 mb-6 bg-gray-900 text-white px-4 py-2 rounded-lg shadow hover:bg-black"
                  >
                    <UserPlus size={18} /> Novo Responsável
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 border border-gray-300 rounded-lg py-2"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  />
              </div>
            </div>

            {/* USERS VIEW */}
            {viewMode === 'users' ? (
              <div className="space-y-4">
                {isAddUserOpen && (
                  <form
                  onSubmit={handleAddUser}
                  className="bg-white p-6 rounded-xl border shadow-sm"
                  >
            
                    <h3 className="font-semibold mb-4">
                      Cadastrar Novo Responsável
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Nome</label>
                        <input
                          required
                          className="w-full border rounded-lg px-3 py-2"
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          />
                      </div>

                      <div>
                        <label className="text-sm text-gray-600">Usuário</label>
                        <input
                          required
                          className="w-full border rounded-lg px-3 py-2"
                          value={newUserUser}
                          onChange={(e) => setNewUserUser(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 text-gray-600"
                        onClick={() => setIsAddUserOpen(false)}
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-brand-600 text-white rounded-lg"
                      >
                        Salvar
                      </button>
                    </div>
                  </form>
                )}

                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`bg-white border rounded-xl shadow transition ${
                      expandedUserId === user.id
                        ? 'border-brand-400 shadow-md'
                        : 'hover:border-gray-300'
                    }`}
                  >
                    <div
                      onClick={() =>
                        setExpandedUserId(
                          expandedUserId === user.id ? null : user.id
                        )
                      }
                      className="p-4 flex justify-between cursor-pointer"
                    >
                      <div className="flex gap-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full">
                          {user.fullName[0]}
                        </div>

                        <div>
                          <h3 className="font-semibold">{user.fullName}</h3>
                          <p className="text-xs text-gray-500 flex gap-2">
                            <Briefcase size={12} /> {user.username}
                          </p>
                        </div>
                      </div>

                      {expandedUserId === user.id ? (
                        <ChevronUp />
                      ) : (
                        <ChevronDown />
                      )}
                    </div>

                    {expandedUserId === user.id && (
                      <div className="p-4 border-t bg-gray-50">
                        <AssetList
                          assets={user.assets}
                          onRemove={(assetId) =>
                            requestDeleteAsset(user.id, assetId)
                          }
                          onEdit={startEdit}
                        />

                        <button
                          onClick={() => openAssetModal(user.id)}
                          className="flex items-center gap-2 mt-4 bg-brand-600 text-white px-4 py-2 rounded-lg shadow hover:bg-brand-700"
                        >
                          <Plus size={16} /> Adicionar Equipamento
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // ALL ASSETS VIEW
              <>
                <button
                  onClick={() => {
                    setSelectedUserIdForAsset(null);
                    setAssetModalOpen(true);
                  }}
                  className="flex items-center gap-2 mb-6 bg-brand-600 text-white px-4 py-2 rounded-lg shadow hover:bg-brand-700"
                >
                  <Plus size={18} /> Novo Equipamento (Sem responsável)
                </button>

                <GlobalAssetList
                  users={users}
                  unassignedAssets={unassignedAssets}
                  search={search}
                  onRemoveAsset={requestDeleteAsset}
                  onEdit={startEdit}
                  onTransfer={startTransfer}
                />
              </>
            )}
          </>
        )}
      </main>

      {/* MODALS */}
      <AddAssetModal
        isOpen={isAssetModalOpen}
        onClose={() => setAssetModalOpen(false)}
        onAdd={handleAddAsset}
        userName={
          users.find((u) => u.id === selectedUserIdForAsset)?.fullName || null
        }
      />

      <EditAssetModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        asset={editingAsset}
        onSave={handleSaveAsset}
      />

      <ConfirmModal
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        onConfirm={handleConfirmAction}
        isDestructive={true}
        title={
          pendingAction?.type === 'DELETE_USER'
            ? 'Remover Colaborador'
            : 'Remover Equipamento'
        }
        message={
          pendingAction?.type === 'DELETE_USER'
            ? 'Tem certeza que deseja remover este colaborador? Isso removerá todos os equipamentos vinculados.'
            : 'Tem certeza que deseja remover este equipamento?'
        }
        confirmLabel={
          pendingAction?.type === 'DELETE_USER'
            ? 'Excluir Colaborador'
            : 'Excluir Item'
        }
        
      />

      <TransferAssetModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        asset={assetToTransfer}
        users={users}
        onTransfer={handleTransferAsset}
      />

    </div>
  );
}

export default App;
