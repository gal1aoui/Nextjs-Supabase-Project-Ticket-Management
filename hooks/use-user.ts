"use client";

import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/client";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      return user;
    },
  });
}
