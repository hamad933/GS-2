import { HeroNav } from '../components/hero/HeroNav';
import { LivingSystemHero } from '../components/hero/LivingSystemHero';
import { SolutionFamiliesSection } from '../components/sections/SolutionFamiliesSection';
import { GoalBasedSection } from '../components/sections/GoalBasedSection';
import { CustomCompositionSection } from '../components/sections/CustomCompositionSection';
import { SelectedModelsSection } from '../components/sections/SelectedModelsSection';
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

      {/* Section 02: Solution Families */}
      <SolutionFamiliesSection />

      {/* Section 03: Goal-based Selection */}
      <GoalBasedSection />

      {/* Section 04: Custom Composition */}
      <CustomCompositionSection />

      {/* Section 05: Selected Models */}
      <SelectedModelsSection />

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
