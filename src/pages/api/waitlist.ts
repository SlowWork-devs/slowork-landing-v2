import type { APIRoute } from 'astro';
import { waitlistCreateBodySchema } from '../../models/waitlist';
import { jsonResponse } from '../../lib/http';
import { registerWaitlistEntry } from '../../services/waitlist.service';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const raw: unknown = await request.json().catch(() => ({}));
    const parsed = waitlistCreateBodySchema.safeParse(raw);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return jsonResponse({ success: false, message }, { status: 400 });
    }

    const result = await registerWaitlistEntry(parsed.data, request);

    if (result.outcome === 'duplicate') {
      return jsonResponse({ success: false, message: 'Email ya registrado' }, { status: 409 });
    }

    return jsonResponse({ success: true, item: result.item }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return jsonResponse({ success: false, message }, { status: 500 });
  }
};
