import type { APIRoute } from 'astro';

import {
  logWaitlistError,
  logWaitlistOps,
  logWaitlistVerbose,
} from '@/lib/waitlist-telemetry';
import { jsonResponse } from '@/lib/http';
import { waitlistCreateBodySchema } from '@/models/waitlist';
import { registerWaitlistEntry } from '@/services/waitlist.service';

export const prerender = false;

/** Registra una entrada en la lista de espera. */
export const POST: APIRoute = async ({ request }) => {
  const started = Date.now();
  const requestId = crypto.randomUUID();

  logWaitlistVerbose('incoming', {
    requestId,
    method: request.method,
    hasContentType: Boolean(request.headers.get('content-type')),
  });

  try {
    const raw: unknown = await request.json().catch(() => ({}));
    /** Si el JSON no es válido, se devuelve un error 400. */
    logWaitlistVerbose('json_ready', {
      requestId,
      keys:
        raw !== null && typeof raw === 'object' && !Array.isArray(raw)
          ? Object.keys(raw)
          : [],
    });

    const parsed = waitlistCreateBodySchema.safeParse(raw);

    if (!parsed.success) {
      logWaitlistVerbose('validation_failed', {
        requestId,
        issueCount: parsed.error.issues.length,
        firstCode: parsed.error.issues[0]?.code,
      });
      const message = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return jsonResponse({ success: false, message }, { status: 400 });
    }

    const registerStarted = Date.now();
    const result = await registerWaitlistEntry(parsed.data, request);
    const registerMs = Date.now() - registerStarted;

    logWaitlistOps('register_finished', {
      requestId,
      registerMs,
      totalMs: Date.now() - started,
      outcome: result.outcome,
    });

    if (result.outcome === 'duplicate') {
      return jsonResponse({ success: false, message: 'Email ya registrado' }, { status: 409 });
    }

    /** Si la persistencia falla, se devuelve un error 503. */
    if (result.outcome === 'persist_failed') {
      logWaitlistError('persist_failed_response', {
        requestId,
        totalMs: Date.now() - started,
        registerMs,
      });
      return jsonResponse({ success: false, message: result.message }, { status: 503 });
    }

    return jsonResponse({ success: true, item: result.item }, { status: 200 });
  } catch (err) {
    /** Si ocurre un error no manejado, se devuelve un error 500. */
    logWaitlistError('unhandled_exception', {
      requestId,
      totalMs: Date.now() - started,
      errorName: err instanceof Error ? err.name : 'unknown',
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    const message = err instanceof Error ? err.message : 'Error interno';
    return jsonResponse({ success: false, message }, { status: 500 });
  }
};
