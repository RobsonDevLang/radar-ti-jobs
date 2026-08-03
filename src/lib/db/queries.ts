import { getSupabase } from "@/lib/supabase";
import {
  DEFAULT_FILTER,
  type ContestRow,
  type QueryHistoryRow,
  type SentNotificationRow,
  type UserFilterRow,
} from "./types";

function client() {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase não configurado.");
  return supabase;
}

/** Filtro do usuário (um por conta nesta fase); cria o padrão se ainda não existir. */
export async function getUserFilter(userId: string): Promise<UserFilterRow | null> {
  const { data, error } = await client()
    .from("user_filters")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as UserFilterRow | null) ?? null;
}

export async function saveUserFilter(
  userId: string,
  values: Partial<Omit<UserFilterRow, "id" | "user_id" | "created_at" | "updated_at">>,
  existingId?: string,
): Promise<UserFilterRow> {
  const payload = { ...DEFAULT_FILTER, ...values, user_id: userId };

  if (existingId) {
    const { data, error } = await client()
      .from("user_filters")
      .update(payload)
      .eq("id", existingId)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throw error;
    return data as UserFilterRow;
  }

  const { data, error } = await client()
    .from("user_filters")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as UserFilterRow;
}

export async function listContests(limit = 50): Promise<ContestRow[]> {
  const { data, error } = await client()
    .from("contests")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ContestRow[];
}

export async function listQueryHistory(limit = 50): Promise<QueryHistoryRow[]> {
  const { data, error } = await client()
    .from("query_history")
    .select("*")
    .order("executed_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as QueryHistoryRow[];
}

export async function listSentNotifications(
  userId: string,
  limit = 50,
): Promise<SentNotificationRow[]> {
  const { data, error } = await client()
    .from("sent_notifications")
    .select("*")
    .eq("user_id", userId)
    .order("sent_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as SentNotificationRow[];
}
