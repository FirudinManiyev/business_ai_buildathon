import axios from 'axios';

const http = axios.create({ baseURL: '/api' });

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SalesCustomer {
  name: string;
  age?: number | null;
  goal: string;
  interests: string[];
  purchase_history: string[];
}

export interface CVProfile {
  name: string;
  education?: string;
  skills: string[];
  experience_years?: string;
  projects: string[];
  languages: string[];
}

export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  cost_price: number;
  sell_price: number;
  stock: number;
}

export interface Job {
  id: number;
  title: string;
  company_name: string;
  required_skills: string[];
  experience_years: string;
  salary_min: number;
  salary_max: number;
  location: string;
}

// Sales recommendations response
export interface SalesRecommendation {
  product_id: number;
  product_name: string;
  reason: string;
  priority: string;
}
export interface SalesResult {
  recommendations: SalesRecommendation[];
  insight: string;
  cross_sell: { product_id: number; product_name: string; reason: string }[];
}

// HR analysis response
export interface JobMatch {
  job_id: number;
  job_title: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  reason: string;
}
export interface HRResult {
  matches: JobMatch[];
  skill_gap_products: { product_id: number; product_name: string; reason: string }[];
  finance_signal: { level: string; reason: string; salary_pressure: string };
}

// Finance analysis response
export interface ProductAnalysis {
  product_id: number;
  product_name: string;
  cost_price: number;
  sell_price: number;
  net_profit: number;
  profit_margin_pct: number;
  markup_pct: number;
  interpretation: string;
}
export interface FinanceResult {
  product_analysis: ProductAnalysis[];
  salary_coverage: {
    target_salary: number;
    covered_by_net_profit: number;
    salary_coverage_pct: number;
    interpretation: string;
  };
  recommendations: { action: string; reason: string; priority: string }[];
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const getSalesProducts = () =>
  http.get<Product[]>('/sales/products').then((r) => r.data);

export const getSalesRecommendations = (customer: SalesCustomer) =>
  http.post<SalesResult>('/sales/recommend', { customer, stream: false }).then((r) => r.data);

export const getJobs = () =>
  http.get<Job[]>('/hr/jobs').then((r) => r.data);

export const analyzeCV = (cv: CVProfile) =>
  http.post<HRResult>('/hr/analyze', { cv, stream: false }).then((r) => r.data);

export const analyzeFinance = (whatif_scenario?: string) =>
  http.post<FinanceResult>('/finance/analyze', { whatif_scenario: whatif_scenario || null, stream: false }).then((r) => r.data);

export const postWhatIf = (payload: any) =>
  http.post<any>('/finance/whatif', payload).then((r) => r.data);
