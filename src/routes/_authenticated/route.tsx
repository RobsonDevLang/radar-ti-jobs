import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const supabase = getSupabase();
    if (!supabase) throw redirect({ to: "/auth" });
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { modo: "login" } });
    return { user: data.user };
  },
  component: () => <Outlet />,
});
