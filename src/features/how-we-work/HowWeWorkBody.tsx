import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import type { ReferenceLocale } from '../../data/reference-projects';
import {
  dependencyDimensions,
  gsPrinciples,
  methodStages,
  methodText,
  scopeBands,
  type MethodStageId,
} from '../../data/how-we-work';
import './how-we-work.css';

export type HowWeWorkBodyProps = {
  locale?: ReferenceLocale;
  initialStageId?: MethodStageId;
  className?: string;
};

const pageCopy = {
  ar: {
    eyebrow: 'GS-PUB-004 / كيف نعمل',
    titleLead: 'من حاجة غير مكتملة',
    titleClose: 'إلى قرار مشروع قابل للمراجعة.',
    intro: 'لا نفترض أن الاحتياج يصل جاهزاً. نبني الوضوح عبر بوابات قرار تحافظ على الحدود والمجهولات والدليل المطلوب.',
    trustTitle: 'قاعدة الثقة',
    trust: 'كل مرحلة تجعل القرار أكثر تحديداً، لكنها لا تخفي مجهولاً ولا تحوّل الافتراض إلى وعد.',
    corridorLabel: 'ممر المنهج',
    stageSelector: 'اختر مرحلة المنهج',
    currentGate: 'البوابة النشطة',
    question: 'السؤال الحاكم',
    control: 'أداة التحكم',
    output: 'المخرج القابل للتسليم',
    decision: 'فحص القرار قبل العبور',
    blueprint: 'تكوّن معمار المشروع',
    blueprintNote: 'يزداد التحديد مع كل بوابة؛ لا يعني التقدم أن البدء أو التسليم أصبح تلقائياً.',
    blueprintLayers: ['المشكلة', 'المرجع', 'النطاق', 'الاعتماديات', 'البناء', 'التحقق', 'التأسيس'],
    scopeEyebrow: '03 / معمار النطاق',
    scopeTitle: 'كل بند يحمل حالة. لا شيء يدخل بصمت.',
    scopeIntro: 'هذه اللغة تمنع خلط الضروري بالمحتمل، وتُبقي القرارات غير المحسومة ظاهرة حتى يملكها طرف واضح.',
    riskEyebrow: '04 / الاعتماديات والمخاطر',
    riskTitle: 'نرسم ما يقع خارج حدود السيطرة قبل البناء.',
    riskIntro: 'وجود اعتماد لا يعني أنه جاهز. يحتاج كل اعتماد إلى مالك، حالة تحقق، أثر، ومسار قرار أو تخفيف.',
    registerFields: ['المالك', 'حالة التحقق', 'الأثر', 'القرار / التخفيف'],
    qualityEyebrow: '06 / الدليل والجودة',
    qualityTitle: 'المطالبة ليست دليلاً.',
    qualityIntro: 'نحدد وسيلة التحقق المناسبة ونربط النتيجة بالحالة التي تمت مراجعتها. القيود والفشل جزء من السجل، لا هامش مخفي.',
    qualityItems: [
      ['وظيفي', 'اختبار أو فحص سلوك مقابل مطلب محدد'],
      ['بصري', 'مراجعة مباشرة على أحجام واتجاهات معتمدة'],
      ['تشغيلي', 'دليل من مصدر النظام الفعلي عند توفره'],
      ['حدود', 'تسجيل ما لم يُتحقق أو بقي خارج النطاق'],
    ],
    transitionEyebrow: '07 / من القرار إلى المشروع',
    transitionTitle: 'قرار GS يصبح مدخلاً منظماً—لا مشروعاً تلقائياً.',
    transitionIntro: 'حزمة التأسيس تحفظ السياق والنطاق والقرارات والاعتماديات ومعايير التحقق، ثم تمر عبر قرار بدء مستقل.',
    transitionNodes: ['قرار موجّه', 'حزمة تأسيس', 'خط أساس نطاق', 'قرار بدء مستقل'],
    transitionBoundary: 'لا تبدأ أعمال التنفيذ ولا تنشأ وعود تجارية بمجرد اكتمال الرحلة الإرشادية.',
    aboutEyebrow: 'عن General Solutions',
    aboutTitle: 'نصمم القرار قبل أن نطلب من التقنية تنفيذه.',
    aboutIntro: 'General Solutions مساحة لاختيار الحل وتشكيل نطاقه. نربط الفهم بمرجع مناسب، ونفصل الحقائق عن الافتراضات، ثم نحوّل القرار إلى مدخل مشروع يمكن فحصه.',
    philosophy: 'فلسفة المنتج',
    aboutBoundaryTitle: 'ما لا تدّعيه هذه الصفحة',
    aboutBoundary: 'لا تعرض سنوات خبرة أو عملاء أو شهادات أو أرقام أداء. الثقة هنا ناتجة عن وضوح المنهج وحدوده.',
  },
  en: {
    eyebrow: 'GS-PUB-004 / HOW WE WORK',
    titleLead: 'From an incomplete need',
    titleClose: 'to a reviewable project decision.',
    intro: 'We do not assume a need arrives fully formed. Clarity is built through decision gates that preserve boundaries, unknowns, and required evidence.',
    trustTitle: 'Trust rule',
    trust: 'Each stage makes the decision more concrete, but never hides an unknown or turns an assumption into a promise.',
    corridorLabel: 'Method corridor',
    stageSelector: 'Choose a method stage',
    currentGate: 'Active gate',
    question: 'Governing question',
    control: 'Control mechanism',
    output: 'Handoff output',
    decision: 'Decision check before passage',
    blueprint: 'Project architecture taking shape',
    blueprintNote: 'Definition increases at each gate; progress does not make project start or delivery automatic.',
    blueprintLayers: ['Problem', 'Reference', 'Scope', 'Dependencies', 'Build', 'Verification', 'Bootstrap'],
    scopeEyebrow: '03 / SCOPE ARCHITECTURE',
    scopeTitle: 'Every item has a state. Nothing enters silently.',
    scopeIntro: 'This grammar separates necessity from possibility and keeps undecided items visible until they have a clear owner.',
    riskEyebrow: '04 / DEPENDENCIES & RISK',
    riskTitle: 'Map what sits outside direct control before build.',
    riskIntro: 'A dependency is not ready merely because it exists. Each one needs an owner, verification state, impact, and decision or mitigation path.',
    registerFields: ['Owner', 'Verification state', 'Impact', 'Decision / mitigation'],
    qualityEyebrow: '06 / EVIDENCE & QUALITY',
    qualityTitle: 'A claim is not evidence.',
    qualityIntro: 'Define the appropriate verification method and tie results to the exact state reviewed. Limitations and failure stay in the record.',
    qualityItems: [
      ['Functional', 'Test or behavior check against a specific requirement'],
      ['Visual', 'Direct review at approved sizes and directions'],
      ['Operational', 'Evidence from the actual operating source when available'],
      ['Boundaries', 'Record what remains unverified or out of scope'],
    ],
    transitionEyebrow: '07 / DECISION-TO-PROJECT',
    transitionTitle: 'A GS decision becomes structured input—not an automatic project.',
    transitionIntro: 'The bootstrap pack preserves context, scope, decisions, dependencies, and verification criteria, then passes through a separate start decision.',
    transitionNodes: ['Guided decision', 'Bootstrap pack', 'Scope baseline', 'Separate start decision'],
    transitionBoundary: 'Implementation does not begin and commercial promises are not created merely by completing the guided journey.',
    aboutEyebrow: 'ABOUT GENERAL SOLUTIONS',
    aboutTitle: 'Design the decision before asking technology to execute it.',
    aboutIntro: 'General Solutions is a space for selecting a solution and shaping its scope. We connect understanding to a suitable reference, separate facts from assumptions, and turn the decision into inspectable project input.',
    philosophy: 'Product philosophy',
    aboutBoundaryTitle: 'What this page does not claim',
    aboutBoundary: 'It presents no years of experience, clients, certifications, or performance figures. Trust here comes from method clarity and boundaries.',
  },
} as const;

