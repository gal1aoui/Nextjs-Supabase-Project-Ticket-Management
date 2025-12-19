import { redirect } from "next/navigation";
import { routes } from "@/app/routes";
import { signInWithEmail } from "@/services/login.service";
import type { LoginInput } from "@/types/authentication";

export async function loginAction(formData: LoginInput) {
  const { error, supabaseError } = await signInWithEmail(formData);

  if (error || supabaseError) {
    return error ? { error } : { supabaseError };
  }

  redirect(routes.dashboard.home);
}
