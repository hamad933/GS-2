import { HeroNav } from '../components/hero/HeroNav';
import { LivingSystemHero } from '../components/hero/LivingSystemHero';
import { SolutionsUniverse } from '../components/sections/SolutionsUniverse';
import { ReferenceProof } from '../components/sections/ReferenceProof';
import { SystemAnatomy } from '../components/sections/SystemAnatomy';
import { ProjectGateway } from '../components/sections/ProjectGateway';
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

      <SystemAnatomy />
      <ProjectGateway />

      {/* Footer */}
      <Footer />
    </main>
  );
}
