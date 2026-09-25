import type { Metadata } from 'next';
import SemesterPlanner from '@/components/semester/SemesterPlanner';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Dönem planı | Berktan Solmaz',
  description:
    'Final year Semester 1 plan, 21 September 2026 to 15 January 2027.',
  // Personal planning tool, same posture as /tokyo: reachable, not indexed.
  robots: { index: false, follow: false },
};

export default function SemesterPage() {
  return (
    <>
      <SemesterPlanner />
      <Footer />
    </>
  );
}
