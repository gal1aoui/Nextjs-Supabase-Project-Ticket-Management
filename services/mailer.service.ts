"use server";

import { FROM, resend } from "@/lib/mailer";

interface EmailProps {
  to: string | undefined;
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({ to = "", subject, react }: EmailProps) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    react,
  });

  if (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
  console.log("Email sent successfully:", data);
  return { success: true, data };
}
