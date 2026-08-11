import { useState, type CSSProperties, type KeyboardEvent } from 'react';
import { solutionFamilies } from '../../data/homeShowcase';
import solutionsEnvironment from '../../assets/gs-home-v2/02_GS_Solutions_Universe_Clean_Production_Asset.webp';
import './SolutionsUniverse.v2.css';

const stationGeometry = [
  { x: 22.1, y: 34.7, copyX: 22, copyY: -72 },
  { x: 7.8, y: 56.1, copyX: 26, copyY: -70 },
  { x: 14.2, y: 80.1, copyX: 24, copyY: -75 },
  { x: 47.9, y: 79.9, copyX: 24, copyY: -75 },
  { x: 61.6, y: 57.2, copyX: -188, copyY: -73 },
  { x: 45.2, y: 34.8, copyX: 24, copyY: -72 },
] as const;

const connectorPaths = [
  'M319 260 C287 235 258 212 226 199',
  'M279 350 C216 347 150 333 80 320',
  'M320 403 C264 420 204 442 145 458',
  'M444 405 C463 426 479 443 490 458',
  'M500 347 C548 345 588 335 630 328',
  'M448 258 C454 236 458 217 463 199',
] as const;

function StationGlyph({ index }: { index: number }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {index === 0 && <g {...common}><path d="M4 10h16v9H4zM3 10l2.4-5h13.2L21 10M8 19v-5h4v5M5 10c0 1 1 2 2 2s2-1 2-2c0 1 1 2 2 2s2-1 2-2c0 1 1 2 2 2s2-1 2-2c0 1 1 2 2 2s2-1 2-2" /></g>}
      {index === 1 && <g {...common}><path d="M4 5h2l2.1 9h8.8l2-6H7M10 18.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM19 18.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></g>}
      {index === 2 && <g {...common}><rect x="4" y="6" width="16" height="14" rx="1" /><path d="M8 4v4M16 4v4M4 10h16M8 14h2M14 14h2M8 17h2" /></g>}
      {index === 3 && <g {...common}><path d="M5 20V8l7-4v16M12 9h7v11M8 9h1M8 12h1M8 15h1M15 12h1M15 15h1M4 20h16" /></g>}
      {index === 4 && <g {...common}><circle cx="12" cy="12" r="3" /><path d="m12 3 1.2 2.3 2.5.7 2.1-1.3 1.5 1.5L18 8.3l.7 2.5L21 12l-2.3 1.2-.7 2.5 1.3 2.1-1.5 1.5-2.1-1.3-2.5.7L12 21l-1.2-2.3-2.5-.7-2.1 1.3-1.5-1.5L6 15.7l-.7-2.5L3 12l2.3-1.2L6 8.3 4.7 6.2l1.5-1.5L8.3 6l2.5-.7Z" /></g>}
      {index === 5 && <g {...common}><path d="M4 5.5c3.3-.8 5.9-.2 8 1.7v12c-2.1-1.9-4.7-2.5-8-1.7ZM20 5.5c-3.3-.8-5.9-.2-8 1.7v12c2.1-1.9 4.7-2.5 8-1.7Z" /></g>}
    </svg>
  );
}

export function SolutionsUniverse() {
  const [activeId, setActiveId] = useState(solutionFamilies[4].id);
  const activeIndex = Math.max(0, solutionFamilies.findIndex((family) => family.id === activeId));
  const active = solutionFamilies[activeIndex];

  const moveSelection = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = (index + direction + solutionFamilies.length) % solutionFamilies.length;
    setActiveId(solutionFamilies[nextIndex].id);
    document.getElementById(`solution-station-${solutionFamilies[nextIndex].id}`)?.focus();
  };

  return (
    <section
      id="solutions-universe"
      className="solutions-universe solutions-universe--v2"
      aria-labelledby="solutions-title"
      data-active={active.id}
      dir="rtl"
    >
      <img
        className="solutions-v2__environment"
        src={solutionsEnvironment}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
      />

      <div className="solutions-v2__field" aria-hidden="true">
        <svg className="solutions-v2__connectors" viewBox="0 0 1024 572" preserveAspectRatio="none">
          <defs>
            <filter id="solution-path-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="solution-active-path" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#8a6840" stopOpacity="0.1" />
              <stop offset="0.54" stopColor="#f6d59c" />
              <stop offset="1" stopColor="#fff0c9" />
            </linearGradient>
          </defs>
          {connectorPaths.map((path, index) => (
            <g key={path} className={index === activeIndex ? 'is-active' : undefined}>
              <path className="solutions-v2__path-base" d={path} />
              <path className="solutions-v2__path-active" d={path} pathLength="1" />
            </g>
          ))}
        </svg>
        <div className="solutions-v2__core-signal" />
      </div>

      <div className="solutions-v2__stations" role="group" aria-label="عائلات الحلول الست">
        {solutionFamilies.map((family, index) => {
          const selected = family.id === active.id;
          const geometry = stationGeometry[index];
          const stationStyle = {
            '--station-x': `${geometry.x}%`,
            '--station-y': `${geometry.y}%`,
            '--copy-x': `${geometry.copyX}px`,
            '--copy-y': `${geometry.copyY}px`,
          } as CSSProperties;

          return (
            <button
              id={`solution-station-${family.id}`}
              key={family.id}
              type="button"
              className={`solutions-v2__station solutions-v2__station--${index + 1}`}
              style={stationStyle}
              aria-pressed={selected}
              aria-controls="solutions-active-family"
              onPointerEnter={() => setActiveId(family.id)}
              onFocus={() => setActiveId(family.id)}
              onClick={() => setActiveId(family.id)}
              onKeyDown={(event) => moveSelection(event, index)}
            >
              <span className="solutions-v2__station-node">
                <span className="solutions-v2__station-glyph"><StationGlyph index={index} /></span>
              </span>
              <span className="solutions-v2__station-copy">
                <span className="solutions-v2__station-index" dir="ltr">0{index + 1}</span>
                <strong>{family.title}</strong>
                <small>{family.cue}</small>
              </span>
            </button>
          );
        })}
      </div>

      <div className="solutions-v2__narrative">
        <header className="solutions-v2__heading">
          <p className="solutions-v2__eyebrow"><span dir="ltr">02</span> عالم الحلول</p>
          <h2 id="solutions-title">كل احتياج يفتح<br />مسارًا مختلفًا.</h2>
          <p className="solutions-v2__intro">اختر مجالًا لتكشف مساره داخل منظومة مترابطة، تبدأ من وضوح الاحتياج وتنتهي بتجربة قابلة للاستخدام.</p>
        </header>

        <article id="solutions-active-family" className="solutions-v2__active" aria-live="polite">
          <div className="solutions-v2__active-kicker">
            <span>المسار المحدد</span>
            <span dir="ltr">0{activeIndex + 1} / 06</span>
          </div>
          <h3>{active.title}</h3>
          <p>{active.description}</p>
          <div className="solutions-v2__active-cue">
            <StationGlyph index={activeIndex} />
            <span>{active.cue}</span>
          </div>
        </article>
      </div>

      <div className="solutions-v2__outcomes" aria-label={`نتائج ${active.title}`} aria-live="polite">
        <div className="solutions-v2__outcomes-lead">
          <span>المسار النشط</span>
          <strong>{active.title}</strong>
        </div>
        <ul>
          {active.outcomes.map((outcome, index) => (
            <li key={outcome}><span dir="ltr">0{index + 1}</span>{outcome}</li>
          ))}
        </ul>
        <p>ست عائلات مترابطة،<br /><strong>ونواة واحدة واضحة.</strong></p>
      </div>
    </section>
  );
}
