import type { Metadata } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import './globals.css';
import FloatingDock from '@/components/FloatingDock';
import SpotlightCursor from '@/components/SpotlightCursor';
import Providers from '@/components/Providers';
import Preloader from '@/components/Preloader';
import NowPlaying from '@/components/NowPlaying';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://berktan.dev'),
  title: 'Berktan Solmaz | Software Engineer',
  description:
    'Portfolio of Berktan Solmaz, a software engineering student in London building refined, modern web applications.',
  openGraph: {
    title: 'Berktan Solmaz | Software Engineer',
    description:
      'Portfolio of Berktan Solmaz, a software engineering student in London building refined, modern web applications.',
    type: 'website',
    url: 'https://berktan.dev',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans grain`}
        suppressHydrationWarning
      >
        {/* Layered ambient field: three drifting orb layers, a lamp at the
            horizon, then a vignette that grounds the corners */}
        <div aria-hidden className="ambient ambient-a" />
        <div aria-hidden className="ambient ambient-b" />
        <div aria-hidden className="ambient ambient-c" />
        <div aria-hidden className="ambient-horizon" />
        <div aria-hidden className="ambient-vignette" />
        {/* Engineering column guides marking the content container edges */}
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 hidden xl:block">
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-[36rem] bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
          <div className="absolute inset-y-0 left-1/2 w-px translate-x-[36rem] bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
        </div>
        <SpotlightCursor />
        <Providers>
          <Preloader />
          <NowPlaying />
          <main className="relative z-10">{children}</main>
          <FloatingDock />
        </Providers>
      </body>
    </html>
  );
}
