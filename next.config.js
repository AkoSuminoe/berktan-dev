/** @type {import('next').NextConfig} */

/*
 * Self-hosted target: `next build && next start` on a Node server behind a
 * Cloudflare Tunnel. No Vercel adapters, no edge-only APIs.
 *
 * Not set here, on purpose:
 * - `output: 'standalone'`. It changes the start command to
 *   `node .next/standalone/server.js` and file tracing would then have to be
 *   audited. `next start` is what the deployment uses.
 * - `Strict-Transport-Security`. Cloudflare terminates TLS for this domain and
 *   its dashboard toggle can be turned off instantly; an HSTS header baked
 *   into the origin is cached by browsers for its full max-age and cannot be.
 * - A Content-Security-Policy. js-dos injects a remote script, the Cloudflare
 *   beacon is a second remote origin, and the JSON-LD block is inline, so a
 *   useful policy needs nonces threaded through all three. Worth doing, but as
 *   its own change with its own testing.
 */
const nextConfig = {
    reactStrictMode: true,
    // Drops the X-Powered-By: Next.js banner from every response.
    poweredByHeader: false,
    images: {
        /*
         * This allowlist is the enforcement point for every next/image src.
         * Adding a host is a deliberate decision: the image optimizer fetches
         * whatever it is pointed at, from the origin, on the origin's network.
         */
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com'
            },
            {
                protocol: 'https',
                hostname: 'github.com'
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com'
            },
            {
                protocol: 'https',
                hostname: 'i.scdn.co'
            }
        ],
        /*
         * Seven days. The default is 60 seconds, which on a laptop origin
         * means re-optimising the same album art and avatars all day. Every
         * URL behind these hosts is content addressed, so a long TTL is safe.
         */
        minimumCacheTTL: 60 * 60 * 24 * 7
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(), payment=()'
                    }
                ]
            }
        ];
    }
};

module.exports = nextConfig;
