import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import {
  localized,
  referenceProjects,
  type ReferenceLocale,
  type ReferenceProject,
  type ReferenceProjectId,
} from '../../data/reference-projects';
import './reference-projects.css';

export type ReferenceProjectsBodyProps = {
  locale?: ReferenceLocale;
  initialProjectId?: ReferenceProjectId;
  className?: string;
};

const pageCopy = {
  ar: {
    eyebrow: 'GS-PUB-003 / مشروعات مرجعية',
    titleLead: 'أربع بيئات تشغيل.',
    titleClose: 'حدود واضحة لما تثبته.',
    intro: 'نستخدم هذه المشروعات المستقلة لفهم نوع النظام الذي يناسب الحاجة، لا لادعاء أنها تطبيقات عميل أو وحدات جاهزة داخل GS.',
    boundaryTitle: 'حد الملكية',
    boundary: 'يعرض GS السياق والملاءمة وحالة التحقق فقط. الحقيقة التفصيلية والتنفيذية يملكها كل مشروع مستقل.',
    selectorLabel: 'اختر المشروع المرجعي',
    theatreLabel: 'مسرح القدرات المرجعية',
    activeReference: 'المرجع النشط',
    capabilityMap: 'خارطة قدرة توضيحية — ليست واجهة منتج أو دليلاً تشغيلياً',
    representedProblem: 'المشكلة التي يمثلها',
    capabilityClass: 'فئة القدرة',
    usefulWhen: 'مفيد كمرجع عندما',
    expand: 'افتح سجل الحدود والتحقق',
    collapse: 'أغلق سجل الحدود والتحقق',
    ledger: 'سجل الحدود والتحقق',
    notProve: 'ما لا يثبته هذا المرجع',
    evidenceState: 'حالة التحقق',
    routeSlot: 'مسار المصدر المستقل',
    routeMissing: 'لم يُضبط رابط موثوق للمصدر المستقل في هذا المستودع.',
    routeCode: 'ROUTE_NOT_CONFIGURED',
    compareEyebrow: 'مقارنة مضبوطة',
    compareTitle: 'أربع نقاط بداية، وليست أربعة قوالب جاهزة.',
    compareIntro: 'المقارنة هنا تختصر المجال وفئة القدرة وحالة المصدر. اختيار نقطة بداية لا يضيف وظائف أو أدلة غير متحققة.',
    project: 'المشروع',
    domain: 'المجال التشغيلي',
    capability: 'القدرة التي يوضحها',
    state: 'حالة الملخص',
    route: 'المسار الخارجي',
    independent: 'مشروع مستقل',
  },
  en: {
    eyebrow: 'GS-PUB-003 / REFERENCE PROJECTS',
    titleLead: 'Four operating environments.',
    titleClose: 'Clear limits on what they prove.',
    intro: 'We use these independent projects to understand which system class fits a need—not to present them as client implementations or ready-made GS modules.',
    boundaryTitle: 'Ownership boundary',
    boundary: 'GS presents context, fit, and verification state only. Each independent project owns its detailed and implementation truth.',
    selectorLabel: 'Choose a reference project',
    theatreLabel: 'Reference capability theatre',
    activeReference: 'Active reference',
    capabilityMap: 'Illustrative capability map — not a product interface or operational proof',
    representedProblem: 'Problem represented',
    capabilityClass: 'Capability class',
    usefulWhen: 'Useful as a reference when',
    expand: 'Open boundaries and verification ledger',
    collapse: 'Close boundaries and verification ledger',
    ledger: 'Boundaries and verification ledger',
    notProve: 'What this reference does not prove',
    evidenceState: 'Verification state',
    routeSlot: 'Independent source route',
    routeMissing: 'No verified independent-source URL is configured in this repository.',
    routeCode: 'ROUTE_NOT_CONFIGURED',
    compareEyebrow: 'Controlled comparison',
    compareTitle: 'Four starting points—not four ready-made templates.',
    compareIntro: 'This comparison is limited to domain, capability class, and source state. Choosing a starting point adds no unverified feature or proof.',
    project: 'Project',
    domain: 'Operating domain',
    capability: 'Capability illustrated',
    state: 'Summary state',
    route: 'Outbound route',
    independent: 'Independent project',
  },
} as const;

