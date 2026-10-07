import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { buildBreadcrumbGraph } from '@/lib/jsonld';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import CvSheet from '@/components/cv/CvSheet';
import Footer from '@/components/Footer';

/*
 * /cv is a destination, not a download.
 *
 * The QR code on Berktan's business card points here, so the route must render
 * the CV and nothing may start a file transfer on arrival: a stranger who
 * scans a card and gets a download prompt has learned nothing about him. The
 * PDF is one press away on the page instead.
 *
 * Indexed on purpose, unlike /tokyo and /semester. "Berktan Solmaz CV" is a
 * query a recruiter actually types, and this is the page that should answer it.
 */

export const metadata: Metadata = buildMetadata({
  title: 'CV',
  description:
    'CV of Yasin Berktan Solmaz, a final year BEng Software Engineering student in London graduating in 2027. Backend and full-stack work with Python, Java, Django and Next.js. Readable here, downloadable as a PDF.',
  path: '/cv',
  ogType: 'profile',
});

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'CV', path: '/cv' },
];

export default function CvPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbGraph(CRUMBS)} />

      <section className="pb-24 pt-28 sm:pt-36">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="cv-actions">
            <Breadcrumbs
              items={[{ label: 'Home', href: '/' }, { label: 'CV' }]}
            />
          </div>
          <div className="mt-8">
            <CvSheet />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
