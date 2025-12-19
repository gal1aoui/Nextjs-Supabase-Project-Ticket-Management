"use server";

import { redirect } from "next/navigation";
import { routes } from "@/app/routes";
import { sendEmail } from "@/services/mailer.service";
import { signUpNewUser } from "@/services/register.service";
import type { RegisterInput } from "@/types/authentication";
import WelcomeEmail from "../../../components/emails/WelcomeEmail";

export async function registerAction(formData: RegisterInput) {
  const { supabaseError, error, otp } = await signUpNewUser(formData);

  if (supabaseError || error) {
    return supabaseError ? { serverError: supabaseError } : { error };
  }

  const mailer = await sendEmail({
    to: formData.email,
    subject: "Welcome to the Platform 🎉",
    react: WelcomeEmail({ name: formData.name, verificationCode: otp! }),
  });

  if (mailer.error) {
    return { serverError: mailer.error };
  }

  redirect(routes.dashboard.home);
}