function CapabilityMap({ project, locale }: { project: ReferenceProject; locale: ReferenceLocale }) {
  return (
    <figure className="rp-capability-map" aria-labelledby={`capability-map-${project.id}`}>
      <figcaption id={`capability-map-${project.id}`}>{pageCopy[locale].capabilityMap}</figcaption>
      <svg className="rp-capability-map__routes" viewBox="0 0 720 420" preserveAspectRatio="none" aria-hidden="true">
        <path d="M360 210 C286 210 258 90 137 90" />
        <path d="M360 210 C430 210 466 90 585 90" />
        <path d="M360 210 C286 210 258 330 137 330" />
        <path d="M360 210 C430 210 466 330 585 330" />
        <circle cx="360" cy="210" r="102" />
        <circle cx="360" cy="210" r="76" />
      </svg>

      <div className="rp-capability-map__core" aria-hidden="true">
        <span>{project.code}</span>
        <i />
        <strong dir="ltr">{project.name}</strong>
        <small>{localized(project.domain, locale)}</small>
      </div>

      <ol className="rp-capability-map__nodes">
        {project.capabilities.map((capability, index) => (
          <li key={capability.en} data-node={index + 1}>
            <span dir="ltr">0{index + 1}</span>
            <strong>{localized(capability, locale)}</strong>
          </li>
        ))}
      </ol>
    </figure>
  );
}

