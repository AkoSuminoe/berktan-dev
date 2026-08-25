import { Suspense } from 'react';
import Hero from '@/components/Hero';
import About from '@/components/About';
import SkillsMarquee from '@/components/SkillsMarquee';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import CinematicSection from '@/components/CinematicSection';

export default function Home() {
  return (
    <>
      <Hero />
      <CinematicSection>
        <About />
      </CinematicSection>
      <CinematicSection>
        <SkillsMarquee />
      </CinematicSection>
      <CinematicSection>
        <Experience />
      </CinematicSection>
      <CinematicSection>
        <Suspense fallback={<ProjectsSkeleton />}>
          <Projects />
        </Suspense>
      </CinematicSection>
      <CinematicSection>
        <Contact />
      </CinematicSection>
      <Footer />
    </>
  );
}

function ProjectsSkeleton() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`bezel h-56 animate-pulse ${
                i === 0 || i === 3 ? 'lg:col-span-2' : ''
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
