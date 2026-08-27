import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { siteConfig } from '@/lib/site-config';

/*
 * Contact form endpoint.
 *
 * Node runtime, not edge: the Resend SDK and the in-process rate limiter both
 * need it, and the deployment is a single long-lived Node server anyway.
 * force-dynamic because a POST handler must never be treated as static.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Reject before parsing. A contact form has no business receiving more. */
const MAX_BODY_BYTES = 16 * 1024;

const LIMITS = {
  name: { min: 1, max: 100 },
  email: { max: 254 },
  message: { min: 10, max: 5000 },
} as const;

/*
 * Same expression the client uses. Duplicated on purpose: the client copy is
 * for fast feedback, this one is the control. Anything that only exists in the
 * browser is a suggestion, not a rule.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/*
 * ---------------------------------------------------------------------------
 * Rate limiting
 * ---------------------------------------------------------------------------
 * An in-memory sliding window, which is only viable because this runs as one
 * persistent Node process. On a serverless platform each invocation would get
 * its own empty map and this would enforce nothing.
 *
 * The key is the `cf-connecting-ip` header. That header is only trustworthy
 * while the origin is reachable exclusively through the Cloudflare Tunnel,
 * because any client that can reach the origin directly can set it to whatever
 * it likes and rotate through fake addresses. That invariant is a property of
 * the deployment, not of this file: the day the port is exposed directly, this
 * limiter stops working and needs replacing.
 */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
/* Bounds memory if an attacker does manage to rotate the key. */
const MAX_TRACKED_CLIENTS = 5000;

const hits = new Map<string, number[]>();

function clientKey(request: Request): string {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  // Direct hit, or a proxy that is not Cloudflare. Take the first entry only:
  // the rest of an x-forwarded-for chain is client-supplied.
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  return 'unknown';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  /*
   * Drop clients whose whole window has expired, so the map cannot grow
   * without bound over the lifetime of the process. Collected first and
   * deleted after rather than iterated with for..of, because the project
   * compiles to ES5 and iterating a Map there needs downlevelIteration.
   */
  const stale: string[] = [];
  hits.forEach((timestamps, existingKey) => {
    const newest = timestamps[timestamps.length - 1];
    if (newest === undefined || newest < cutoff) stale.push(existingKey);
  });
  stale.forEach((existingKey) => hits.delete(existingKey));

  const recent = (hits.get(key) ?? []).filter((time) => time >= cutoff);

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }

  // Under pressure, refuse to track anything new rather than let the map grow.
  if (!hits.has(key) && hits.size >= MAX_TRACKED_CLIENTS) return true;

  recent.push(now);
  hits.set(key, recent);
  return false;
}

/* ------------------------------------------------------------------------- */

type ContactPayload = {
  name: string;
  email: string;
  message: string;
  /* Honeypot. A real person never sees this field, so a filled one is a bot. */
  company?: string;
};

function fail(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

function parsePayload(value: unknown): ContactPayload | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;

  const name = record.name;
  const email = record.email;
  const message = record.message;
  const company = record.company;

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof message !== 'string' ||
    (company !== undefined && typeof company !== 'string')
  ) {
    return null;
  }

  return { name, email, message, company };
}

export async function POST(request: Request) {
  if (isRateLimited(clientKey(request))) {
    return fail('rate_limited', 429);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return fail('too_large', 413);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fail('invalid', 400);
  }

  const payload = parsePayload(parsed);
  if (!payload) return fail('invalid', 400);

  /*
   * Silent success for the honeypot. Telling a bot it was detected just tells
   * whoever wrote it which field to leave alone next time.
   */
  if (payload.company && payload.company.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = payload.name.trim();
  const email = payload.email.trim();
  const message = payload.message.trim();

  if (name.length < LIMITS.name.min || name.length > LIMITS.name.max) {
    return fail('invalid', 400);
  }
  if (email.length > LIMITS.email.max || !EMAIL_PATTERN.test(email)) {
    return fail('invalid', 400);
  }
  if (
    message.length < LIMITS.message.min ||
    message.length > LIMITS.message.max
  ) {
    return fail('invalid', 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;
  const to = process.env.CONTACT_TO || siteConfig.email;

  /*
   * Not configured is a distinct state from failed, so the form can offer the
   * mailto: fallback instead of implying the message went somewhere.
   */
  if (!apiKey || !from) return fail('unconfigured', 503);

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to,
      /* Replying goes straight back to the sender, not to the noreply box. */
      replyTo: email,
      subject: `Portfolio enquiry from ${name}`,
      text: [`Name: ${name}`, `Email: ${email}`, '', message].join('\n'),
    });

    if (result.error) {
      // Log for the operator, return a generic code to the client: provider
      // messages can name internal addresses and configuration.
      console.error('[contact] resend rejected the message', result.error);
      return fail('send_failed', 502);
    }
  } catch (error) {
    console.error('[contact] resend threw', error);
    return fail('send_failed', 502);
  }

  return NextResponse.json({ ok: true });
}

/*
 * Anything that is not a POST gets a flat refusal rather than Next's default
 * 405 page, so a crawler finding this URL sees nothing interesting.
 */
export function GET() {
  return fail('method_not_allowed', 405);
}
