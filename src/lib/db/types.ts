/** Tipos que espelham o schema criado em supabase/fase-2.sql. */

export type NotificationChannel = "email" | "whatsapp";
export type LogLevelDb = "debug" | "info" | "warn" | "error";

export interface ContestRow {
  id: string;
  source: string;
  source_id: string;
  title: string;
  organization: string | null;
  role: string | null;
  salary: string | null;
  salary_max: number | null;
  vacancies: number | null;
  talent_pool: boolean;
  education: string | null;
  requirements: string | null;
  city: string | null;
  state: string | null;
  exam_board: string | null;
  published_at: string | null;
  registration_ends_at: string | null;
  status: string | null;
  official_url: string | null;
  news_url: string | null;
  content_hash: string;
  raw: unknown | null;
  created_at: string;
  updated_at: string;
}

export interface UserFilterRow {
  id: string;
  user_id: string;
  name: string;
  cities: string[];
  states: string[];
  roles: string[];
  keywords: string[];
  blocked_keywords: string[];
  discard_requires_cnh: boolean;
  discard_requires_postgrad: boolean;
  only_it: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type UserFilterInput = Omit<UserFilterRow, "id" | "created_at" | "updated_at">;

export interface SentNotificationRow {
  id: string;
  user_id: string;
  contest_id: string;
  channel: NotificationChannel;
  status: string;
  provider_id: string | null;
  error: string | null;
  sent_at: string;
}

export interface QueryHistoryRow {
  id: string;
  source: string;
  executed_at: string;
  items_found: number;
  items_new: number;
  status: string;
  duration_ms: number | null;
  error: string | null;
}

export interface ExecutionLogRow {
  id: string;
  level: LogLevelDb;
  stage: string;
  message: string;
  context: Record<string, unknown> | null;
  duration_ms: number | null;
  error: string | null;
  created_at: string;
}

export const DEFAULT_FILTER: Omit<UserFilterInput, "user_id"> = {
  name: "Meu filtro",
  cities: ["Porto Alegre"],
  states: ["RS"],
  roles: [],
  keywords: [],
  blocked_keywords: [],
  discard_requires_cnh: true,
  discard_requires_postgrad: true,
  only_it: true,
  active: true,
};
