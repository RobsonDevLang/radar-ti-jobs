/** Tipos do banco derivados da fonte única: src/lib/database.types.ts (schema fase-1 + fase-2). */

import type { Database } from "@/lib/database.types";

export type NotificationChannel = Database["public"]["Enums"]["notification_channel"];
export type LogLevelDb = Database["public"]["Enums"]["log_level"];

export type ContestRow = Database["public"]["Tables"]["contests"]["Row"];
export type UserFilterRow = Database["public"]["Tables"]["user_filters"]["Row"];
export type SentNotificationRow = Database["public"]["Tables"]["sent_notifications"]["Row"];
export type QueryHistoryRow = Database["public"]["Tables"]["query_history"]["Row"];
export type ExecutionLogRow = Database["public"]["Tables"]["execution_logs"]["Row"];

export type UserFilterInput = Omit<UserFilterRow, "id" | "created_at" | "updated_at">;

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
