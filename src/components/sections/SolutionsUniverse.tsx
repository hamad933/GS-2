import { useState } from 'react';
import { solutionFamilies } from '../../data/homeShowcase';
import solutionsEnvironment from '../../assets/gs-home-v2/02_GS_Solutions_Universe_Clean_Production_Asset.webp';
import './SolutionsUniverse.v2.css';

type GlyphProps = {
  familyId: string;
};

function FamilyGlyph({ familyId }: GlyphProps) {
  const common = {
    viewBox: '0 0 48 48',
    fill: 'none',
    'aria-hidden': true,
  } as const;

  if (familyId === 'business') {
    return <svg {...common}><path d="M11 38V14l13-6 13 6v24M17 20h4m6 0h4m-14 7h4m6 0h4M9 38h30" /><path d="M21 38v-6h6v6" /></svg>;
  }

  if (familyId === 'commerce') {
    return <svg {...common}><path d="M10 16h5l3 19h18l3-14H17M21 16a4 4 0 0 1 8 0" /><circle cx="22" cy="39" r="2" /><circle cx="34" cy="39" r="2" /></svg>;
  }

  if (familyId === 'booking') {
    return <svg {...common}><rect x="10" y="13" width="28" height="26" rx="2" /><path d="M10 21h28M17 9v8m14-8v8M17 27h4m6 0h4m-14 6h4m6 0h4" /></svg>;
  }

  if (familyId === 'assets') {
    return <svg {...common}><path d="M9 39h30M13 39V22h8v17m6 0V12h8v27M16 27h2m-2 5h2m14-14h2m-2 6h2m-2 6h2" /><path d="m11 22 6-5 6 5" /></svg>;
  }

  if (familyId === 'portals') {
    return <svg {...common}><path d="m24 8 4 5 6-1 1 6 5 3-3 6 1 6-6 1-3 5-5-4-6 3-2-6-6-2 2-6-2-5 6-3 1-6 6 1z" /><circle cx="24" cy="24" r="6" /></svg>;
  }

  return <svg {...common}><path d="M9 13h12c3 0 5 2 5 5v22c0-3-2-5-5-5H9zM39 13H27v27c0-3 2-5 5-5h7z" /><path d="M14 20h7m-7 6h7m12-6h-3m3 6h-3" /></svg>;
}

function DirectionArrow() {
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M16 10H4m5-5-5 5 5 5" /></svg>;
}

export function SolutionsUniverse() {
  const [activeId, setActiveId] = useState(solutionFamilies[0].id);
  const activeIndex = Math.max(0, solutionFamilies.findIndex((family) => family.id === activeId));
  const active = solutionFamilies[activeIndex];

  const activateNext = () => {
    setActiveId(solutionFamilies[(activeIndex + 1) % solutionFamilies.length].id);
  };

  return (
    <section
      id="solutions-universe"
      className="solutions-universe s02-universe"
      aria-labelledby="solutions-title"
      data-active={active.id}
    >
      <img
        className="s02-environment"
        src={solutionsEnvironment}
        alt=""
        aria-hidden="true"
        loading="lazy"
      />

      <div className="s02-segment-band" aria-hidden="true">
        <span className="is-current"><b>0{activeIndex + 1}</b> العائلة المختارة</span>
        <span>مسار متصل</span>
        <span>مخرجات واضحة</span>
      </div>

      <div className="s02-architecture" aria-label="اختر إحدى عائلات الحلول الست">
        <svg className="s02-connectors" viewBox="0 0 700 760" preserveAspectRatio="none" aria-hidden="true">
          <path className={`s02-connector ${activeIndex === 0 ? 'is-active' : ''}`} d="M350 390 C300 330 260 276 210 238" />
          <path className={`s02-connector ${activeIndex === 1 ? 'is-active' : ''}`} d="M350 390 C270 390 150 390 67 382" />
          <path className={`s02-connector ${activeIndex === 2 ? 'is-active' : ''}`} d="M350 390 C292 472 230 534 150 574" />
          <path className={`s02-connector ${activeIndex === 3 ? 'is-active' : ''}`} d="M350 390 C402 493 440 548 500 598" />
          <path className={`s02-connector ${activeIndex === 4 ? 'is-active' : ''}`} d="M350 390 C438 398 522 403 606 400" />
          <path className={`s02-connector ${activeIndex === 5 ? 'is-active' : ''}`} d="M350 390 C408 320 430 272 475 234" />
          <circle className="s02-core-signal" cx="350" cy="390" r="8" />
        </svg>

        <div className="s02-core-label" aria-hidden="true">
          <span>GS</span>
          <small>نواة الحلول</small>
        </div>

        <div className="s02-stations" role="group" aria-label="عائلات الحلول الست">
          {solutionFamilies.map((family, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={family.id}
                type="button"
                className={`s02-station s02-station-${index + 1}`}
                aria-pressed={selected}
                aria-controls="s02-family-detail"
                onPointerEnter={() => setActiveId(family.id)}
                onFocus={() => setActiveId(family.id)}
                onClick={() => setActiveId(family.id)}
              >
                <span className="s02-station-copy">
                  <span className="s02-station-index">0{index + 1}</span>
                  <strong>{family.title}</strong>
                  <small>{family.cue}<br />{family.outcomes[0]}</small>
                </span>
                <span className="s02-station-node" aria-hidden="true">
                  <span className="s02-station-glyph"><FamilyGlyph familyId={family.id} /></span>
                  <i />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="s02-narrative">
        <div className="s02-eyebrow"><i /> <span>02</span> عالم الحلول</div>
        <h2 id="solutions-title">حلول مترابطة<br />تنطلق من نواة واحدة.</h2>
        <p className="s02-intro">ست عائلات تنظّم الاحتياج في مسارات واضحة، وتصل الحضور الرقمي بالخدمة والتشغيل والمعرفة.</p>

        <div id="s02-family-detail" className="s02-family-detail" aria-live="polite" aria-atomic="true">
          <div className="s02-selected-label"><span>العائلة المختارة</span><b>0{activeIndex + 1} / 06</b></div>
          <h3>{active.title}</h3>
          <p>{active.description}</p>
          <ul>
            {active.outcomes.map((outcome, index) => (
              <li key={outcome}>
                <span className="s02-outcome-icon" aria-hidden="true"><i /><b>0{index + 1}</b></span>
                <span><small>محور المسار</small><strong>{outcome}</strong></span>
              </li>
            ))}
          </ul>
        </div>

        <div className="s02-actions">
          <a href="#reference-proof">استعرض المشاريع المرجعية <DirectionArrow /></a>
          <button type="button" onClick={activateNext}>العائلة التالية <DirectionArrow /></button>
        </div>
        <p className="s02-context-cue"><span /> اختر محطة أخرى لتعيد المنظومة ترتيب مسارها.</p>
      </div>

      <div className="s02-continuity" aria-live="polite">
        <div className="s02-continuity-title">
          <span>ست عائلات مترابطة</span>
          <strong>{active.title}</strong>
        </div>
        <div className="s02-continuity-outcomes">
          {active.outcomes.map((outcome, index) => (
            <span key={outcome}><i>0{index + 1}</i>{outcome}</span>
          ))}
        </div>
        <div className="s02-continuity-mark" aria-hidden="true"><i /><i /><i /></div>
      </div>
    </section>
  );
}
