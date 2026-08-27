/*
 * Generates every social card the site serves.
 *
 *   src/app/opengraph-image.png   home, and the fallback every route inherits
 *   public/og/work.png            the /work index
 *   public/og/<slug>.png          one per case study
 *
 * Run with `npm run og` after changing site copy or adding a case study.
 * The output is committed, so nothing here runs during a build or a request.
 *
 * Why this is a script and not an app/opengraph-image.tsx route:
 * `next/og` is broken on Windows in Next 15. Its bundled loader calls
 * path.join() on `import.meta.url`, which rewrites the file:// separators to
 * backslashes, and the fileURLToPath() that follows throws "Invalid URL". The
 * site is self-hosted on a Windows machine, so that failure would hit
 * production, not just this laptop. Generating the PNGs ahead of time removes
 * the runtime dependency entirely.
 *
 * satori rasterises text to <path> with embedFont, so sharp only ever has to
 * draw paths and gradients. That matters: librsvg text rendering on Windows
 * cannot be relied on, and this way no font has to be installed to build.
 *
 * The case study list is imported straight from the TypeScript module (Node
 * strips the types), so a new study gets a card without touching this file.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import sharp from 'sharp';
import { caseStudies } from '../src/lib/case-studies.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FONT = join(ROOT, 'src', 'assets', 'Inter-SemiBold.ttf');
const OG_DIR = join(ROOT, 'public', 'og');

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
const h = (type, style, children) => ({ type, props: { style, children } });

const layer = (extra) =>
  h('div', {
    position: 'absolute',
    top: 0,
    left: 0,
    width: `${SIZE.width}px`,
    height: `${SIZE.height}px`,
    ...extra,
  });

/*
 * One card shape for every page, so a shared link is recognisably from this
 * site whichever page it points at. The eyebrow and the accent line carry the
 * difference.
 */
function card({ eyebrow, title, accent, detail, titleSize = 88 }) {
  return h(
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
      layer({ backgroundImage: BLOOM }),
      /* Lit top edge: the same hairline every surface on the site carries. */
      layer({ height: '1px', backgroundColor: 'rgba(255,255,255,0.10)' }),

      h(
        'div',
        {
          display: 'flex',
          fontSize: 26,
          color: INK_DIM,
          letterSpacing: '-0.01em',
        },
        'berktan.dev'
      ),

      h('div', { display: 'flex', flexDirection: 'column' }, [
        h(
          'div',
          {
            display: 'flex',
            fontSize: 23,
            color: INK_FAINT,
            letterSpacing: '0.18em',
          },
          eyebrow
        ),
        h(
          'div',
          {
            display: 'flex',
            marginTop: 26,
            fontSize: titleSize,
            color: INK,
            letterSpacing: '-0.045em',
            lineHeight: 1.02,
          },
          title
        ),
        accent
          ? h(
              'div',
              {
                display: 'flex',
                marginTop: 14,
                fontSize: 46,
                color: GLOW,
                letterSpacing: '-0.03em',
              },
              accent
            )
          : null,
        detail
          ? h(
              'div',
              {
                display: 'flex',
                marginTop: 30,
                fontSize: 25,
                color: INK_DIM,
                letterSpacing: '-0.01em',
                lineHeight: 1.35,
              },
              detail
            )
          : null,
      ]),
    ]
  );
}

const fontData = await readFile(FONT);

async function render(element, outPath) {
  const svg = await satori(element, {
    ...SIZE,
    embedFont: true,
    fonts: [{ name: 'Inter', data: fontData, style: 'normal', weight: 600 }],
  });
  const png = await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(outPath, png);
  console.log(`  ${outPath.replace(ROOT, '.')}  ${(png.length / 1024).toFixed(1)} KB`);
}

/* Long taglines need a smaller face to stay on the card. */
function titleSizeFor(text) {
  if (text.length > 26) return 62;
  if (text.length > 18) return 74;
  return 88;
}

await mkdir(OG_DIR, { recursive: true });

console.log('Generating social cards');

await render(
  card({
    eyebrow: 'LONDON, UK',
    title: 'Berktan Solmaz',
    accent: 'Graduate Software Engineer',
    detail: 'Final year BEng, University of Westminster · Graduating 2027',
  }),
  join(ROOT, 'src', 'app', 'opengraph-image.png')
);

await render(
  card({
    eyebrow: 'SELECTED WORK',
    title: 'Case studies',
    accent: 'Berktan Solmaz',
    detail: 'Graduate Software Engineer, London',
  }),
  join(OG_DIR, 'work.png')
);

for (const study of caseStudies) {
  await render(
    card({
      eyebrow: 'CASE STUDY',
      title: study.name,
      titleSize: titleSizeFor(study.name),
      /* Role and period rather than the tagline. Satori has no line clamp,
         and a truncated sentence on a shared card reads as a bug. This is
         metadata, so it always fits and never needs trimming. */
      detail: `${study.role} · ${study.period}`,
    }),
    join(OG_DIR, `${study.slug}.png`)
  );
}

console.log('Done.');
