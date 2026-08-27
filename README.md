<div align="center">

# berktan.dev

**Personal portfolio of Yasin Berktan Solmaz. Dark, high-craft, quiet luxury.**

![Next.js](https://img.shields.io/badge/Next.js-15.5.24-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-ff0055?logo=framer&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-a3e635)

</div>

---

## About

Source code for **berktan.dev**, the personal developer portfolio of Yasin Berktan Solmaz, a final year BEng Software Engineering student at the University of Westminster, London (2024 to 2027).

Built with the Next.js App Router, React 19, TypeScript, Tailwind CSS v3 and Framer Motion. The design goal is a very dark, high-craft, "quiet luxury" aesthetic in the spirit of Apple, Linear and Raycast: near-black background, a single lavender accent, translucent glass surfaces, and carefully tuned motion.

The site is self-hosted on a Node server behind a Cloudflare Tunnel rather than on a managed platform, so there are no platform-specific adapters or edge-only APIs anywhere in the codebase. See [Self-hosting](#self-hosting).

---

## Features

### Live GitHub Project Feed

- Async React Server Component fetches the GitHub REST API (`/users/{username}/repos`).
- Cached with Next.js ISR (`revalidate: 3600`, 1 hour).
- Forks and archived repos are filtered out; results sorted by star count.
- Section wrapped in a `<Suspense>` boundary so a slow GitHub response streams in without blocking the rest of the page.
- Client-side re-sorting between **Featured**, **Stars** and **Recent**.
- Repos tagged with the `featured` GitHub topic rank first.
- Cards render in an asymmetric bento grid.

### Spotify Now-Playing Widget

- Server-only route handler (`/api/spotify`) exchanges a refresh token for an access token and queries Spotify.
- Client hook `useNowPlaying` polls every 10 seconds **only while the browser tab is visible**.
- Each request uses an `AbortController`; failed polls keep the last good payload.
- Payload is a TypeScript discriminated union with four states: `unconfigured`, `idle`, `playing`, `recent`.
- Animated waveform in Spotify green when playing; neutral grey "Last played" label otherwise.
- Every failure path returns HTTP 200 with a degraded status. The widget is decorative and Spotify outages never surface as errors to visitors.

### Case Studies

- Curated case studies live at `/work` and `/work/{slug}`, each prerendered with `generateStaticParams`.
- `dynamicParams` is disabled, so an unknown slug returns 404 without rendering anything.
- Every page carries its own canonical URL, title, description, social card and structured data.
- The home page leads with the case study cards and filters any repo that already has one out of the live GitHub feed, so nothing appears twice saying less the second time.

### Search and Structured Data

- One metadata module builds every title, description, canonical URL, Open Graph block and Twitter card, so no route can drift from another.
- `ProfilePage` wrapping a `Person` on the home page, `BreadcrumbList` and `CreativeWork` on case studies, and `FAQPage` on the recruiter questions.
- FAQ structured data is generated from the same array the accordion renders, so a question can never be marked up with an answer the page does not display.
- `robots.ts` and `sitemap.ts` are generated from the same route list the pages use.
- Social cards are generated ahead of time by `npm run og` and committed as PNGs. See [Social cards](#social-cards) for why they are not a runtime route.

### Contact Pipeline

- `POST /api/contact` validates every field server side, independently of the browser, and size-caps the body before parsing it.
- A hidden honeypot field returns a plain success rather than announcing that it was detected.
- In-memory sliding-window rate limiting, five messages per hour per client, keyed on `cf-connecting-ip`.
- Delivery through Resend, with `Reply-To` set to the sender so a reply goes straight back to them.
- Missing credentials are a distinct state from a failed send, so the form can fall back to a prefilled `mailto:` instead of implying the message went somewhere.
- Success opens a real dialog: labelled, Escape to close, body scroll locked, focus moved in on open and returned to the submit button on close.

### Recruiter FAQ

- Availability, right to work, location, stack and process, answered on the page instead of by email.
- Accordion expansion uses `grid-template-rows` with an opacity fade, scoped to one subtree and driven only by an explicit press.
- Built as a button plus a labelled region with `aria-expanded` and `aria-controls`, and collapsed instantly under `prefers-reduced-motion`.

### Motion System

- **Preloader** is pure CSS (not Framer Motion) because it plays while React is hydrating. The wordmark "BERKTAN" animates letter by letter on a 44 ms stagger, then the veil recedes with a combined scale, blur and opacity dissolve.
- **`CinematicSection`** scroll-linked wrapper uses Framer motion values (`useScroll`, `useTransform`) so scrolling never triggers a React re-render.
- **`MagneticDockItem`** implements Apple-Dock magnetic hover: cursor position lives in a `useMotionValue` on the parent, item positions are measured once per hover session, and the effect is suppressed for non-mouse pointers and under reduced motion.
- **`SpotlightCursor`** paints its gradient once and moves it with `translate3d`, compositor-only, with writes coalesced to one per animation frame.

### Design System

- Colour tokens: `abyss #050506`, `surface #0e0e11` / `#131317`, text tiers `#f5f5f7` / `#9d9da7` / `#606069`, accent `glow #828fff` / `#5e6ad2`.
- Typography: Inter (variable) with Geist Mono for code.
- Four named easing curves shared between Tailwind and CSS custom properties: `out-strong`, `out-expo`, `in-out-strong`, `cinematic`.
- Surfaces avoid hard 1px borders. Layered inset shadows suggest a machined bezel instead.
- Background is a layered ambient field of drifting radial gradients, film grain and vignette.

### Accessibility and Performance

- Full `prefers-reduced-motion` support, plus `prefers-reduced-transparency` and `prefers-contrast` handling.
- Tailwind's `future.hoverOnlyWhenSupported` compiles every `hover:` utility behind `@media (hover: hover)`.
- Animations restricted to `transform`, `opacity` and `filter` (compositor-only).
- Server Components used wherever interactivity is not required.

### Security

- All secrets are server-only; no secret is ever prefixed with `NEXT_PUBLIC_`. The Spotify access token never leaves the route handler.
- `src/lib/url.ts` is a single trust boundary that sanitises every external URL. URLs arriving from third-party APIs are validated to `http:` or `https:` in the fetch layer, preventing a `javascript:` URL from being rendered into an `href`.
- The contact endpoint treats the browser as untrusted: types, lengths and the email pattern are all re-checked on the server, and provider errors are logged for the operator but returned to the client as a generic code, since they can name internal addresses and configuration.
- `cf-connecting-ip` is trusted for rate limiting **only** because the origin is reachable exclusively through the Cloudflare Tunnel. Exposing the port directly would let a client set that header freely and the limiter would need replacing.
- Analytics is cookieless, so the site sets nothing on a visitor's device and needs no consent banner. The Cloudflare beacon token is `NEXT_PUBLIC_` because it is a site identifier rather than a credential; no secret is ever given that prefix.

### DOOM Easter Egg

- `DoomCard.tsx` boots the 1993 DOOM shareware in the browser using the js-dos v8 emulator.
- The game bundle is self-hosted in `public/` and served same-origin, because the usual CDN sends no CORS headers.
- It downloads only when the visitor clicks to boot it.
- The modal locks body scroll and closes on Escape.

---

## Tech Stack

**Runtime dependencies**

| Package | Version |
| --- | --- |
| next | ^15.5.24 |
| react | ^19.2.8 |
| react-dom | ^19.2.8 |
| framer-motion | ^11.11.9 |
| lucide-react | ^0.468.0 |
| resend | ^6.24.0 |
| sharp | ^0.35.4 |
| @radix-ui/react-slot | ^1.3.3 |
| class-variance-authority | ^0.7.1 |
| clsx | ^2.1.1 |
| tailwind-merge | ^3.6.0 |

**Dev dependencies**

| Package | Version |
| --- | --- |
| typescript | ^5 |
| tailwindcss | ^3.4.16 |
| eslint | ^9 |
| eslint-config-next | ^15.5.24 |
| satori | ^0.33.4 |
| postcss | ^8.4.49 |
| autoprefixer | ^10.4.20 |
| @types/node | ^22 |
| @types/react | ^19.2.18 |
| @types/react-dom | ^19.2.5 |

This project uses **Tailwind CSS v3** (not v4) and the **App Router** (not the Pages Router).

---

## Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/AkoSuminoe/berktan-dev.git
cd berktan-dev
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.local.example .env.local
```

Fill in the values described in the table below.

**4. Run the development server**

```bash
npm run dev
```

Open <http://localhost:3000> in your browser.

---

## Environment Variables

Create a `.env.local` file in the project root. A `.env.local.example` is committed for reference.

| Variable | Required | Purpose |
| --- | --- | --- |
| `GITHUB_USERNAME` | Yes | Which account the project feed reads from |
| `GITHUB_TOKEN` | No | Raises the GitHub API rate limit from 60 to 5000 requests per hour |
| `SPOTIFY_CLIENT_ID` | No | Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | No | Spotify app client secret |
| `SPOTIFY_REFRESH_TOKEN` | No | OAuth refresh token |
| `RESEND_API_KEY` | No | Contact form delivery. Without it the endpoint reports `unconfigured` and the form falls back to `mailto:` |
| `CONTACT_FROM` | No | Sender address, for example `Portfolio <noreply@send.example.com>`. Required alongside `RESEND_API_KEY` |
| `CONTACT_TO` | No | Recipient. Defaults to the address in `site-config.ts` |
| `NEXT_PUBLIC_CF_BEACON_TOKEN` | No | Cloudflare Web Analytics. Absent means no beacon is rendered at all |

If the three Spotify variables are absent, the widget renders nothing at all and the rest of the site works normally.

`NEXT_PUBLIC_CF_BEACON_TOKEN` is read at **build** time, not at start time, because `NEXT_PUBLIC_` values are inlined into the output. Setting it before `npm start` without rebuilding leaves the beacon silently absent.

**If you configure Resend, verify a subdomain rather than the root domain.** A domain already using a mail router such as Cloudflare Email Routing publishes an SPF record at the root, and a second SPF `TXT` record on the same name is a permanent error that breaks inbound and outbound delivery at once. Verify something like `send.example.com`, send from there, and leave the root records untouched.

The refresh token needs two scopes: `user-read-currently-playing` and `user-read-recently-played`. Spotify credentials come from the [Spotify developer dashboard](https://developer.spotify.com/dashboard).

---

## Project Structure

```text
src/
  app/
    layout.tsx               root layout, fonts, ambient background layers, metadata
    page.tsx                 home page composition
    not-found.tsx            custom 404
    globals.css              design tokens, glass surfaces, preloader, ambient field
    robots.ts                generated robots.txt
    sitemap.ts               generated sitemap.xml
    opengraph-image.png      committed social card, picked up by file convention
    api/contact/route.ts     validated, rate-limited contact endpoint
    api/spotify/route.ts     server-only Spotify proxy
    work/page.tsx            case study index
    work/[slug]/page.tsx     individual case study
    privacy/page.tsx         privacy policy
    tokyo/page.tsx           private sub-page
  components/
    Hero.tsx                 landing hero with scroll-linked exit
    About.tsx
    SkillsMarquee.tsx        infinite CSS ticker of skills
    Experience.tsx           work history plus education
    Projects.tsx             Server Component, case studies plus GitHub feed
    ProjectsGrid.tsx         client-side sorting and the bento grid
    ProjectCard.tsx          individual repo card
    CaseStudyCard.tsx        shared card for the home page and /work
    Breadcrumbs.tsx          trail plus matching structured data
    Faq.tsx                  recruiter FAQ accordion
    Contact.tsx              contact form, posts to the API
    ContactSuccessModal.tsx  success dialog
    LondonTime.tsx           live London clock and coordinates
    MobileContactFab.tsx     mobile-only contact action
    SocialLinks.tsx          shared social link variants
    JsonLd.tsx               structured data emitter
    Analytics.tsx            Cloudflare Web Analytics beacon
    GodModeEgg.tsx           404 easter egg
    Footer.tsx
    FloatingDock.tsx         fixed bottom navigation dock
    MagneticDockItem.tsx     Apple-Dock style magnetic hover
    NowPlaying.tsx           Spotify widget
    Preloader.tsx            homepage intro veil
    SpotlightCursor.tsx      cursor-following light
    CinematicSection.tsx     scroll-linked section wrapper
    GlassCard.tsx            reusable glass surface
    DoomCard.tsx             DOOM easter egg
    Providers.tsx            Framer MotionConfig wrapper
    tokyo/                   components for the private sub-page
    ui/                      small shadcn-style primitives (button, card)
  hooks/
    useNowPlaying.ts         polling hook for the Spotify widget
  lib/
    github.ts                GitHub REST client, ISR cached
    spotify.ts               shared Spotify types and mappers
    url.ts                   URL sanitisation trust boundary
    seo.ts                   titles, descriptions, canonicals, keywords
    jsonld.ts                structured data builders and serialiser
    case-studies.ts          case study content
    faq.ts                   recruiter questions and answers
    site-config.ts           all personal content in one typed file
    tokyo-itinerary.ts       data for the private sub-page
    utils.ts                 cn() class merge helper
  assets/
    Inter-SemiBold.ttf       used only by the social card generator
scripts/
  generate-og.mjs            renders the committed social cards
public/
  og/                        generated social cards for /work and case studies
  doom.jsdos                 self-hosted DOOM shareware bundle
```

---

## Configuration

Personal content lives in typed data files rather than being scattered through components:

| File | Holds |
| --- | --- |
| `src/lib/site-config.ts` | Name, bio, email, location, social links, work experience, education, skills |
| `src/lib/case-studies.ts` | Case study copy. Adding an entry creates its route, its sitemap row and its social card |
| `src/lib/faq.ts` | Recruiter questions, which also become the `FAQPage` structured data |

`site-config.ts` is the origin for the canonical URL, the contact address and the schema, so changing an address there updates the Person schema, the social row, the form fallback and the API recipient at once.

Two fields ship as `null` on purpose. `cvUrl` gates the CV call to action, so the link cannot exist before the file does, and `responseTime` gates the reply-time note beside the form, so no promise is shown until there is one to make.

---

## Self-hosting

The deployment target is a plain Node server, not a managed platform:

```bash
npm ci
npm run build
npm start
```

`next.config.js` is configured for that. `X-Powered-By` is removed, four security response headers are set, and the optimised-image cache TTL is raised from the 60 second default to seven days so a small origin is not re-optimising the same remote images all day. HSTS is deliberately left to the CDN, where it can be switched off again, rather than baked into origin responses where a browser caches it for the full `max-age`.

`sharp` is a runtime dependency because self-hosted image optimisation requires it.

### Social cards

Cards are generated by `npm run og` and committed, rather than rendered by an `opengraph-image.tsx` route. `next/og` is unusable on Windows in Next 15: its bundled loader calls `path.join()` on `import.meta.url`, which rewrites the `file://` separators, and the `fileURLToPath()` that follows throws `Invalid URL`, failing the build. Pre-generating removes the runtime dependency entirely, and the generator reads the case study list directly, so a new entry produces its card without the script being touched.

Run `npm run og` after changing a name, a title or a case study, then commit the result.

---

## Available Scripts

| Script | Command |
| --- | --- |
| `npm run dev` | `next dev` |
| `npm run build` | `next build` |
| `npm run start` | `next start` |
| `npm run lint` | `next lint` |
| `npm run og` | `node scripts/generate-og.mjs` |

---

## License

The source code in this repository is released under the [MIT License](LICENSE).

Two things the MIT grant does not cover:

- `public/doom.jsdos` is the 1993 DOOM shareware episode, which remains the property of id Software and is redistributed under its own shareware terms.
- The written content, biography and personal branding are not part of the code grant. If you reuse this project, replace `src/lib/site-config.ts` with your own details.
