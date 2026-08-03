import { requireEnv } from "@repo/utils";
import type { ContactFormValues } from "@repo/utils/schemas/contact";
import { getTransporter } from "./transport";

type ContactEmailInput = Omit<ContactFormValues, "company">;

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
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p>${message.replace(/\n/g, "<br />")}</p>
    `,
  });
}
