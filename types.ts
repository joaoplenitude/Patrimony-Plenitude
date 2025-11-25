export interface Asset {
  id: string;
  assetTag: string; // Mapeado de asset_tag
  name: string;
  category: string;
  description: string;
  acquisitionDate: string; // Mapeado de acquisition_date
  collaborator_id?: string; // Foreign key
}

export interface User {
  id: string;
  fullName: string; // Mapeado de full_name
  username: string;
  assets: Asset[];
}

export interface AIAnalysisResult {
  category: string;
  suggestedDescription: string;
  estimatedValueTier: 'Low' | 'Medium' | 'High';
}