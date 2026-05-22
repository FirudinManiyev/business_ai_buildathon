import axios from 'axios';

const http = axios.create({ baseURL: '/api', withCredentials: true });

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
  email?: string;
  phone?: string;
  education?: string;
  skills: string[];
  experience_years?: string;
  projects: string[];
  languages: string[];
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  purchases: string[];
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

export interface ApplicationRecord {
  id: number;
  job_id: number;
  job_title: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string | null;
  cv: any;
  status: string;
  admin_message?: string | null;
  created_at?: string;
  updated_at?: string;
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

export const createJob = (payload: Omit<Job, 'id'>) =>
  http.post<Job>('/hr/jobs', payload).then((r) => r.data);

export const updateJob = (jobId: number, payload: Omit<Job, 'id'>) =>
  http.put<Job>(`/hr/jobs/${jobId}`, payload).then((r) => r.data);

export const deleteJob = (jobId: number) =>
  http.delete(`/hr/jobs/${jobId}`).then((r) => r.data);

export const analyzeCV = (cv: CVProfile) =>
  http.post<HRResult>('/hr/analyze', { cv, stream: false }).then((r) => r.data);

export const submitHRApplication = (job_id: number, cv: CVProfile) =>
  http.post('/hr/apply', { job_id, cv }).then((r) => r.data);

export const getCurrentUser = () =>
  http.get<AppUser | null>('/users/me').then((r) => r.data);

export const loginUser = (email: string, password: string) =>
  http.post<AppUser>('/users/login', { email, password }).then((r) => r.data);

export const registerUser = (name: string, email: string, password: string, role: 'user' | 'admin') =>
  http.post<AppUser>('/users/register', { name, email, password, role }).then((r) => r.data);

export const logoutUser = () =>
  http.post('/users/logout').then((r) => r.data);

export const saveUserCv = (userId: string, cv: CVProfile) =>
  http.post(`/users/${userId}/cv`, cv).then((r) => r.data);

export const getUserCv = (userId: string) =>
  http.get(`/users/${userId}/cv`).then((r) => r.data);

export const addUserPurchase = (userId: string, productName: string) =>
  http.post(`/users/${userId}/purchase`, { product_name: productName }).then((r) => r.data);

export const removeUserPurchase = (userId: string, productName: string) =>
  http.delete(`/users/${userId}/purchase`, { data: { product_name: productName } }).then((r) => r.data);

export const getHRApplications = (job_id?: number) =>
  http.get<ApplicationRecord[]>('/hr/applications', { params: job_id ? { job_id } : undefined }).then((r) => r.data);

export const actionHRApplication = (application_id: number, status: 'accepted' | 'rejected', admin_message?: string) =>
  http.post<ApplicationRecord>(`/hr/applications/${application_id}/action`, { status, admin_message: admin_message || null }).then((r) => r.data);

export const analyzeFinance = (whatif_scenario?: string) =>
  http.post<FinanceResult>('/finance/analyze', { whatif_scenario: whatif_scenario || null, stream: false }).then((r) => r.data);

export const postWhatIf = (payload: any) =>
  http.post<any>('/finance/whatif', payload).then((r) => r.data);

export const getFinanceSummary = () =>
  http.get('/finance/summary').then((r) => r.data);

export const postFinanceChat = (question: string) =>
  http.post('/finance/chat', { question }).then((r) => r.data);
