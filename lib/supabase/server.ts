"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.map(({ name, value }) => cookieStore.set(name, value));
        },
      },
    }
  );
}

export const userServer = async () => {
  const supabaseServer = await createClient();
  const { data } = await supabaseServer.auth.getUser();
  return data.user;
};
