import type { APIRoute } from 'astro';
import { jsonResponse } from '@/lib/http';
import { waitlistCreateBodySchema } from '@/models/waitlist';

export const prerender = false;

const getCookieValue = (cookieHeader: string | null, name: string): string | null => {
  if (!cookieHeader) return null;
  return (
    cookieHeader
      .split(';')
      .map((part) => part.trim())
      .map((part) => {
        const eq = part.indexOf('=');
        if (eq === -1) return { key: part, value: '' };
        return { key: part.slice(0, eq), value: part.slice(eq + 1) };
      })
      .find(({ key }) => key === name)?.value ?? null
  );
};

/** Registra una entrada en la lista de espera. */
export const POST: APIRoute = async ({ request }) => {
  try {
    const raw: unknown = await request.json().catch(() => ({}));
    const parsed = waitlistCreateBodySchema.safeParse(raw);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return jsonResponse({ success: false, message }, { status: 400 });
    }

    const baseUrl = import.meta.env.SLOWORK_API_URL || process.env.SLOWORK_API_URL;
    if (!baseUrl) {
      return jsonResponse(
        { success: false, message: 'SLOWORK_API_URL no está configurada' },
        { status: 500 },
      );
    }

    const targetUrl = `${baseUrl.replace(/\/+$/, '')}/api/waitlist`;

    const upstreamRes = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    }).catch(() => null);

    if (upstreamRes === null) {
      return jsonResponse(
        { success: false, message: 'No se pudo conectar con la API' },
        { status: 502 },
      );
    }

    if (upstreamRes.status === 409) {
      return jsonResponse(
        { success: false, message: 'Email ya registrado' },
        { status: 409 },
      );
    }

    if (!upstreamRes.ok) {
      const fallbackMessage = 'Error al registrar en la lista de espera';
      const contentType = upstreamRes.headers.get('content-type') ?? '';
      const message = await (contentType.includes('application/json')
        ? upstreamRes
            .json()
            .then((d: unknown) =>
              d !== null &&
              typeof d === 'object' &&
              'message' in d &&
              typeof (d as { message?: unknown }).message === 'string'
                ? (d as { message: string }).message
                : fallbackMessage,
            )
            .catch(() => fallbackMessage)
        : upstreamRes.text().then(() => fallbackMessage).catch(() => fallbackMessage));

      return jsonResponse({ success: false, message }, { status: upstreamRes.status });
    }

    const cookieHeader = request.headers.get('cookie');
    const lang = getCookieValue(cookieHeader, 'slowork-language') ?? 'en';

    const welcomeUrl = `${baseUrl.replace(/\/+$/, '')}/api/welcome`;
    await fetch(welcomeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: parsed.data.firstName,
        email: parsed.data.email,
        lang,
      }),
    }).catch((err) => console.error('[API Waitlist Welcome Error]:', err));

    return jsonResponse({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[API Waitlist Error]:', err);
    const message = err instanceof Error ? err.message : 'Error interno';
    return jsonResponse({ success: false, message }, { status: 500 });
  }
};
