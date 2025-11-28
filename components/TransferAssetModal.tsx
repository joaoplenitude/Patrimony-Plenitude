import React, { useState } from "react";
import { X, ArrowRightLeft } from "lucide-react";
import { User, Asset } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  users: User[];
  onTransfer: (assetId: string, newUserId: string | null) => void;
}

export const TransferAssetModal: React.FC<Props> = ({
  isOpen,
  onClose,
  asset,
  users,
  onTransfer,
}) => {
  const [newUserId, setNewUserId] = useState<string | "null">("null");

  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg animate-fade-in">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ArrowRightLeft size={18} />
            Transferir Equipamento
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500">
            <strong>{asset.name}</strong> ({asset.assetTag})
          </p>

          <label className="block text-sm font-medium text-gray-600 mb-1">
            Novo responsável
          </label>

          <select
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="null">Sem responsável</option>

            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              onTransfer(asset.id, newUserId === "null" ? null : newUserId);
              onClose();
            }}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg font-medium shadow-sm"
          >
            Transferir
          </button>
        </div>
      </div>
    </div>
  );
};