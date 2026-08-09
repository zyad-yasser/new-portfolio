import { requireEnv } from "@repo/utils";
import { getTransporter } from "./transport";

type VerificationEmailInput = {
  appName: string;
  to: string;
  name: string;
  url: string;
};

export async function sendVerificationEmail({ appName, to, name, url }: VerificationEmailInput) {
  const transporter = getTransporter();
  const gmailUser = requireEnv("GMAIL_USER");

  await transporter.sendMail({
    from: `"${appName}" <${gmailUser}>`,
    to,
    subject: `Verify your email for ${appName}`,
    text: `Hi ${name},\n\nVerify your email address to unlock writing on ${appName}:\n${url}\n\nIf you didn't create this account, you can ignore this email.`,
    html: `
      <p>Hi ${name},</p>
      <p>Verify your email address to unlock writing on ${appName}:</p>
      <p><a href="${url}">${url}</a></p>
      <p>If you didn't create this account, you can ignore this email.</p>
    `,
  });
}
