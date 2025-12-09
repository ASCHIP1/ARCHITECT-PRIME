export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export enum VisualizationType {
  NONE = 'none',
  BUDGET = 'budget',
  TIMELINE = 'timeline',
  FINANCIAL = 'financial'
}

export interface VisualizationPayload {
  type: VisualizationType;
  title: string;
  data: ChartData[];
  currency?: string;
  unit?: string;
}

export interface ProjectContext {
  location: string;
  budgetCap: string;
  projectType: string;
}