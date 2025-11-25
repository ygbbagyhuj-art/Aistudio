// IBGE API Types
export interface IBGERegion {
  id: number;
  sigla: string;
  nome: string;
}

export interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
  regiao: IBGERegion;
}

export interface IBGEMicroRegion {
  id: number;
  nome: string;
  mesorregiao: {
    id: number;
    nome: string;
    UF: IBGEState;
  };
}

export interface IBGEMunicipality {
  id: number; // IBGE Code
  nome: string;
  microrregiao: IBGEMicroRegion;
  "regiao-imediata"?: {
    "regiao-intermediaria": {
      id: number;
      nome: string;
      UF: IBGEState;
    };
  };
}

// AI Specific Types
export interface WebAppIdea {
  id: number;
  title: string;
  description: string;
  category: string;
}

export interface DevPromptResult {
    prompt: string;
}

// Simplified data structure for export and display
export interface ProcessedData {
  id: number;
  nome: string;
  uf: string;
  microrregiao: string;
  mesorregiao: string;
  regiao: string;
  summary?: string; // AI Summary
  businessTips?: string; // AI Business Tips
  tourismHighlights?: string; // AI Tourism
  webAppIdeas?: string; // AI Web App Ideas (String for CSV/Display)
  webAppIdeasList?: WebAppIdea[]; // Structured List for UI
  populacao?: number;
  area?: number;
}

export enum ExportFormat {
  CSV = 'csv',
  PROMPT = 'prompt'
}