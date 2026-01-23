"use server";

import { redirect } from "next/navigation";
import { routes } from "@/app/routes";
import WelcomeEmail from "@/components/emails/WelcomeEmail";
import { sendEmail } from "@/services/mailer.service";
import { signUpNewUser } from "@/services/register.service";
import type { RegisterInput } from "@/types/authentication";

export async function registerAction(formData: RegisterInput) {
  const result = await signUpNewUser(formData);

  if (!result.success) {
    return {
      error: result.error.validation,
      serverError: result.error.server,
    };
  }

  const emailResult = await sendEmail({
    to: formData.email,
    subject: "Welcome to the Platform",
    react: WelcomeEmail({ name: formData.name, verificationCode: result.data.otp }),
  });

  if (!emailResult.success) {
    return { serverError: emailResult.error };
  }

  redirect(routes.dashboard.home);
}