export function ReferenceProjectsBody({
  locale = 'ar',
  initialProjectId = 'rp01',
  className = '',
}: ReferenceProjectsBodyProps) {
  const initialProject = referenceProjects.some((project) => project.id === initialProjectId)
    ? initialProjectId
    : 'rp01';
  const [activeId, setActiveId] = useState<ReferenceProjectId>(initialProject);
  const [expanded, setExpanded] = useState(false);
  const projectButtons = useRef<Array<HTMLButtonElement | null>>([]);
  const panelId = useId();
  const copy = pageCopy[locale];
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const activeIndex = referenceProjects.findIndex((project) => project.id === activeId);
  const active = referenceProjects[activeIndex] ?? referenceProjects[0];

  const selectProject = (projectId: ReferenceProjectId) => {
    setActiveId(projectId);
    setExpanded(false);
  };

  const handleProjectKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = referenceProjects.length - 1;
    let nextIndex: number | null = null;

    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = lastIndex;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = index === lastIndex ? 0 : index + 1;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = index === 0 ? lastIndex : index - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      const nextProject = referenceProjects[nextIndex];
      selectProject(nextProject.id);
      projectButtons.current[nextIndex]?.focus();
    }
  };

  return (
    <div
      className={`reference-projects-body ${className}`.trim()}
      dir={direction}
      lang={locale}
      data-active-project={active.id}
    >
      <section className="rp-hero" aria-labelledby="reference-projects-title">
        <div className="rp-grid" aria-hidden="true" />
        <header className="rp-hero__header">
          <p className="rp-eyebrow"><i />{copy.eyebrow}</p>
          <h1 id="reference-projects-title">
            <span>{copy.titleLead}</span>
            <span>{copy.titleClose}</span>
          </h1>
          <p className="rp-hero__intro">{copy.intro}</p>
          <aside className="rp-boundary-note">
            <span>{copy.boundaryTitle}</span>
            <p>{copy.boundary}</p>
          </aside>
        </header>

        <div className="rp-theatre" aria-label={copy.theatreLabel}>
          <div className="rp-theatre__signal" aria-hidden="true">
            <span>{active.code}</span><i /><span>04 / {String(activeIndex + 1).padStart(2, '0')}</span>
          </div>

          <div className="rp-project-selector" role="tablist" aria-label={copy.selectorLabel} aria-orientation="vertical">
            {referenceProjects.map((project, index) => {
              const selected = project.id === active.id;
              return (
                <button
                  key={project.id}
                  ref={(element) => { projectButtons.current[index] = element; }}
                  type="button"
                  role="tab"
                  id={`${panelId}-${project.id}-tab`}
                  aria-selected={selected}
                  aria-controls={`${panelId}-panel`}
                  tabIndex={selected ? 0 : -1}
                  className={selected ? 'is-active' : undefined}
                  data-project-selector={project.id}
                  onClick={() => selectProject(project.id)}
                  onKeyDown={(event) => handleProjectKey(event, index)}
                >
                  <span className="rp-project-selector__code" dir="ltr">{project.code}</span>
                  <span className="rp-project-selector__copy">
                    <strong dir="ltr">{project.name}</strong>
                    <small>{localized(project.domain, locale)}</small>
                  </span>
                  <i aria-hidden="true" />
                </button>
              );
            })}
          </div>

          <div
            id={`${panelId}-panel`}
            className="rp-active-project"
            role="tabpanel"
            aria-labelledby={`${panelId}-${active.id}-tab`}
            tabIndex={0}
          >
            <div className="rp-active-project__identity">
              <span>{copy.activeReference} / {active.code}</span>
              <p>{copy.independent}</p>
              <h2 dir="ltr">{active.name}</h2>
              <strong>{localized(active.domain, locale)}</strong>
              <p>{localized(active.context, locale)}</p>
            </div>

            <CapabilityMap project={active} locale={locale} />

            <dl className="rp-active-project__summary">
              <div>
                <dt>{copy.representedProblem}</dt>
                <dd>{localized(active.problem, locale)}</dd>
              </div>
              <div>
                <dt>{copy.capabilityClass}</dt>
                <dd>{localized(active.capabilityClass, locale)}</dd>
              </div>
              <div>
                <dt>{copy.usefulWhen}</dt>
                <dd>{localized(active.usefulWhen, locale)}</dd>
              </div>
            </dl>

            <button
              className="rp-ledger-toggle"
              type="button"
              aria-expanded={expanded}
              aria-controls={`${panelId}-ledger`}
              onClick={() => setExpanded((current) => !current)}
            >
              <span>{expanded ? copy.collapse : copy.expand}</span>
              <i aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <section
        id={`${panelId}-ledger`}
        className={`rp-ledger ${expanded ? 'is-open' : ''}`}
        aria-labelledby={`${panelId}-ledger-title`}
        aria-hidden={!expanded}
      >
        <div className="rp-ledger__inner">
          <header>
            <p>{active.code} / {copy.ledger}</p>
            <h2 id={`${panelId}-ledger-title`} dir="ltr">{active.name}</h2>
          </header>

          <article className="rp-ledger__limit">
            <span>01</span>
            <h3>{copy.notProve}</h3>
            <p>{localized(active.doesNotProve, locale)}</p>
          </article>

          <div className="rp-ledger__evidence">
            <h3>{copy.evidenceState}</h3>
            {active.evidence.map((evidence, index) => (
              <article key={evidence.label.en}>
                <span dir="ltr">0{index + 1}</span>
                <div>
                  <h4>{localized(evidence.label, locale)}</h4>
                  <p>{localized(evidence.note, locale)}</p>
                </div>
                <strong data-state={evidence.state} dir="ltr">{evidence.state}</strong>
              </article>
            ))}
          </div>

          <article className="rp-ledger__route">
            <span>02</span>
            <h3>{copy.routeSlot}</h3>
            <p>{copy.routeMissing}</p>
            <strong dir="ltr">{copy.routeCode}</strong>
          </article>
        </div>
      </section>

      <section className="rp-comparison" aria-labelledby="reference-comparison-title">
        <header>
          <p>{copy.compareEyebrow}</p>
          <h2 id="reference-comparison-title">{copy.compareTitle}</h2>
          <span>{copy.compareIntro}</span>
        </header>

        <div className="rp-comparison__legend" aria-hidden="true">
          <span>{copy.project}</span>
          <span>{copy.domain}</span>
          <span>{copy.capability}</span>
          <span>{copy.state}</span>
          <span>{copy.route}</span>
        </div>
        <ol className="rp-comparison__rows">
          {referenceProjects.map((project) => (
            <li key={project.id} data-project-row={project.id}>
              <div><span dir="ltr">{project.code}</span><strong dir="ltr">{project.name}</strong></div>
              <p>{localized(project.domain, locale)}</p>
              <p>{localized(project.capabilityClass, locale)}</p>
              <strong dir="ltr">REFERENCE_ONLY</strong>
              <strong dir="ltr">ROUTE_NOT_CONFIGURED</strong>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