function MethodBlueprint({ locale, activeIndex }: { locale: ReferenceLocale; activeIndex: number }) {
  const copy = pageCopy[locale];
  const progress = methodStages.length === 1 ? 100 : (activeIndex / (methodStages.length - 1)) * 100;

  return (
    <div
      className="method-blueprint"
      style={{ '--method-progress': `${progress}%` } as CSSProperties}
      aria-label={copy.blueprint}
    >
      <header>
        <span>{copy.blueprint}</span>
        <strong dir="ltr">{String(activeIndex + 1).padStart(2, '0')} / 07</strong>
      </header>

      <div className="method-blueprint__field" aria-hidden="true">
        <div className="method-blueprint__axis"><i /></div>
        <div className="method-blueprint__object">
          {copy.blueprintLayers.map((label, index) => (
            <span key={label} className={index <= activeIndex ? 'is-defined' : undefined}>
              <i />
              <b>{label}</b>
              <small dir="ltr">L{String(index + 1).padStart(2, '0')}</small>
            </span>
          ))}
        </div>
        <div className="method-blueprint__measure">
          {methodStages.map((stage, index) => <i key={stage.id} className={index <= activeIndex ? 'is-defined' : undefined} />)}
        </div>
      </div>

      <p>{copy.blueprintNote}</p>
    </div>
  );
}

