"use server";

import { redirect } from "next/navigation";
import { routes } from "@/app/routes";
import VerificationEmail from "@/components/emails/VerificationEmail";
import { failure, type Result, success } from "@/lib/errors";
import { generateOtpCode } from "@/lib/helpers";
import { createClient, userServer } from "@/lib/supabase/server";
import { sendEmail } from "@/services/mailer.service";

type UserMetadata = Record<string, string>;

type VerificationResult = Result<{ user: UserMetadata }, string>;

async function updateUserVerification(status: string): Promise<VerificationResult> {
  const supabaseServer = await createClient();
  const { data, error } = await supabaseServer.auth.updateUser({
    data: { verified_code: status },
  });

  if (error) {
    return failure(error.message);
  }

  await supabaseServer.auth.refreshSession();

  return success({ user: data.user?.user_metadata as UserMetadata });
}

export async function verificationAction(otp: string) {
  const user = await userServer();

  if (user?.user_metadata.verified_code === otp) {
    const result = await updateUserVerification("confirmed");

    if (!result.success) {
      return { serverError: result.error };
    }
  }

  redirect(routes.dashboard.home);
}

export async function resendVerificationAction() {
  const otp = generateOtpCode();

  const result = await updateUserVerification(otp);

  if (!result.success) {
    return { serverError: result.error };
  }

  const emailResult = await sendEmail({
    to: result.data.user.email,
    subject: "Verification Code",
    react: VerificationEmail({ name: result.data.user.name, verificationCode: otp }),
  });

  if (!emailResult.success) {
    return { serverError: emailResult.error };
  }

  return { success: true };
}
