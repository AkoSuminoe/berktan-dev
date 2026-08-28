import { NextResponse, type NextRequest } from 'next/server';

/*
 * Serves the Whisper demo on its own subdomain from the same Next application.
 *
 * The Cloudflare Tunnel sends whisper.berktan.dev/api/* straight to the
 * FastAPI server and everything else on that hostname here, so this only ever
 * sees page requests. That split is what makes the demo same-origin with its
 * own API: no CORS, no preflight, no origin allowlist to keep in step.
 *
 * Two rules, and together they guarantee exactly one canonical URL:
 *   whisper.berktan.dev/*  rewrites to /whisper (same URL in the address bar)
 *   berktan.dev/whisper    redirects to the subdomain (308, permanent)
 *
 * Without the second rule the same page would answer on two hostnames, which
 * is duplicate content and splits whatever authority the page earns.
 */

const WHISPER_HOST = 'whisper.berktan.dev';
const WHISPER_ORIGIN = `https://${WHISPER_HOST}`;

export function middleware(request: NextRequest) {
  // The Host header is what the tunnel forwards; nextUrl.hostname is not
  // reliable behind a proxy that terminates TLS elsewhere.
  const host = (request.headers.get('host') ?? '').toLowerCase().split(':')[0];
  const { pathname } = request.nextUrl;

  if (host === WHISPER_HOST) {
    // Already the right page, or an asset. Leave it alone.
    if (pathname === '/whisper' || pathname.startsWith('/whisper/')) {
      return NextResponse.next();
    }

    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/whisper', request.url));
    }

    /*
     * Anything else on this hostname is not part of the demo. Send it to the
     * main site rather than rendering a page that claims to live here.
     */
    return NextResponse.redirect(
      new URL(pathname, 'https://berktan.dev'),
      308
    );
  }

  // The demo has one home, and it is the subdomain.
  if (pathname === '/whisper' || pathname.startsWith('/whisper/')) {
    return NextResponse.redirect(new URL('/', WHISPER_ORIGIN), 308);
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Skip the build output, the metadata files and anything that looks like a
   * static asset, so the middleware does not run once per request for every
   * image and chunk on the page.
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|og/|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml|woff|woff2|ttf|jsdos)$).*)',
  ],
};
