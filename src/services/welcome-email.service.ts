import nodemailer from 'nodemailer';
import type { WelcomeEmailInput } from '../models/welcome-email';

function buildWelcomeHtml(args: { name: string; lang: 'es' | 'en' }): string {
  const { name, lang } = args;

  if (lang === 'es') {
    return `
      <div style="max-width: 640px; margin: auto; font-family: Arial, sans-serif; color: #1a1a1a; background-color: #fff; padding: 24px; border-radius: 16px;">
        <h2 style="margin-bottom: 8px;">Hola <strong>${name}</strong>,</h2>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
          ¡Ya eres parte de la comunidad <strong>Slowork</strong>!
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
          Tu registro ha sido confirmado. Te avisaremos cuando la plataforma esté disponible.
        </p>
        <p style="font-weight: bold; margin-top: 24px;">El equipo de Slowork</p>
      </div>
    `;
  }

  return `
    <div style="max-width: 640px; margin: auto; font-family: Arial, sans-serif; color: #1a1a1a; background-color: #fff; padding: 24px; border-radius: 16px;">
      <h2 style="margin-bottom: 8px;">Hello <strong>${name}</strong>,</h2>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
        You are now part of the <strong>Slowork</strong> community!
      </p>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
        Your registration has been confirmed. We’ll notify you when the platform is available.
      </p>
      <p style="font-weight: bold; margin-top: 24px;">The Slowork Team</p>
    </div>
  `;
}

export type WelcomeEmailSendResult =
  | { ok: true }
  | { ok: false; reason: 'missing_smtp' | 'send_failed'; message: string };

export async function sendWelcomeEmail(input: WelcomeEmailInput): Promise<WelcomeEmailSendResult> {
  const user = process.env.GODADDY_EMAIL;
  const pass = process.env.GODADDY_PASS;

  if (!user || !pass) {
    return { ok: false, reason: 'missing_smtp', message: 'Servidor sin credenciales SMTP' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: '"Slowork" <slowork@slowork.app>',
      to: input.email,
      subject:
        input.lang === 'es'
          ? 'Registro confirmado: Bienvenido a Slowork'
          : 'Registration confirmed: Welcome to Slowork',
      html: buildWelcomeHtml({ name: input.name, lang: input.lang }),
    });

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return { ok: false, reason: 'send_failed', message };
  }
}
