"use server";

import z from "zod";
import { failure, type Result, success } from "@/lib/errors";
import { generateOtpCode } from "@/lib/helpers";
import { createClient } from "@/lib/supabase/server";
import { type RegisterInput, registerSchema } from "@/types/authentication";

type ValidationErrors = Record<string, { errors: string[] }>;

export type RegisterResult = Result<
  { otp: string },
  { validation?: ValidationErrors; server?: string }
>;

export async function signUpNewUser(formData: RegisterInput): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(formData);

  if (!parsed.success) {
    return failure({
      validation: z.treeifyError(parsed.error).properties as ValidationErrors,
    });
  }

  const { email, password, name } = parsed.data;

  const otp = generateOtpCode();
  const nameParts = name.split(" ");
  const username =
    nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[1]}` : nameParts[0].toLowerCase();

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: "/login",
      data: {
        name,
        username,
        verified_code: otp,
      },
    },
  });

  if (error) {
    return failure({ server: error.message });
  }

  return success({ otp });
}
