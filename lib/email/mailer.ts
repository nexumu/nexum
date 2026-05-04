import nodemailer from "nodemailer";

const smtpHost = process.env.GOOGLE_SMTP_HOST;
const smtpPort = Number(process.env.GOOGLE_SMTP_PORT ?? "587");
const smtpUser = process.env.GOOGLE_SMTP_USER;
const smtpPass = process.env.GOOGLE_SMTP_PASS;

const canSendEmail =
  Boolean(smtpHost) &&
  Boolean(smtpUser) &&
  Boolean(smtpPass) &&
  Number.isFinite(smtpPort);

const transporter = canSendEmail
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

if (!transporter) {
  console.warn(
    "SMTP config is missing. Set GOOGLE_SMTP_HOST, GOOGLE_SMTP_PORT, GOOGLE_SMTP_USER, and GOOGLE_SMTP_PASS."
  );
}

export async function sendBusinessOrderEmail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  if (!transporter || !smtpUser) {
    return { sent: false } as const;
  }

  await transporter.sendMail({
    from: smtpUser,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  return { sent: true } as const;
}
