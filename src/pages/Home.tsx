import { HeroNav } from '../components/hero/HeroNav';
import { LivingSystemHero } from '../components/hero/LivingSystemHero';
import { SolutionsUniverse } from '../components/sections/SolutionsUniverse';
import { ReferenceProof } from '../components/sections/ReferenceProof';
import { HowWeWorkSection } from '../components/sections/HowWeWorkSection';
import { QualitySection } from '../components/sections/QualitySection';
import { CtaSection } from '../components/sections/CtaSection';
import { Footer } from '../components/footer/Footer';

export function Home() {
  return (
    <main
      dir="rtl"
      className="relative min-h-screen w-full overflow-hidden bg-mineral-50 text-navy-900">
      
      <HeroNav />
      <LivingSystemHero />

      <SolutionsUniverse />
      <ReferenceProof />

      {/* Section 06: How We Work */}
      <HowWeWorkSection />

      {/* Section 07: Quality Pillars */}
      <QualitySection />

      {/* Section 08: Call to Action */}
      <CtaSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
