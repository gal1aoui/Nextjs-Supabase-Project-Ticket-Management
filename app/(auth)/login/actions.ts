"use server";

import { redirect } from "next/navigation";
import { routes } from "@/app/routes";
import { signInWithEmail } from "@/services/login.service";
import type { LoginInput } from "@/types/authentication";

export async function loginAction(formData: LoginInput) {
  const result = await signInWithEmail(formData);

  if (!result.success) {
    return {
      error: result.error.validation,
      serverError: result.error.server,
    };
  }

  redirect(routes.dashboard.home);
}
