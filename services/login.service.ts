"use server";

import z from "zod";
import { failure, type Result, success } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { type LoginInput, loginSchema } from "@/types/authentication";

type ValidationErrors = Record<string, { errors: string[] }>;

type LoginError = { validation?: ValidationErrors; server?: string };

export type LoginResult = Result<{ user: Record<string, unknown> }, LoginError>;

export async function signInWithEmail(formData: LoginInput): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(formData);

  if (!parsed.success) {
    return failure({
      validation: z.treeifyError(parsed.error).properties as ValidationErrors,
    });
  }

  const { email, password } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return failure({ server: error.message });
  }

  return success({ user: data.user.user_metadata });
}
