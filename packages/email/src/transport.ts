import { requireEnv } from "@repo/utils";
import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | undefined;

export function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: requireEnv("GMAIL_USER"),
        pass: requireEnv("GMAIL_APP_PASSWORD"),
      },
    });
  }
  return transporter;
}
