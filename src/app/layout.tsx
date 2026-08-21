import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import FloatingDock from '@/components/FloatingDock';
import SpotlightCursor from '@/components/SpotlightCursor';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Berktan | Developer',
  description:
    'Personal portfolio of Berktan — a developer building modern web experiences.',
  openGraph: {
    title: 'Berktan | Developer',
    description:
      'Personal portfolio of Berktan — a developer building modern web experiences.',
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
      <body className={`${inter.variable} font-sans grain`}>
        <SpotlightCursor />
        <main className="relative">{children}</main>
        <FloatingDock />
      </body>
    </html>
  );
}
