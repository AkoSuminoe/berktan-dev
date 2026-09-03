import type { Metadata } from 'next';
import TokyoPlanner from '@/components/tokyo/TokyoPlanner';
import TokyoPreloader from '@/components/tokyo/TokyoPreloader';
import SakuraField from '@/components/tokyo/SakuraField';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Tokyo | Berktan Solmaz',
  description:
    'Westminster Working Cultures Tokyo itinerary, 5 to 12 September 2026.',
  robots: { index: false, follow: false },
};

export default function TokyoPage() {
  return (
    <>
      {/* Behind everything on this route: main is `relative z-10`, so a
          negative z-index here sits under the page content but still above the
          global ambient layers, which live at z-0 on the root. */}
      <SakuraField />
      {/* One line, centred, once per session. The veil is a fixed, non
          scrolling layer built to hold exactly that much: putting a column of
          cards inside it is what made the entry screen overflow a phone. */}
      <TokyoPreloader />
      <TokyoPlanner />
      <Footer />
    </>
  );
}
