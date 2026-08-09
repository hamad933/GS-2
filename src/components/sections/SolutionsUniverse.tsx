import { useState } from 'react';
import { ArrowDownLeft, MoveLeft } from 'lucide-react';
import { solutionFamilies } from '../../data/homeShowcase';

export function SolutionsUniverse() {
  const [activeId, setActiveId] = useState(solutionFamilies[0].id);
  const active = solutionFamilies.find((family) => family.id === activeId) ?? solutionFamilies[0];

  return (
    <section id="solutions-universe" className="solutions-universe" aria-labelledby="solutions-title" data-active={active.id}>
      <div className="universe-heading">
        <p><span>02</span> فضاء الحلول</p>
        <h2 id="solutions-title">ستة مسارات.<br />نظام واحد يتشكّل حول احتياجك.</h2>
        <div className="universe-intro">اختر مساراً لترى ما يصبح واضحاً داخله.<ArrowDownLeft aria-hidden="true" /></div>
      </div>

      <div className="universe-field">
        <svg className="universe-lines" viewBox="0 0 1000 610" preserveAspectRatio="none" aria-hidden="true">
          <path d="M84 84 C295 84 315 288 500 305" /><path d="M86 250 C285 250 326 292 500 305" />
          <path d="M100 504 C290 504 335 336 500 305" /><path d="M916 80 C700 80 694 277 500 305" />
          <path d="M920 270 C720 270 670 295 500 305" /><path d="M900 515 C700 515 680 337 500 305" />
          <circle cx="500" cy="305" r="8" /><circle cx="500" cy="305" r="28" />
        </svg>
        <div className="universe-core" aria-hidden="true"><span>GS</span><small>نقطة الالتقاء</small></div>
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
          <ul>{active.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
        </div>
      </div>
      <div className="universe-convergence" aria-hidden="true"><i /><i /><i /><span>من الإمكانية إلى صورةٍ قابلة للرؤية</span></div>
    </section>
  );
}
