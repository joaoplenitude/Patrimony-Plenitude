import React from 'react';
import { Trash2 } from 'lucide-react';
import { User, Asset } from '../types';
import { Pencil } from "lucide-react";
import { ArrowLeftRight } from "lucide-react";

interface GlobalAssetListProps {
  users: User[];
  unassignedAssets: Asset[];
  search: string;
  onRemoveAsset: (userId: string | null, assetId: string) => void;
  onEdit: (asset: Asset) => void;
  onTransfer: (asset: Asset) => void;   // ✅ DEFINIÇÃO CORRETA
}

export const GlobalAssetList: React.FC<GlobalAssetListProps> = ({
  users,
  unassignedAssets,
  search,
  onRemoveAsset,
  onEdit,
  onTransfer   // ✅ RECEBIDO CORRETAMENTE
}) => {

  const assetsFromUsers = users.flatMap(user =>
    user.assets.map(asset => ({
      ...asset,
      userId: user.id,
      userName: user.fullName
    }))
  );

  const assetsWithoutUser = unassignedAssets.map(asset => ({
    ...asset,
    userId: null,
    userName: "Sem responsável"
  }));

  const allAssets = [
    ...assetsFromUsers.filter(a => a.collaborator_id !== null),
    ...assetsWithoutUser
  ];

  const term = search.toLowerCase();

  const filtered = allAssets.filter(asset =>
    asset.name.toLowerCase().includes(term) ||
    asset.assetTag.toLowerCase().includes(term) ||
    asset.category.toLowerCase().includes(term) ||
    asset.userName.toLowerCase().includes(term)
  );

  return (
    <div className="space-y-4">
      {filtered.map(asset => (
        <div
          key={asset.id}
          className="bg-white rounded-xl p-4 border shadow-sm flex items-center justify-between"
        >
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{asset.name}</span>
            <span className="text-sm text-gray-500">{asset.userName}</span>

            {asset.acquisitionDate && (
              <span className="text-xs text-gray-400 mt-1">
                Aquisição: {asset.acquisitionDate}
              </span>
            )}

            <span
              className={`text-xs px-2 py-1 rounded-full mt-2 w-fit
                ${asset.status === 'ativo'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-200 text-gray-600'}
              `}
            >
              {asset.status === 'ativo' ? 'Ativo' : 'Desativado'}
            </span>
          </div>

          <div className="flex items-center gap-3">

            {/* TRANSFERIR */}
            <button
              onClick={() => onTransfer(asset)}
              className="text-blue-500 hover:text-blue-600 transition p-1"
              title="Transferir equipamento"
            >
              <ArrowLeftRight size={18} className="text-blue-500" />
            </button>

            {/* EDITAR */}
            <button
              onClick={() => onEdit(asset)}
              className="text-orange-500 hover:text-orange-600 transition p-1"
              title="Editar equipamento"
            >
              <Pencil size={18} className="text-orange-500" />
            </button>

            {/* EXCLUIR */}
            <button
              onClick={() => onRemoveAsset(asset.userId, asset.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
              title="Excluir"
            >
              <Trash2 size={18} />
            </button>

          </div>
        </div>
      ))}
    </div>
  );
};