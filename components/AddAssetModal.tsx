import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { Asset } from '../types';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (asset: Omit<Asset, 'id' | 'collaborator_id'>) => void;
  userName?: string | null;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  userName
}) => {
  const [name, setName] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState(''); // 🔥 restaurado
  const [status, setStatus] = useState<'ativo' | 'desativado'>('ativo');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !assetTag || !category) return;

    onAdd({
      name,
      assetTag,
      category,
      description,
      acquisitionDate,
      status
    });

    setName('');
    setAssetTag('');
    setCategory('');
    setDescription('');
    setAcquisitionDate('');
    setStatus('ativo');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40 px-4">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg animate-fade-in">

        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Novo equipamento {userName ? `para ${userName}` : '(sem responsável)'}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nome</label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tag / Patrimônio</label>
            <input
              required
              value={assetTag}
              onChange={e => setAssetTag(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Categoria</label>
            <input
              required
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Data de aquisição</label>
            <input
              type="date"
              value={acquisitionDate}
              onChange={e => setAcquisitionDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as 'ativo' | 'desativado')}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="ativo">Ativo</option>
              <option value="desativado">Desativado</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg font-medium shadow-sm"
          >
            <PlusCircle size={18} /> Adicionar Equipamento
          </button>

        </form>
      </div>
    </div>
  );
};
