import type { APIRoute } from 'astro';
import { welcomeEmailBodySchema } from '@/models/welcome-email';
import { jsonResponse } from '@/lib/http';
import { sendWelcomeEmail } from '@/services/welcome-email.service';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const raw: unknown = await request.json().catch(() => ({}));
    const parsed = welcomeEmailBodySchema.safeParse(raw);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Requeridos';
      return jsonResponse({ success: false, message }, { status: 400 });
    }

    const sent = await sendWelcomeEmail(parsed.data);

    if (!sent.ok) {
      return jsonResponse({ success: false, message: sent.message }, { status: 500 });
    }

    return jsonResponse({ success: true, message: 'Enviado' }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return jsonResponse({ success: false, message }, { status: 500 });
  }
};
