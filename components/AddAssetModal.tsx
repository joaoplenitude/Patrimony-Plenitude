import React, { useState } from 'react';
import { X, Sparkles, Loader2, Plus } from 'lucide-react';
import { analyzeAsset } from '../services/geminiService';
import { Asset } from '../types';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (asset: Omit<Asset, 'id'>) => void;
  userName: string;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onAdd, userName }) => {
  const [name, setName] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen) return null;

  const handleAIAutoFill = async () => {
    if (!name) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeAsset(name);
      setCategory(result.category);
      setDescription(result.suggestedDescription);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name,
      assetTag,
      description: description || name,
      category: category || 'Geral',
      acquisitionDate: new Date().toISOString().split('T')[0]
    });
    // Reset form
    setName('');
    setAssetTag('');
    setDescription('');
    setCategory('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="bg-brand-600 p-4 flex justify-between items-center text-white">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Plus size={20} /> Adicionar Equipamento
          </h2>
          <button onClick={onClose} className="hover:bg-brand-700 p-1 rounded transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-sm text-blue-800 mb-4">
            Responsável: <span className="font-bold">{userName}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Equipamento / Modelo</label>
            <div className="flex gap-2">
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: MacBook Pro M2, Monitor Dell P2419H"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAIAutoFill}
                disabled={!name || isAnalyzing}
                className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                title="Autocompletar com IA"
              >
                {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                IA
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Patrimônio (Etiqueta)</label>
            <input
              required
              type="text"
              value={assetTag}
              onChange={(e) => setAssetTag(e.target.value)}
              placeholder="Ex: PAT-2024-001"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Notebook"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
               <input 
                 type="date" 
                 defaultValue={new Date().toISOString().split('T')[0]}
                 className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500"
                 disabled
               />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição técnica..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg shadow-sm transition-all active:scale-[0.98]"
            >
              Salvar Equipamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
