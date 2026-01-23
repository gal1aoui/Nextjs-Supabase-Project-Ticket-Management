"use server";

import { failure, type Result, success } from "@/lib/errors";
import { FROM, resend } from "@/lib/mailer";

interface EmailProps {
  to: string | undefined;
  subject: string;
  react: React.ReactElement;
}

interface EmailData {
  id: string;
}

export type EmailResult = Result<EmailData, string>;

export async function sendEmail({ to = "", subject, react }: EmailProps): Promise<EmailResult> {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    react,
  });

  if (error) {
    return failure(error.message);
  }

  return success(data as EmailData);
}