export function HowWeWorkBody({
  locale = 'ar',
  initialStageId = 'discovery',
  className = '',
}: HowWeWorkBodyProps) {
  const initialStage = methodStages.some((stage) => stage.id === initialStageId)
    ? initialStageId
    : 'discovery';
  const [activeId, setActiveId] = useState<MethodStageId>(initialStage);
  const stageButtons = useRef<Array<HTMLButtonElement | null>>([]);
  const panelId = useId();
  const copy = pageCopy[locale];
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const activeIndex = methodStages.findIndex((stage) => stage.id === activeId);
  const active = methodStages[activeIndex] ?? methodStages[0];

  const selectStage = (stageId: MethodStageId) => setActiveId(stageId);

  const handleStageKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = methodStages.length - 1;
    let nextIndex: number | null = null;

    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = lastIndex;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = index === lastIndex ? 0 : index + 1;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = index === 0 ? lastIndex : index - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      const nextStage = methodStages[nextIndex];
      selectStage(nextStage.id);
      stageButtons.current[nextIndex]?.focus();
    }
  };

  return (
    <div
      className={`how-we-work-body ${className}`.trim()}
      dir={direction}
      lang={locale}
      data-active-stage={active.id}
    >
      <section className="method-hero" aria-labelledby="how-we-work-title">
        <div className="method-hero__grid" aria-hidden="true" />
        <header className="method-hero__header">
          <p className="method-eyebrow"><i />{copy.eyebrow}</p>
          <h1 id="how-we-work-title" data-route-focus tabIndex={-1}>
            <span>{copy.titleLead}</span>
            <span>{copy.titleClose}</span>
          </h1>
          <p className="method-hero__intro">{copy.intro}</p>
          <aside>
            <span>{copy.trustTitle}</span>
            <p>{copy.trust}</p>
          </aside>
        </header>

        <div className="method-corridor" aria-label={copy.corridorLabel}>
          <div className="method-corridor__topline" aria-hidden="true">
            <span>GS / METHOD</span><i /><span>CONTROLLED PROGRESSION</span>
          </div>

          <div className="method-stage-selector" role="tablist" aria-label={copy.stageSelector} aria-orientation="vertical">
            {methodStages.map((stage, index) => {
              const selected = stage.id === active.id;
              return (
                <button
                  key={stage.id}
                  ref={(element) => { stageButtons.current[index] = element; }}
                  id={`${panelId}-${stage.id}-tab`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`${panelId}-panel`}
                  tabIndex={selected ? 0 : -1}
                  className={selected ? 'is-active' : undefined}
                  data-method-stage={stage.id}
                  onClick={() => selectStage(stage.id)}
                  onKeyDown={(event) => handleStageKey(event, index)}
                >
                  <span dir="ltr">{stage.index}</span>
                  <div>
                    <strong>{methodText(stage.title, locale)}</strong>
                    <small>{methodText(stage.summary, locale)}</small>
                  </div>
                  <i aria-hidden="true" />
                </button>
              );
            })}
          </div>

          <MethodBlueprint locale={locale} activeIndex={activeIndex} />

          <article
            id={`${panelId}-panel`}
            className="method-gate"
            role="tabpanel"
            aria-labelledby={`${panelId}-${active.id}-tab`}
            tabIndex={0}
          >
            <header>
              <span>{copy.currentGate} / {active.index}</span>
              <h2>{methodText(active.title, locale)}</h2>
              <p>{methodText(active.summary, locale)}</p>
            </header>
            <dl>
              <div>
                <dt><span>Q</span>{copy.question}</dt>
                <dd>{methodText(active.question, locale)}</dd>
              </div>
              <div>
                <dt><span>C</span>{copy.control}</dt>
                <dd>{methodText(active.control, locale)}</dd>
              </div>
              <div>
                <dt><span>O</span>{copy.output}</dt>
                <dd>{methodText(active.output, locale)}</dd>
              </div>
              <div>
                <dt><span>D</span>{copy.decision}</dt>
                <dd>{methodText(active.decision, locale)}</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section className="scope-architecture" aria-labelledby="scope-architecture-title">
        <header>
          <p>{copy.scopeEyebrow}</p>
          <h2 id="scope-architecture-title">{copy.scopeTitle}</h2>
          <span>{copy.scopeIntro}</span>
        </header>
        <ol>
          {scopeBands.map((band, index) => (
            <li key={band.code} data-scope-state={band.code}>
              <span dir="ltr">0{index + 1}</span>
              <i aria-hidden="true" />
              <h3>{methodText(band.label, locale)}</h3>
              <p>{methodText(band.meaning, locale)}</p>
              <small dir="ltr">{band.code.toUpperCase()}</small>
            </li>
          ))}
        </ol>
      </section>

      <section className="risk-register" aria-labelledby="risk-register-title">
        <div className="risk-register__heading">
          <p>{copy.riskEyebrow}</p>
          <h2 id="risk-register-title">{copy.riskTitle}</h2>
          <span>{copy.riskIntro}</span>
        </div>
        <div className="risk-register__system">
          <div className="risk-register__dimensions" aria-label={copy.riskTitle}>
            {dependencyDimensions.map((dimension, index) => (
              <article key={dimension.en}>
                <span dir="ltr">D{String(index + 1).padStart(2, '0')}</span>
                <strong>{methodText(dimension, locale)}</strong>
                <i aria-hidden="true" />
              </article>
            ))}
          </div>
          <div className="risk-register__fields">
            {copy.registerFields.map((field, index) => (
              <span key={field}><i>{String(index + 1).padStart(2, '0')}</i>{field}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="quality-evidence" aria-labelledby="quality-evidence-title">
        <header>
          <p>{copy.qualityEyebrow}</p>
          <h2 id="quality-evidence-title">{copy.qualityTitle}</h2>
          <span>{copy.qualityIntro}</span>
        </header>
        <ol>
          {copy.qualityItems.map(([label, description], index) => (
            <li key={label}>
              <span dir="ltr">0{index + 1}</span>
              <div><strong>{label}</strong><p>{description}</p></div>
              <i aria-hidden="true" />
            </li>
          ))}
        </ol>
      </section>

      <section className="project-transition" aria-labelledby="project-transition-title">
        <header>
          <p>{copy.transitionEyebrow}</p>
          <h2 id="project-transition-title">{copy.transitionTitle}</h2>
          <span>{copy.transitionIntro}</span>
        </header>
        <ol>
          {copy.transitionNodes.map((node, index) => (
            <li key={node}>
              <span dir="ltr">0{index + 1}</span>
              <strong>{node}</strong>
              {index < copy.transitionNodes.length - 1 && <i aria-hidden="true" />}
            </li>
          ))}
        </ol>
        <aside><i aria-hidden="true" /><p>{copy.transitionBoundary}</p></aside>
      </section>

      <section className="about-gs" aria-labelledby="about-gs-title">
        <div className="about-gs__mark" aria-hidden="true"><span>G</span><i /><span>S</span></div>
        <header>
          <p>{copy.aboutEyebrow}</p>
          <h2 id="about-gs-title">{copy.aboutTitle}</h2>
          <span>{copy.aboutIntro}</span>
        </header>
        <div className="about-gs__principles">
          <h3>{copy.philosophy}</h3>
          <ol>
            {gsPrinciples.map((principle, index) => (
              <li key={principle.en}><span dir="ltr">0{index + 1}</span>{methodText(principle, locale)}</li>
            ))}
          </ol>
        </div>
        <aside>
          <span>{copy.aboutBoundaryTitle}</span>
          <p>{copy.aboutBoundary}</p>
        </aside>
      </section>
    </div>
  );
}
