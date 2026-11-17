import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Sends a transactional email using Resend
 */
export async function sendTransactionalEmail(options: SendEmailOptions) {
  if (!resend) {
    console.warn("Resend API key is not configured. Email dispatch skipped:", options.subject);
    return {
      success: false,
      error: "RESEND_API_KEY is not configured in environment variables.",
    };
  }

  const fromEmail = options.from || process.env.RESEND_FROM_EMAIL || "WebBazaar <onboarding@resend.dev>";

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Resend send error:", error);
    return {
      success: false,
      error: error?.message || "Failed to send email via Resend",
    };
  }
}
