import React from 'react';
import { User } from '../types';
import { Trash2, Search } from 'lucide-react';

interface GlobalAssetListProps {
  users: User[];
  onRemoveAsset: (userId: string, assetId: string) => void;
  search: string;
}

export const GlobalAssetList: React.FC<GlobalAssetListProps> = ({ users, onRemoveAsset, search }) => {
  // Flatten all assets into a single array with owner info
  const allAssets = users.flatMap(user => 
    user.assets.map(asset => ({
      ...asset,
      ownerId: user.id,
      ownerName: user.fullName,
      ownerUsername: user.username
    }))
  ).filter(item => {
    const searchLower = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.assetTag.toLowerCase().includes(searchLower) ||
      item.ownerName.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    );
  });

  if (allAssets.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
        <div className="mx-auto h-12 w-12 text-gray-300 mb-3 flex items-center justify-center">
          <Search size={32} />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Nenhum equipamento encontrado</h3>
        <p className="text-gray-500">Tente buscar por outro termo ou cadastre novos equipamentos.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-700">Equipamento</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Patrimônio</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Categoria</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Responsável</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {allAssets.map((asset) => (
              <tr key={`${asset.ownerId}-${asset.id}`} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-3">
                  <div className="font-medium text-gray-900">{asset.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[200px]">{asset.description}</div>
                </td>
                <td className="px-6 py-3 font-mono text-gray-600">{asset.assetTag}</td>
                <td className="px-6 py-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    {asset.category}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="text-gray-900 font-medium">{asset.ownerName}</div>
                  <div className="text-xs text-gray-500">@{asset.ownerUsername}</div>
                </td>
                <td className="px-6 py-3 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveAsset(asset.ownerId, asset.id);
                    }}
                    className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                    title="Remover equipamento"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
        <span>Total listado: {allAssets.length}</span>
      </div>
    </div>
  );
};
