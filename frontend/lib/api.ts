import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// TypeScript Interfaces matching FastAPI schemas
export interface AnalyzeRequest {
  startup_idea: string;
  user_id?: string;
}

export interface AnalyzeResponse {
  job_id: string;
  status: string;
  message: string;
}

export interface StatusResponse {
  job_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  current_agent: string | null;
  progress_percent: number;
}

export interface Competitor {
  name: string;
  website: string;
  pricing: string;
  strengths: string[];
  weaknesses: string[];
  differentiator: string;
}

export interface CompetitorAnalysis {
  competitors: Competitor[];
  market_gap: string;
}

export interface MarketResearch {
  market_size: string;
  target_demographics: string[];
  industry_trends: string[];
  demand_signals: string[];
  summary: string;
}

export interface PricingTier {
  tier: string;
  price: string;
  features: string[];
}

export interface TargetAudience {
  primary: string;
  secondary: string;
}

export interface BusinessStrategy {
  business_model: string;
  target_audience: TargetAudience;
  revenue_streams: string[];
  pricing_tiers: PricingTier[];
  go_to_market_strategy: string[];
  marketing_channels: string[];
}

export interface StartupCosts {
  development: string;
  infrastructure: string;
  marketing: string;
  legal: string;
  total_estimated: string;
}

export interface RevenueProjections {
  month_6: string;
  month_12: string;
  month_24: string;
}

export interface Financials {
  startup_costs: StartupCosts;
  monthly_operational_costs: string;
  revenue_projection: RevenueProjections;
  break_even_estimate: string;
  funding_recommendation: string;
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface PitchSlide {
  slide_number: number;
  title: string;
  headline: string;
  bullet_points: string[];
  speaker_notes: string;
}

export interface PitchDeck {
  slides: PitchSlide[];
}

export interface ReportResponse {
  job_id: string;
  startup_idea: string;
  created_at: string;
  market_research: MarketResearch | null;
  competitor_analysis: CompetitorAnalysis | null;
  business_strategy: BusinessStrategy | null;
  financials: Financials | null;
  swot: SWOT | null;
  pitch_deck: PitchDeck | null;
  pdf_url: string | null;
}

export interface ChatResponse {
  answer: string;
  sources: string[];
}

export const api = {
  // Submit startup idea
  analyze: async (startup_idea: string, user_id?: string): Promise<AnalyzeResponse> => {
    const response = await axios.post(`${API_BASE}/analyze`, { startup_idea, user_id });
    return response.data;
  },

  // Check progress status
  getStatus: async (job_id: string): Promise<StatusResponse> => {
    const response = await axios.get(`${API_BASE}/status/${job_id}`);
    return response.data;
  },

  // Retrieve complete report
  getReport: async (job_id: string): Promise<ReportResponse> => {
    const response = await axios.get(`${API_BASE}/report/${job_id}`);
    return response.data;
  },

  // Retrieve user's reports
  getReportsByUser: async (user_id: string): Promise<ReportResponse[]> => {
    const response = await axios.get(`${API_BASE}/reports/user/${user_id}`);
    return response.data;
  },

  // Get download URL link directly
  getDownloadUrl: (job_id: string): string => {
    return `${API_BASE}/report/${job_id}/download`;
  },

  // Upload PDF / DOCX for RAG Q&A
  uploadDocument: async (file: File, user_id: string): Promise<{ doc_id: string; status: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', user_id);
    const response = await axios.post(`${API_BASE}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Ask RAG Q&A chat
  chat: async (question: string, user_id: string, job_id?: string): Promise<ChatResponse> => {
    const response = await axios.post(`${API_BASE}/chat`, { question, user_id, job_id });
    return response.data;
  },

  // Auth: Register
  register: async (email: string, password: string, name: string): Promise<{ user_id: string; token: string }> => {
    const response = await axios.post(`${API_BASE}/auth/register`, { email, password, name });
    return response.data;
  },

  // Auth: Login
  login: async (email: string, password: string): Promise<{ token: string; user_id: string }> => {
    const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
    return response.data;
  },
};
