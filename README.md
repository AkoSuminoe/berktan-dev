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

Source code for **berktan.dev**, the personal developer portfolio of Yasin Berktan Solmaz, a BEng Software Engineering student at the University of Westminster, London (2024 to 2028).

Built with the Next.js App Router, React 19, TypeScript, Tailwind CSS v3 and Framer Motion. The design goal is a very dark, high-craft, "quiet luxury" aesthetic in the spirit of Apple, Linear and Raycast: near-black background, a single lavender accent, translucent glass surfaces, and carefully tuned motion.

> The site is not deployed yet. Run it locally with the instructions below.

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

If the three Spotify variables are absent, the widget renders nothing at all and the rest of the site works normally.

The refresh token needs two scopes: `user-read-currently-playing` and `user-read-recently-played`. Spotify credentials come from the [Spotify developer dashboard](https://developer.spotify.com/dashboard).

---

## Project Structure

```text
src/
  app/
    layout.tsx              root layout, fonts, ambient background layers, metadata
    page.tsx                home page composition
    globals.css             design tokens, glass surfaces, preloader, ambient field
    api/spotify/route.ts    server-only Spotify proxy
    tokyo/page.tsx          private sub-page
  components/
    Hero.tsx                landing hero with scroll-linked exit
    About.tsx
    SkillsMarquee.tsx       infinite CSS ticker of skills
    Experience.tsx          work history plus education
    Projects.tsx            Server Component, fetches GitHub repos
    ProjectsGrid.tsx        client-side sorting and the bento grid
    ProjectCard.tsx         individual repo card
    Contact.tsx             validated contact form (mailto)
    Footer.tsx
    FloatingDock.tsx        fixed bottom navigation dock
    MagneticDockItem.tsx    Apple-Dock style magnetic hover
    NowPlaying.tsx          Spotify widget
    Preloader.tsx           homepage intro veil
    SpotlightCursor.tsx     cursor-following light
    CinematicSection.tsx    scroll-linked section wrapper
    GlassCard.tsx           reusable glass surface
    DoomCard.tsx            DOOM easter egg
    Providers.tsx           Framer MotionConfig wrapper
    tokyo/                  components for the private sub-page
    ui/                     small shadcn-style primitives (button, card)
  hooks/
    useNowPlaying.ts        polling hook for the Spotify widget
  lib/
    github.ts               GitHub REST client, ISR cached
    spotify.ts              shared Spotify types and mappers
    url.ts                  URL sanitisation trust boundary
    site-config.ts          all personal content in one typed file
    tokyo-itinerary.ts      data for the private sub-page
    utils.ts                cn() class merge helper
public/
  doom.jsdos                self-hosted DOOM shareware bundle
```

---

## Configuration

All personal content lives in one typed file, `src/lib/site-config.ts`: name, bio, email, social links, work experience, education and the skills list. Everything else in the site reads from it, which makes it the single place to edit if you reuse the project.

---

## Available Scripts

| Script | Command |
| --- | --- |
| `npm run dev` | `next dev` |
| `npm run build` | `next build` |
| `npm run start` | `next start` |
| `npm run lint` | `next lint` |

---

## License

The source code in this repository is released under the [MIT License](LICENSE).

Two things the MIT grant does not cover:

- `public/doom.jsdos` is the 1993 DOOM shareware episode, which remains the property of id Software and is redistributed under its own shareware terms.
- The written content, biography and personal branding are not part of the code grant. If you reuse this project, replace `src/lib/site-config.ts` with your own details.
