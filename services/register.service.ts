"use server";

import z from "zod";
import { generateOtpCode } from "@/lib/helpers";
import { createClient } from "@/lib/supabase/server";
import { type RegisterInput, registerSchema } from "@/types/authentication";

export async function signUpNewUser(formData: RegisterInput) {
  const supabase = createClient();

  const form = {
    email: formData.email,
    name: formData.name,
    password: formData.password,
    confirmPassword: formData.confirmPassword,
  };

  const parsed = registerSchema.safeParse(form);

  if (!parsed.success) {
    return { error: z.treeifyError(parsed.error).properties };
  }

  const { email, password, name } = parsed.data;

  const otp = generateOtpCode();
  const username = `${name.split(" ")[0][0]}${name.split(" ")[1]}`;
  console.log("username:", username);

  const { error } = await (await supabase).auth.signUp({
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
    console.log("Supabase sign-up error:", error);
    return { supabaseError: error.message };
  }

  return { success: true, otp };
}
