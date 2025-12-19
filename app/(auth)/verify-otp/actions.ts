"use server";

import { redirect } from "next/navigation";
import { routes } from "@/app/routes";
import VerificationEmail from "@/components/emails/VerificationEmail";
import { generateOtpCode } from "@/lib/helpers";
import { sendEmail } from "@/services/mailer.service";
import { getCurrentUser, updateUserVerification } from "@/services/user.service";

export async function verificationAction(otp: string) {
  const { user } = await getCurrentUser();

  if (user!.verified_code === otp) {
    const { error } = await updateUserVerification("confirmed");

    if (error) {
      return { serverError: error.message };
    }
  }

  redirect(routes.dashboard.home);
}

export async function resendVerificationAction() {
  const otp = generateOtpCode();

  const { user, error } = await updateUserVerification(otp);

  console.log(error);

  if (error) {
    return { serverError: error.message };
  }

  const mailer = await sendEmail({
    to: user!.email,
    subject: "Welcome to the Platform 🎉",
    react: VerificationEmail({ name: user!.name, verificationCode: otp }),
  });

  if (mailer.error) {
    return { serverError: mailer.error };
  }

  return { success: true };
}
