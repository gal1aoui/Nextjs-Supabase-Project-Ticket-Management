import z from "zod";
import { createClient } from "@/lib/supabase/client";
import { type LoginInput, loginSchema } from "@/types/authentication";

const supabase = createClient();

export async function signInWithEmail(formData: LoginInput) {
  const form = {
    email: formData.email,
    password: formData.password,
  };

  const parsed = loginSchema.safeParse(form);

  if (!parsed.success) {
    return { error: z.treeifyError(parsed.error).properties };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { supabaseError: error.message };
  }

  return { user: data.user.user_metadata };
}
