export interface Asset {
  id: string;
  assetTag: string;              // asset_tag
  name: string;
  category: string;
  description?: string;          // opcional
  acquisitionDate?: string;      // acquisition_date opcional
  collaborator_id: string | null; // agora pode ser null (sem responsável)
  status: 'ativo' | 'desativado';
}

export interface User {
  id: string;
  fullName: string;   // full_name
  username: string;
  assets: Asset[];
}