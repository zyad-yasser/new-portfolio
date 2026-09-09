import { requireEnv } from "@repo/utils";
import { getTransporter } from "./transport";

type PasswordResetEmailInput = {
  appName: string;
  to: string;
  name: string;
  url: string;
};

export async function sendPasswordResetEmail({ appName, to, name, url }: PasswordResetEmailInput) {
  const transporter = getTransporter();
  const gmailUser = requireEnv("GMAIL_USER");

  await transporter.sendMail({
    from: `"${appName}" <${gmailUser}>`,
    to,
    subject: `Reset your password for ${appName}`,
    text: `Hi ${name},\n\nWe received a request to reset your ${appName} password. Use the link below to choose a new one:\n${url}\n\nThis link expires in one hour and can only be used once.\n\nIf you didn't request this, you can ignore this email — your password won't change.`,
    html: `
      <p>Hi ${name},</p>
      <p>We received a request to reset your ${appName} password. Use the link below to choose a new one:</p>
      <p><a href="${url}">${url}</a></p>
      <p>This link expires in one hour and can only be used once.</p>
      <p>If you didn't request this, you can ignore this email — your password won't change.</p>
    `,
  });
}
