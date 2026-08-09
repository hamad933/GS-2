import { HeroCopy } from '../components/hero/HeroCopy';
import { HeroNav } from '../components/hero/HeroNav';
import { StageTabs } from '../components/hero/StageTabs';
import { VisualStage } from '../components/hero/VisualStage';
import { SolutionFamiliesSection } from '../components/sections/SolutionFamiliesSection';
import { GoalBasedSection } from '../components/sections/GoalBasedSection';
import { CustomCompositionSection } from '../components/sections/CustomCompositionSection';
import { SelectedModelsSection } from '../components/sections/SelectedModelsSection';
import { HowWeWorkSection } from '../components/sections/HowWeWorkSection';
import { QualitySection } from '../components/sections/QualitySection';
import { CtaSection } from '../components/sections/CtaSection';
import { Footer } from '../components/footer/Footer';
import { useHeroCycle } from '../hooks/useHeroCycle';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

export function Home() {
  const reducedMotion = usePrefersReducedMotion();
  const hero = useHeroCycle(reducedMotion);

  return (
    <main
      dir="rtl"
      className="relative min-h-screen w-full overflow-hidden bg-mineral-50 text-navy-900">
      
      <div className="hero-ambient absolute inset-0" />
      <HeroNav />

      <div className="mx-auto max-w-[1500px]" id="hero">
        <StageTabs
          activeIndex={hero.index}
          onSelect={hero.goTo}
          onPause={hero.pause}
          onResume={hero.resume}
          progressKey={hero.progressKey}
          duration={hero.duration}
          paused={hero.paused}
          reducedMotion={reducedMotion} />
        

        <section className="relative grid items-center gap-9 px-0 pb-16 pt-5 lg:grid-cols-[0.68fr_1.32fr] lg:gap-8 lg:px-12 lg:pb-10 lg:pt-1">
          <HeroCopy
            stage={hero.stage}
            reducedMotion={reducedMotion}
            stageIndex={hero.index}
            onNextStage={() => hero.goTo(Math.min(3, hero.index + 1))}
            onPrevStage={() => hero.goTo(Math.max(0, hero.index - 1))}
          />
          <VisualStage stage={hero.stage} reducedMotion={reducedMotion} />
        </section>
      </div>

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
