import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Asset } from '../types';

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Asset) => void;
  asset: Asset | null;
}

export const EditAssetModal: React.FC<EditAssetModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSave
}) => {

  const [form, setForm] = useState<Asset | null>(null);

  useEffect(() => {
    setForm(asset);
  }, [asset]);

  if (!isOpen || !form) return null;

  const updateField = (key: keyof Asset, value: any) => {
    setForm(prev => ({ ...prev!, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40 px-4">
      <div className="bg-white rounded-xl shadow-xl border w-full max-w-lg">

        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Editar Equipamento</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.name}
            onChange={e => updateField('name', e.target.value)}
            placeholder="Nome"
          />

          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.assetTag}
            onChange={e => updateField('assetTag', e.target.value)}
            placeholder="Tag"
          />

          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.category}
            onChange={e => updateField('category', e.target.value)}
            placeholder="Categoria"
          />

          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.acquisitionDate ?? ''}
            onChange={e => updateField('acquisitionDate', e.target.value)}
            type="date"
          />

          <select
            className="w-full border rounded-lg px-3 py-2"
            value={form.status}
            onChange={e => updateField('status', e.target.value)}
          >
            <option value="ativo">Ativo</option>
            <option value="desativado">Desativado</option>
          </select>

          <button
            onClick={() => onSave(form)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg"
          >
            <Save size={18} /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
};