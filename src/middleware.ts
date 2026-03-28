import { defineMiddleware } from 'astro:middleware';

import {
  buildLanguageSetCookieHeader,
  resolveLocaleForRoot,
} from '@/models/i18n';

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;
  if (pathname !== '/') {
    return next();
  }

  const locale = resolveLocaleForRoot(
    context.request.headers.get('cookie'),
    context.request.headers.get('accept-language'),
  );
  const target = new URL(`/${locale}/`, context.url).pathname;

  const headers = new Headers();
  headers.set('Location', target);
  headers.append('Set-Cookie', buildLanguageSetCookieHeader(locale));

  return new Response(null, { status: 302, headers });
});
