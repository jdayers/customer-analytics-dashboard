// Core TypeScript interfaces for the customer URL analysis application

export interface CustomerMetrics {
  yoyGrowth: number;           // Year over year growth percentage
  nrr: number;                 // Net Revenue Retention percentage
  dau: number;                 // Daily Active Users count
  csat: number;                // Customer Satisfaction score (0-100)
  nps: number;                 // Net Promoter Score (-100 to 100)
  currentCustomers: number;    // Total active customers
}

export interface FirmographicData {
  companyName: string;
  industry: string;
  employeeCount: number | string; // e.g., "1000-5000"
  foundedYear?: number;
  headquarters?: string;
  revenue?: string;               // e.g., "$10M-$50M"
  website: string;
}

export interface AnalysisResult {
  id: string;                     // Unique identifier
  url: string;                    // Analyzed URL
  timestamp: Date;
  metrics: CustomerMetrics;
  firmographics: FirmographicData;
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface HistoryItem {
  id: string;
  url: string;
  timestamp: Date;
  status: 'success' | 'error';
  preview?: string;               // Company name or error preview
}

export interface AnalysisState {
  currentAnalysis: AnalysisResult | null;
  history: HistoryItem[];
  isLoading: boolean;
  error: string | null;
}
