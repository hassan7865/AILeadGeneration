export type ApiStatus = "success" | "error";

export interface ApiResponse<T> {
  status: ApiStatus;
  message: string;
  data: T;
}

export type LeadStatus = "new" | "contacted" | "qualified" | "disqualified";
export type LeadSource = "linkedin" | "crunchbase" | "apollo" | "jobboard";

export interface Lead {
  id: string;
  company_id: string;
  contact_id: string;
  icp_score: number;
  status: LeadStatus;
  source: LeadSource;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadListItem {
  id: string;
  company: string;
  contact_name: string;
  industry: string;
  icp_score: number;
  signal: string;
  status: LeadStatus;
  source: LeadSource;
  added_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
}

export interface InsightsSummary {
  total_leads: number;
  qualified_count: number;
  avg_score: number;
  pipeline_value: number;
  total_leads_change_pct: number | null;
  qualified_change_pct: number | null;
  pipeline_change_pct: number | null;
  avg_score_label: string | null;
  signals_last_7_days: number;
}

export interface LeadQualityPoint {
  day: string;
  total: number;
  qualified: number;
}

export interface IcpHealthResponse {
  segments: Record<string, number>;
  match_avg_pct: number;
}

export interface SignalEvent {
  id: string;
  company_name: string;
  signal_type: string;
  headline: string;
  subtitle: string | null;
  detected_at: string;
  heat: string;
}

export interface AutomationConfig {
  daily_refresh: boolean;
  refresh_time: string;
  sources: Record<string, boolean>;
  target_industries: string[];
  company_size_min: number;
  company_size_max: number;
  geography: string;
  tech_stack: string[];
  crm_connections: Record<string, boolean>;
}

export interface AutomationRun {
  id: string;
  status: string;
}
