import { ArrowUpRight, Download, Github, Linkedin, Mail, MapPin } from 'lucide-react';
import { cv } from '@/lib/cv';

/*
 * The CV, rendered as a page rather than offered as a file.
 *
 * A QR code on a business card lands here, so nothing may auto-download: the
 * first thing someone sees has to be the CV itself, readable on the phone they
 * scanned it with. The PDF is one press away and never a redirect.
 *
 * Server component, zero client JS. Everything here is text, links and one
 * anchor carrying `download`. The only motion on the page is the bezel hover
 * that `.bezel` already owns in CSS.
 *
 * Layout is an editorial two-column on lg: a sticky label rail on the left,
 * the content on the right. On a phone the label simply sits above its
 * section, which is the same reading order without the rail.
 */

const ICONS = { LinkedIn: Linkedin, GitHub: Github } as const;

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 border-t border-white/[0.06] py-8 first:border-t-0 first:pt-0 lg:grid-cols-[8.5rem_1fr] lg:gap-10">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint lg:sticky lg:top-24 lg:self-start">
        {label}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/** Bulleted line. The marker is a hairline rule, not a glyph: the site has no
 *  disc bullets anywhere else and a dash would break Hard Rule 5. */
function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="relative pl-5 text-sm leading-relaxed text-ink-dim">
      <span
        aria-hidden
        className="absolute left-0 top-[0.65em] h-px w-2.5 bg-white/20"
      />
      {children}
    </li>
  );
}

export default function CvSheet() {
  return (
    <div className="cv-sheet">
      {/* ------------------------------------------------------------ header */}
      <h1 className="text-4xl font-semibold leading-[1.04] tracking-tighter text-ink sm:text-5xl lg:text-6xl">
        {cv.name}.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-dim sm:text-lg">
        {cv.headline}
      </p>

      {/* Contact rail. Mono, because it is metadata rather than prose. */}
      <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 font-mono text-xs text-ink-faint">
        <li className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
          {cv.location}
        </li>
        <li>
          <a
            href={`mailto:${cv.email}`}
            className="flex items-center gap-2 transition-colors duration-[280ms] ease-out-strong hover:text-ink"
          >
            <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
            {cv.email}
          </a>
        </li>
        {cv.links.map((link) => {
          const Icon = ICONS[link.label as keyof typeof ICONS];
          return (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer me"
                className="flex items-center gap-2 transition-colors duration-[280ms] ease-out-strong hover:text-ink"
              >
                {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />}
                {link.display ?? link.label}
              </a>
            </li>
          );
        })}
      </ul>

      {/* Actions. Primary pill grammar, copied from the Hero CTA: the arrow
          lives in a nested circle that travels on hover. */}
      <div className="cv-actions mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
        <a
          href={cv.pdfPath}
          download
          className="group inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-sm font-medium text-abyss transition-transform duration-[280ms] ease-out-strong hover:scale-[1.025] active:scale-[0.975] active:duration-[120ms] motion-reduce:transform-none"
        >
          Download the PDF
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-abyss/10 transition-transform duration-[280ms] ease-out-strong group-hover:translate-y-px motion-reduce:transform-none">
            <Download className="h-4 w-4" strokeWidth={1.5} />
          </span>
        </a>
        <a
          href={cv.pdfPath}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 text-sm font-medium text-ink-dim transition-colors duration-[280ms] ease-out-strong hover:text-ink"
        >
          Open it in a new tab
          <ArrowUpRight
            className="h-4 w-4 transition-transform duration-[280ms] ease-out-strong group-hover:-translate-y-px group-hover:translate-x-px motion-reduce:transform-none"
            strokeWidth={1.5}
          />
        </a>
        <p className="font-mono text-xs text-ink-faint">
          {cv.pdfMeta} · updated {cv.updated}
        </p>
      </div>

      {/* ------------------------------------------------------------- sheet */}
      <div className="bezel mt-12">
        <div className="bezel-core px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
          <Section label="Summary">
            <p className="max-w-[72ch] text-sm leading-relaxed text-ink-dim">
              {cv.summary}
            </p>
          </Section>

          <Section label="Skills">
            <dl className="space-y-5">
              {cv.skills.map((group) => (
                <div key={group.label}>
                  <dt className="text-xs font-medium text-ink">{group.label}</dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-ink-dim shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
                      >
                        {item}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section label="Experience">
            <ol className="space-y-9">
              {cv.experience.map((role) => (
                <li key={role.id}>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-base font-medium tracking-tight text-ink">
                      {role.role}
                    </h3>
                    {role.current && (
                      <span className="flex items-center gap-1.5 font-mono text-[11px] text-glow">
                        <span
                          aria-hidden
                          className="status-dot h-1.5 w-1.5 rounded-full bg-glow"
                        />
                        current
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-mono text-xs text-ink-faint">
                    {role.company} · {role.location} · {role.period}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {role.bullets.map((bullet) => (
                      <Bullet key={bullet}>{bullet}</Bullet>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </Section>

          <Section label="Projects">
            <ul className="space-y-7">
              {cv.projects.map((project) => (
                <li key={project.id}>
                  <h3 className="text-base font-medium tracking-tight text-ink">
                    {project.name}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-ink-faint">
                    {project.stack}
                  </p>
                  <p className="mt-2 max-w-[72ch] text-sm leading-relaxed text-ink-dim">
                    {project.blurb}
                  </p>
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group mt-2 inline-flex items-center gap-1.5 font-mono text-xs text-ink-faint transition-colors duration-[280ms] ease-out-strong hover:text-ink-dim"
                    >
                      {project.repo.replace('https://', '')}
                      <ArrowUpRight
                        className="h-3 w-3 transition-transform duration-[280ms] ease-out-strong group-hover:-translate-y-px group-hover:translate-x-px motion-reduce:transform-none"
                        strokeWidth={1.5}
                      />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </Section>

          <Section label="Education">
            <h3 className="text-base font-medium tracking-tight text-ink">
              {cv.education.degree}
            </h3>
            <p className="mt-1 font-mono text-xs text-ink-faint">
              {cv.education.university} · {cv.education.period}
            </p>
            <ul className="mt-4 space-y-2">
              {cv.education.lines.map((line) => (
                <Bullet key={line}>{line}</Bullet>
              ))}
            </ul>
          </Section>

          <Section label="Interests">
            <p className="text-sm leading-relaxed text-ink-dim">{cv.interests}</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
