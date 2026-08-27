import Script from 'next/script';

/*
 * Cloudflare Web Analytics.
 *
 * Cookieless and sampled server side from the edge the site is already served
 * through, so there is no local storage, no device fingerprint, no cross site
 * identifier, and nothing that needs a consent banner under UK GDPR. That is
 * the whole reason it was picked over the alternatives.
 *
 * The token is `NEXT_PUBLIC_` on purpose and this does NOT contradict the rule
 * in AI_MEMORY.md section 5 that secrets are never `NEXT_PUBLIC_`. A beacon
 * token is a site identifier, not a credential: it is designed to sit in the
 * HTML of every page on every Cloudflare-analytics site, it grants no read
 * access to the dashboard, and the data it labels is already public traffic to
 * a public page. Compare `SPOTIFY_CLIENT_SECRET`, which would be a real leak.
 *
 * Renders nothing when the token is missing, so a local `next dev` or a clone
 * without an `.env.local` never sends traffic anywhere. Same shape as
 * NowPlaying's `unconfigured` state.
 *
 * Accepted risk, in the same category as the js-dos loader: this grants
 * static.cloudflareinsights.com script execution on the page. `beacon.min.js`
 * is a moving target so Subresource Integrity is not possible as written. It
 * is a first-party-adjacent origin here because Cloudflare already terminates
 * TLS for this domain and could inject the same script itself.
 */
export default function Analytics() {
  const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
  if (!token) return null;

  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
