import React from 'react';
import { Asset } from '../types';
import { Trash2, Monitor, Laptop, Smartphone, Box } from 'lucide-react';

interface AssetListProps {
  assets: Asset[];
  onRemove: (assetId: string) => void;
  onEdit: (asset: Asset) => void;   // 🔥 novo
}

const getIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('notebook') || cat.includes('laptop')) return <Laptop size={18} />;
  if (cat.includes('monitor') || cat.includes('tela')) return <Monitor size={18} />;
  if (cat.includes('celular') || cat.includes('smartphone')) return <Smartphone size={18} />;
  return <Box size={18} />;
};

export const AssetList: React.FC<AssetListProps> = ({ assets, onRemove, onEdit }) => {
  if (assets.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500 italic bg-gray-50 rounded-md border border-dashed border-gray-300">
        Nenhum equipamento vinculado.
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-2">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="flex items-start justify-between bg-white p-3 rounded-md border border-gray-200 shadow-sm hover:border-brand-300 transition-colors"
        >
          {/* LEFT SIDE */}
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg mt-1">
              {getIcon(asset.category)}
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 text-sm">{asset.name}</h4>

              <p className="text-xs text-gray-500 font-mono">
                Patrimônio: {asset.assetTag}
              </p>

              {asset.description && (
                <p className="text-xs text-gray-600 mt-1">{asset.description}</p>
              )}

              <span
                className="inline-block mt-2 text-[10px] uppercase tracking-wider font-bold text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded"
              >
                {asset.category}
              </span>

              {asset.acquisitionDate && (
                <p className="text-xs text-gray-400 mt-1">
                  Aquisição: {asset.acquisitionDate}
                </p>
              )}

              <span
                className={`inline-block mt-2 text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded
                  ${
                    asset.status === 'ativo'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-200 text-gray-600'
                  }
                `}
              >
                {asset.status}
              </span>
            </div>
          </div>

          {/* RIGHT SIDE BUTTONS */}
          <div className="flex flex-col gap-2">

            {/* EDIT BUTTON */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(asset);
              }}
              className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50"
              title="Editar equipamento"
            >
              ✏️
            </button>

            {/* DELETE BUTTON */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(asset.id);
              }}
              className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
              title="Remover equipamento"
            >
              <Trash2 size={16} />
            </button>

          </div>
        </div>
      ))}
    </div>
  );
};