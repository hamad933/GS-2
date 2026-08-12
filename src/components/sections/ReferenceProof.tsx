import { useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { ProjectMedia } from '../project/ProjectMedia';
import { referenceProjects, type ReferenceProject } from '../../data/homeShowcase';
import theatreEnvironment from '../../assets/gs-home-v2/03_GS_Selected_Work_Clean_Production_Asset.webp';
import './ReferenceProof.v2.css';

type SurfaceVariant = 'desktop' | 'mobile' | 'detail';

function NeutralProjectSurface({ project, variant }: { project: ReferenceProject; variant: SurfaceVariant }) {
  return (
    <div className={`neutral-project-surface neutral-project-surface--${variant}`} aria-hidden="true">
      <span className="neutral-project-surface__signal" />
      <b dir="ltr">{project.index}</b>
      <strong dir="ltr">{project.family}</strong>
      {variant === 'desktop' && <small>{project.title}</small>}
      {variant === 'detail' && <small>{project.focus[0]}</small>}
      <i />
    </div>
  );
}

export function ReferenceProof() {
  const [activeId, setActiveId] = useState(referenceProjects[0].id);
  const [focusedSelectorId, setFocusedSelectorId] = useState<string | null>(null);
  const selectorGroupRef = useRef<HTMLDivElement>(null);
  const active = referenceProjects.find((project) => project.id === activeId) ?? referenceProjects[0];
  const alternatives = referenceProjects.filter((project) => project.id !== active.id);

  const selectProject = (projectId: string, keyboardSelection: boolean) => {
    const nextFocusId = keyboardSelection
      ? referenceProjects.find((project) => project.id !== projectId)?.id ?? null
      : null;

    setActiveId(projectId);
    setFocusedSelectorId(nextFocusId);

    if (nextFocusId) {
      requestAnimationFrame(() => {
        selectorGroupRef.current?.querySelector<HTMLButtonElement>(`[data-project-selector="${nextFocusId}"]`)?.focus();
      });
    }
  };

  return (
    <section
      id="reference-proof"
      className="reference-proof reference-proof-v2"
      aria-labelledby="proof-title"
      data-project={active.id}
      dir="rtl"
    >
      <img
        className="reference-proof-v2__environment"
        src={theatreEnvironment}
        alt=""
        aria-hidden="true"
        loading="lazy"
      />

      <div className="reference-proof-v2__seam" aria-hidden="true" />

      <ProjectMedia
        label={`مساحات العرض للمشروع المختار: ${active.family}`}
        desktop={{
          alt: `السطح الرئيسي للمشروع ${active.family}`,
          placeholder: <NeutralProjectSurface project={active} variant="desktop" />,
        }}
        mobile={{
          alt: `السطح المساند للمشروع ${active.family}`,
          placeholder: <NeutralProjectSurface project={active} variant="mobile" />,
        }}
        detail={{
          alt: `سطح التفاصيل للمشروع ${active.family}`,
          placeholder: <NeutralProjectSurface project={active} variant="detail" />,
        }}
      />

      <div ref={selectorGroupRef} className="reference-proof-v2__selectors project-index" role="group" aria-label="اختر مشروعًا آخر">
        {alternatives.map((project) => (
          <button
            key={project.id}
            className={focusedSelectorId === project.id ? 'is-keyboard-focus' : undefined}
            data-project-selector={project.id}
            type="button"
            aria-pressed="false"
            aria-label={`اختيار ${project.index} — ${project.family}`}
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              if (event.detail > 0) selectProject(project.id, false);
            }}
            onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selectProject(project.id, true);
              }
            }}
            onFocus={() => setFocusedSelectorId(project.id)}
            onBlur={() => setFocusedSelectorId((current) => current === project.id ? null : current)}
          >
            <span className="reference-proof-v2__selector-index" dir="ltr">{project.index}</span>
            <span className="reference-proof-v2__selector-family" dir="ltr">{project.family}</span>
            <span className="reference-proof-v2__selector-title">{project.title}</span>
            <i aria-hidden="true" />
          </button>
        ))}
      </div>

      <header className="reference-proof-v2__narrative" aria-live="polite">
        <div className="reference-proof-v2__eyebrow">
          <span dir="ltr">03</span>
          <p>أعمال مختارة</p>
          <i aria-hidden="true" />
        </div>

        <h2 id="proof-title">مشروع واحد.<br />في مركز المشهد.</h2>
        <p className="reference-proof-v2__intro">
          أربع تجارب مستقلة، لكلّ منها سياقها، تجمعها عناية واحدة بالوضوح والترابط.
        </p>

        <div className="reference-proof-v2__project-heading">
          <span dir="ltr">{active.index}</span>
          <p>المشروع المختار</p>
        </div>

        <div className="reference-proof-v2__project-copy">
          <p dir="ltr">{active.family}</p>
          <h3>{active.title}</h3>
          <p>{active.statement}</p>
        </div>

        <ul className="reference-proof-v2__focus" aria-label="محاور المشروع">
          {active.focus.map((item, index) => (
            <li key={item}><span dir="ltr">0{index + 1}</span>{item}</li>
          ))}
        </ul>
      </header>
    </section>
  );
}
