import { requireEnv } from "@repo/utils";
import type { ContactFormValues } from "@repo/utils/schemas/contact";
import { getTransporter } from "./transport";

type ContactEmailInput = Omit<ContactFormValues, "company">;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendContactEmail({ name, email, subject, message }: ContactEmailInput) {
  const transporter = getTransporter();
  const gmailUser = requireEnv("GMAIL_USER");
  const to = process.env.CONTACT_TO_EMAIL || "zyadyasser6@gmail.com";

  await transporter.sendMail({
    from: `"Portfolio Contact" <${gmailUser}>`,
    to,
    replyTo: email,
    subject: `Portfolio contact: ${subject}`,
    text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
    html: `
      <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
    `,
  });
}
