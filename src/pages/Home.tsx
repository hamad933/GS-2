import { LivingSystemHero } from '../components/hero/LivingSystemHero';
import { SolutionsUniverse } from '../components/sections/SolutionsUniverse';
import { ReferenceProof } from '../components/sections/ReferenceProof';
import { SystemAnatomy } from '../components/sections/SystemAnatomy';
import { ProjectGateway } from '../components/sections/ProjectGateway';

export function Home() {
  return (
    <div
      dir="rtl"
      className="gs-home relative min-h-screen w-full overflow-hidden bg-mineral-50 text-navy-900">
      <LivingSystemHero />

      <SolutionsUniverse />
      <ReferenceProof />

      <SystemAnatomy />
      <ProjectGateway />
    </div>
  );
}
