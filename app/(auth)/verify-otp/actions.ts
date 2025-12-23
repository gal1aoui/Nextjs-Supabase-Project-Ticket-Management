"use server";

import { redirect } from "next/navigation";
import { routes } from "@/app/routes";
import VerificationEmail from "@/components/emails/VerificationEmail";
import { generateOtpCode } from "@/lib/helpers";
import { createClient, userServer } from "@/lib/supabase/server";
import { sendEmail } from "@/services/mailer.service";

const updateUserVerification = async (status: string) => {
  const supabaseServer = await createClient();
  const { data, error } = await supabaseServer.auth.updateUser({
    data: { verified_code: status },
  });

  if (error) {
    return { error };
  }

  // refreshing the session, to ensure the user's browser immediately
  // receives a JWT that contains the updated status
  await supabaseServer.auth.refreshSession();

  return { user: data.user?.user_metadata };
};

export async function verificationAction(otp: string) {
  const user = await userServer();

  if (user?.user_metadata.verified_code === otp) {
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
