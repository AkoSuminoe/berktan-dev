import { siteConfig } from '@/lib/site-config';

export default function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-12 sm:flex-row sm:px-6">
        <p className="text-sm text-ink-faint">
          © {new Date().getFullYear()} {siteConfig.fullName} · London
        </p>
        <div className="flex items-center gap-5">
          {siteConfig.socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-faint transition-colors duration-300 hover:text-ink"
              aria-label={link.label}
            >
              <link.icon className="h-4 w-4" strokeWidth={1.5} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
