import { useState } from 'react';
import { ArrowDownLeft, MoveLeft } from 'lucide-react';
import { solutionFamilies } from '../../data/homeShowcase';
import solutionsEnvironment from '../../assets/gs-w05/GS_A02_Solutions_Universe_Core.png';

export function SolutionsUniverse() {
  const [activeId, setActiveId] = useState(solutionFamilies[0].id);
  const active = solutionFamilies.find((family) => family.id === activeId) ?? solutionFamilies[0];

  return (
    <section id="solutions-universe" className="solutions-universe" aria-labelledby="solutions-title" data-active={active.id}>
      <img className="production-environment solutions-environment" src={solutionsEnvironment} alt="" aria-hidden="true" loading="lazy" />
      <div className="universe-heading">
        <p><span>02</span> عالم الحلول</p>
        <h2 id="solutions-title">كل احتياج يفتح<br />مسارًا مختلفًا.</h2>
        <div className="universe-intro">اختر مجالًا لتكشف مساره داخل المنظومة.<ArrowDownLeft aria-hidden="true" /></div>
      </div>

      <div className="universe-field">
        <div className="family-branches" role="group" aria-label="عائلات الحلول الست">
          {solutionFamilies.map((family, index) => {
            const selected = family.id === active.id;
            return (
              <button key={family.id} type="button" className={`family-branch branch-${index + 1}`} aria-pressed={selected}
                onPointerEnter={() => setActiveId(family.id)} onFocus={() => setActiveId(family.id)} onClick={() => setActiveId(family.id)}>
                <i>0{index + 1}</i><span><strong>{family.title}</strong><small>{family.cue}</small></span><MoveLeft aria-hidden="true" />
              </button>
            );
          })}
        </div>
        <div className="family-reveal" aria-live="polite">
          <span>المسار المختار</span><h3>{active.title}</h3><p>{active.description}</p>
          <button className="family-cta" type="button">استكشف الحل <MoveLeft aria-hidden="true" /></button>
        </div>
      </div>
      <div className="universe-convergence" aria-hidden="true"><i /><i /><i /><span>من الإمكانية إلى صورةٍ قابلة للرؤية</span></div>
    </section>
  );
}
