/*
 * Generates the social card at src/app/opengraph-image.png.
 *
 * Run with `npm run og` after changing the name, title or graduation year in
 * site-config. The output is committed, so nothing here runs during a build or
 * a request.
 *
 * Why this is a script and not an app/opengraph-image.tsx route:
 * `next/og` is broken on Windows in Next 15.1.0. Its bundled loader calls
 * path.join() on `import.meta.url`, which rewrites the file:// separators to
 * backslashes, and the fileURLToPath() that follows throws "Invalid URL". The
 * site is self-hosted on a Windows machine, so that failure would hit
 * production, not just this laptop. Generating the PNG ahead of time removes
 * the runtime dependency entirely: Next's file convention picks up
 * opengraph-image.png on its own and Cloudflare caches it forever.
 *
 * satori rasterises text to <path> with embedFont, so sharp only ever has to
 * draw paths and gradients. That matters: librsvg text rendering on Windows
 * cannot be relied on, and this way no font has to be installed to build.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FONT = join(ROOT, 'src', 'assets', 'Inter-SemiBold.ttf');
const OUT = join(ROOT, 'src', 'app', 'opengraph-image.png');

const SIZE = { width: 1200, height: 630 };

/* Design tokens, mirrored from tailwind.config.ts. satori reads no stylesheet. */
const ABYSS = '#050506';
const INK = '#f5f5f7';
const INK_DIM = '#9d9da7';
const INK_FAINT = '#606069';
const GLOW = '#828fff';

/*
 * Four stop alpha ramp, not colour to transparent. A two stop gradient falls
 * off linearly and shows a hard ring edge; the ramp approximates a gaussian,
 * which is what makes it read as light. Same rule as the site's ambient field.
 */
const BLOOM =
  'radial-gradient(circle at 22% 26%, rgba(130,143,255,0.22) 0%, rgba(130,143,255,0.12) 26%, rgba(130,143,255,0.045) 48%, rgba(130,143,255,0.012) 68%, rgba(130,143,255,0) 84%)';

/* Minimal createElement: satori accepts plain React-element-shaped objects. */
const h = (type, style, children) => ({
  type,
  props: { style, children },
});

const CONTENT = {
  location: 'LONDON, UK',
  name: 'Berktan Solmaz',
  title: 'Graduate Software Engineer',
  detail: 'Final year BEng, University of Westminster · Graduating 2027',
  domain: 'berktan.dev',
};

const card = h(
  'div',
  {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    backgroundColor: ABYSS,
    padding: '76px 84px',
    fontFamily: 'Inter',
  },
  [
    h('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      width: `${SIZE.width}px`,
      height: `${SIZE.height}px`,
      backgroundImage: BLOOM,
    }),
    /* Lit top edge: the same hairline every surface on the site carries. */
    h('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      width: `${SIZE.width}px`,
      height: '1px',
      backgroundColor: 'rgba(255,255,255,0.10)',
    }),
    h(
      'div',
      { display: 'flex', fontSize: 26, color: INK_DIM, letterSpacing: '-0.01em' },
      CONTENT.domain
    ),
    h('div', { display: 'flex', flexDirection: 'column' }, [
      h(
        'div',
        { display: 'flex', fontSize: 23, color: INK_FAINT, letterSpacing: '0.18em' },
        CONTENT.location
      ),
      h(
        'div',
        {
          display: 'flex',
          marginTop: 26,
          fontSize: 88,
          color: INK,
          letterSpacing: '-0.045em',
          lineHeight: 1.02,
        },
        CONTENT.name
      ),
      h(
        'div',
        { display: 'flex', marginTop: 14, fontSize: 46, color: GLOW, letterSpacing: '-0.03em' },
        CONTENT.title
      ),
      h(
        'div',
        { display: 'flex', marginTop: 30, fontSize: 25, color: INK_DIM, letterSpacing: '-0.01em' },
        CONTENT.detail
      ),
    ]),
  ]
);

const svg = await satori(card, {
  ...SIZE,
  embedFont: true,
  fonts: [
    {
      name: 'Inter',
      data: await readFile(FONT),
      style: 'normal',
      weight: 600,
    },
  ],
});

const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
await writeFile(OUT, png);

console.log(`Wrote ${OUT} (${(png.length / 1024).toFixed(1)} KB)`);
