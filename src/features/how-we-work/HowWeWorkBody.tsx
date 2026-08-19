import {
  useEffect,
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

type StageOrientation = 'vertical' | 'horizontal';

const pageCopy = {
  ar: {
    eyebrow: 'كيف نعمل',
    titleLead: 'من حاجة غير مكتملة',
    titleClose: 'إلى قرار مشروع قابل للمراجعة.',
    intro: 'نبدأ بما تعرفه الآن، ونكشف ما لا يزال يحتاج قراراً. تعمل معنا عبر سبع مراحل تجعل النطاق والاعتماديات والدليل واضحاً قبل أي قرار منفصل ببدء التنفيذ.',
    trustTitle: 'ما نحميه أثناء العمل',
    trust: 'لا نخفي مجهولاً، ولا نحول افتراضاً إلى وعد، ولا نعتبر اكتمال الرحلة موافقة تلقائية على بدء مشروع.',
    relationshipTitle: 'كيف تبدو علاقة العمل معك',
    relationshipIntro: 'تظل القرارات مرئية لك طوال الرحلة: ما نعرفه، وما يحتاج منك أو منا قراراً، وما يبقى خارج الالتزام حتى يُحسم.',
    relationshipItems: [
      ['قبل تشكيل الحل', 'أنت تشرح العمل كما هو.', 'تشارك الهدف، والمستخدمين، والقيود، وما هو غير مؤكد. ونحن نفصل المشكلة عن الحل المفترض.'],
      ['أثناء تشكيل القرار', 'نراجع الخيارات والحدود معاً.', 'ترى لماذا دخل بند إلى النطاق، وما يحتاج تحققاً، وما بقي مجهولاً قبل أن يتحول إلى التزام.'],
      ['قبل أي تنفيذ', 'نغلق على مدخل واضح لقرار البدء.', 'تستلم نطاقاً وقرارات واعتماديات ومعايير تحقق قابلة للمراجعة. بدء المشروع يحتاج قراراً منفصلاً.'],
    ],
    corridorLabel: 'مراحل المنهج',
    corridorStart: 'سبع مراحل مرئية',
    corridorEnd: 'قرار قبل التنفيذ',
    stageSelector: 'اختر مرحلة المنهج',
    currentGate: 'المرحلة الحالية',
    question: 'ما نحتاج أن نجيب عنه',
    control: 'ما نثبته معاً',
    output: 'ما يبقى معك',
    decision: 'ما نراجعه قبل الانتقال',
    blueprint: 'تكوّن قرار المشروع',
    blueprintNote: 'يزداد التحديد مع كل مرحلة؛ التقدم هنا لا يعني أن المشروع بدأ أو أن التسليم أصبح تلقائياً.',
    blueprintLayers: ['المشكلة', 'المرجع', 'النطاق', 'الاعتماديات', 'خطة التنفيذ', 'التحقق', 'التأسيس'],
    scopeEyebrow: 'تشكيل النطاق',
    scopeTitle: 'كل بند يحمل حالة. لا شيء يدخل بصمت.',
    scopeIntro: 'هذه اللغة تمنع خلط الضروري بالمحتمل، وتُبقي القرارات غير المحسومة ظاهرة حتى يملكها طرف واضح.',
    riskEyebrow: 'الاعتماديات والمخاطر',
    riskTitle: 'نرسم ما يقع خارج حدود السيطرة قبل قرار التنفيذ.',
    riskIntro: 'وجود اعتماد لا يعني أنه جاهز. يحتاج كل اعتماد إلى مالك، وحالة تحقق، وأثر، ومسار قرار أو تخفيف.',
    registerFields: ['المالك', 'حالة التحقق', 'الأثر', 'القرار / التخفيف'],
    qualityEyebrow: 'الدليل والجودة',
    qualityTitle: 'المطالبة ليست دليلاً.',
    qualityIntro: 'نحدد وسيلة التحقق المناسبة ونربط النتيجة بالحالة التي تمت مراجعتها. القيود والفشل جزء من السجل، لا هامش مخفي.',
    qualityItems: [
      ['وظيفي', 'اختبار أو فحص سلوك مقابل مطلب محدد'],
      ['بصري', 'مراجعة مباشرة على أحجام واتجاهات معتمدة'],
      ['تشغيلي', 'دليل من مصدر النظام الفعلي عند توفره'],
      ['حدود', 'تسجيل ما لم يُتحقق أو بقي خارج النطاق'],
    ],
    transitionEyebrow: 'من القرار إلى المشروع',
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
    ctaEyebrow: 'الخطوة التالية',
    ctaTitle: 'ابدأ باكتشاف الحاجة، لا بإنشاء مشروع.',
    ctaBody: 'شارك ما تريد تغييره وما تعرفه الآن. تبدأ الخطوة التالية بفهم الحاجة والقيود والمجهولات قبل اقتراح نطاق أو التزام.',
    ctaAction: 'ابدأ الاكتشاف',
    ctaBoundary: 'هذه الخطوة تبدأ الاكتشاف فقط؛ ولا تنشئ عقداً أو مشروعاً أو موافقة تلقائية على التنفيذ.',
  },
  en: {
    eyebrow: 'HOW WE WORK',
    titleLead: 'From an incomplete need',
    titleClose: 'to a reviewable project decision.',
    intro: 'We start with what you know now and expose what still needs a decision. Seven stages make scope, dependencies, and evidence visible before any separate decision to begin implementation.',
    trustTitle: 'What we protect while working',
    trust: 'We do not hide unknowns, turn assumptions into promises, or treat completion of this journey as automatic approval to start a project.',
    relationshipTitle: 'What working with us looks like',
    relationshipIntro: 'Decisions stay visible to you throughout the journey: what is known, what needs a decision from either side, and what remains outside commitment until resolved.',
    relationshipItems: [
      ['Before shaping the solution', 'You explain the work as it is.', 'Share the outcome, users, constraints, and uncertainty. We separate the operating problem from an assumed solution.'],
      ['While shaping the decision', 'We review options and boundaries together.', 'You can see why an item enters scope, what needs verification, and what remains unknown before it becomes a commitment.'],
      ['Before any implementation', 'We close on clear input for a start decision.', 'You leave with reviewable scope, decisions, dependencies, and verification criteria. Starting the project remains a separate decision.'],
    ],
    corridorLabel: 'Method stages',
    corridorStart: 'Seven visible stages',
    corridorEnd: 'Decision before delivery',
    stageSelector: 'Choose a method stage',
    currentGate: 'Current stage',
    question: 'What we need to answer',
    control: 'What we establish together',
    output: 'What you leave with',
    decision: 'What we review before moving on',
    blueprint: 'Project decision taking shape',
    blueprintNote: 'Definition increases at each stage; progress here does not mean the project has started or delivery has become automatic.',
    blueprintLayers: ['Problem', 'Reference', 'Scope', 'Dependencies', 'Delivery plan', 'Verification', 'Bootstrap'],
    scopeEyebrow: 'SHAPING SCOPE',
    scopeTitle: 'Every item has a state. Nothing enters silently.',
    scopeIntro: 'This grammar separates necessity from possibility and keeps undecided items visible until they have a clear owner.',
    riskEyebrow: 'DEPENDENCIES & RISK',
    riskTitle: 'Map what sits outside direct control before an implementation decision.',
    riskIntro: 'A dependency is not ready merely because it exists. Each one needs an owner, verification state, impact, and decision or mitigation path.',
    registerFields: ['Owner', 'Verification state', 'Impact', 'Decision / mitigation'],
    qualityEyebrow: 'EVIDENCE & QUALITY',
    qualityTitle: 'A claim is not evidence.',
    qualityIntro: 'Define the appropriate verification method and tie results to the exact state reviewed. Limitations and failure stay in the record.',
    qualityItems: [
      ['Functional', 'Test or behavior check against a specific requirement'],
      ['Visual', 'Direct review at approved sizes and directions'],
      ['Operational', 'Evidence from the actual operating source when available'],
      ['Boundaries', 'Record what remains unverified or out of scope'],
    ],
    transitionEyebrow: 'DECISION TO PROJECT',
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
    ctaEyebrow: 'NEXT STEP',
    ctaTitle: 'Start with discovery, not project creation.',
    ctaBody: 'Share what you want to change and what you know today. The next step begins by understanding the need, constraints, and unknowns before proposing scope or commitment.',
    ctaAction: 'Start discovery',
    ctaBoundary: 'This step starts discovery only; it does not create a contract, project, or automatic approval to implement.',
  },
} as const;

const howWeWorkRemediationStyles = `
.working-relationship {
  width: min(1320px, 100%);
  margin: 48px auto 0;
  padding: 24px;
  border: 1px solid var(--method-line);
  background: rgba(7, 16, 23, 0.72);
}
.working-relationship > header {
  display: grid;
  grid-template-columns: minmax(240px, .8fr) minmax(320px, 1.2fr);
  gap: 24px 48px;
  align-items: end;
  margin-bottom: 22px;
}
.working-relationship > header h2 {
  margin: 0;
  font-family: 'Noto Kufi Arabic', 'Segoe UI', sans-serif;
  font-size: clamp(22px, 2.1vw, 31px);
  font-weight: 500;
  line-height: 1.45;
}
.working-relationship > header p {
  margin: 0;
  color: #a7a098;
  font-size: 14px;
  line-height: 1.8;
}
.working-relationship > ol {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--method-line);
}
.working-relationship li {
  min-width: 0;
  padding: 20px;
  border-inline-start: 1px solid var(--method-line);
}
.working-relationship li:first-child { border-inline-start: 0; }
.working-relationship li > span {
  display: block;
  margin-bottom: 9px;
  color: var(--method-gold);
  font-size: 12px;
  font-weight: 600;
}
.working-relationship li strong {
  display: block;
  color: #ddd6ce;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
}
.working-relationship li p {
  margin: 8px 0 0;
  color: #989590;
  font-size: 13px;
  line-height: 1.75;
}
.method-eyebrow,
.method-hero__header > aside span,
.method-stage-selector button strong,
.method-blueprint__object b,
.method-blueprint > p,
.method-gate > header > span,
.method-gate dt,
.scope-architecture > header p,
.risk-register__heading > p,
.quality-evidence > header p,
.project-transition > header p,
.about-gs > header p,
.risk-register__fields span,
.about-gs__principles h3,
.about-gs > aside span { font-size: 12px; }
.method-stage-selector button small,
.method-gate > header p,
.method-gate dd,
.scope-architecture > header > span,
.risk-register__heading > span,
.quality-evidence > header > span,
.project-transition > header > span,
.about-gs > header > span,
.scope-architecture li p,
.quality-evidence li p,
.about-gs__principles li,
.about-gs > aside p { font-size: 13px; }
.method-corridor__topline {
  font-family: inherit;
  font-size: 11px;
  letter-spacing: .04em;
  direction: inherit;
}
.method-stage-selector button > span,
.method-blueprint__object small,
.scope-architecture li > span,
.scope-architecture li small,
.risk-register__dimensions article > span,
.quality-evidence li > span,
.project-transition li > span,
.about-gs__principles li span { font-size: 10px; }
.risk-register__dimensions article > strong,
.project-transition li > strong { font-size: 13px; }
.about-gs {
  grid-template-areas:
    'mark header principles'
    'mark boundary principles'
    'cta cta cta';
}
.about-gs__cta {
  grid-area: cta;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) auto;
  gap: 22px 34px;
  align-items: center;
  padding: 26px 28px;
  border: 1px solid var(--method-line-strong);
  background: linear-gradient(90deg, rgba(215, 170, 112, .08), rgba(7, 16, 23, .9));
}
[dir='ltr'] .about-gs__cta {
  background: linear-gradient(270deg, rgba(215, 170, 112, .08), rgba(7, 16, 23, .9));
}
.about-gs__cta > div > span {
  display: block;
  color: var(--method-gold);
  font-size: 12px;
  font-weight: 700;
}
.about-gs__cta h3 {
  margin: 8px 0 7px;
  color: var(--method-text);
  font-family: 'Noto Kufi Arabic', 'Segoe UI', sans-serif;
  font-size: clamp(20px, 2vw, 28px);
  font-weight: 500;
  line-height: 1.5;
}
.about-gs__cta p {
  margin: 0;
  max-width: 820px;
  color: #aaa6a0;
  font-size: 13px;
  line-height: 1.8;
}
.about-gs__cta a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 22px;
  border: 1px solid var(--method-gold);
  color: #f4dfbe;
  text-decoration: none;
  font-weight: 700;
}
.about-gs__cta small {
  grid-column: 1 / -1;
  color: #85898b;
  font-size: 12px;
  line-height: 1.7;
}
@media (max-width: 900px) {
  .working-relationship > header { grid-template-columns: 1fr; }
  .working-relationship > ol { grid-template-columns: 1fr; }
  .working-relationship li {
    border-inline-start: 0;
    border-top: 1px solid rgba(255,255,255,.06);
    padding: 16px 4px;
  }
  .working-relationship li:first-child { border-top: 0; }
  .about-gs {
    grid-template-areas:
      'mark header'
      'boundary principles'
      'cta cta';
  }
}
@media (max-width: 760px) {
  .working-relationship { margin-top: 34px; padding: 20px; }
  .method-hero { padding-bottom: 64px; }
  .scope-architecture,
  .risk-register,
  .quality-evidence,
  .project-transition,
  .about-gs { padding-top: 64px; padding-bottom: 70px; }
  .about-gs {
    grid-template-areas:
      'mark'
      'header'
      'principles'
      'boundary'
      'cta';
  }
  .about-gs__cta { grid-template-columns: 1fr; }
  .about-gs__cta small { grid-column: 1; }
  .about-gs__cta a { justify-self: start; }
}
@media (max-width: 480px) {
  .method-hero { padding-top: 48px; padding-bottom: 54px; }
  .method-hero__header h1 { font-size: clamp(31px, 9vw, 40px); }
  .working-relationship { padding: 16px; }
  .working-relationship > header { margin-bottom: 14px; gap: 12px; }
  .working-relationship li { padding-block: 13px; }
  .method-corridor { gap: 14px; margin-top: 34px; padding-top: 58px; }
  .method-stage-selector button { min-width: 128px; min-height: 82px; }
  .method-blueprint { min-height: 0; padding: 16px; }
  .method-blueprint__field { display: none; }
  .method-blueprint > p { margin-top: 12px; }
  .method-gate { padding-block: 20px; }
  .method-gate dl { margin-top: 18px; }
  .method-gate dl > div { padding: 12px 0; }
  .scope-architecture,
  .risk-register,
  .quality-evidence,
  .project-transition,
  .about-gs { padding-top: 52px; padding-bottom: 58px; }
  .scope-architecture > header,
  .quality-evidence > header,
  .project-transition > header { margin-bottom: 28px; }
  .scope-architecture > ol { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .scope-architecture li,
  .scope-architecture li:first-child {
    min-height: 170px;
    padding: 17px 14px;
    border-top: 1px solid var(--method-line);
    border-inline-end: 1px solid var(--method-line);
  }
  .scope-architecture li > i { margin: 14px 0 20px; }
  .scope-architecture li h3 { min-height: 0; font-size: 13px; }
  .scope-architecture li p { margin-bottom: 28px; }
  .scope-architecture li small { right: 14px; bottom: 13px; left: 14px; }
  .risk-register { gap: 28px; }
  .risk-register__system { min-height: 0; padding: 16px 12px; }
  .risk-register__dimensions { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .risk-register__dimensions article { min-height: 96px; }
  .risk-register__fields { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .risk-register__fields span { min-height: 62px; }
  .quality-evidence > ol { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .quality-evidence li { min-height: 150px; gap: 16px; padding: 17px; }
  .project-transition > ol { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; background: var(--method-line); }
  .project-transition li,
  .project-transition li:last-child {
    min-height: 120px;
    border: 0;
  }
  .project-transition li > i { display: none; }
  .project-transition > aside { align-items: flex-start; font-size: 12px; }
  .about-gs { min-height: 0; gap: 28px; }
  .about-gs__mark { width: 96px; height: 96px; font-size: 30px; }
  .about-gs__mark i { height: 30px; }
  .about-gs__principles { padding: 18px; }
  .about-gs__principles li { padding: 13px 0; }
  .about-gs__cta { padding: 20px; }
}
`;

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
              <small dir="ltr">{String(index + 1).padStart(2, '0')}</small>
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
  const [stageOrientation, setStageOrientation] = useState<StageOrientation>('vertical');
  const stageButtons = useRef<Array<HTMLButtonElement | null>>([]);
  const panelId = useId();
  const copy = pageCopy[locale];
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const activeIndex = methodStages.findIndex((stage) => stage.id === activeId);
  const active = methodStages[activeIndex] ?? methodStages[0];

  useEffect(() => {
    const query = window.matchMedia('(max-width: 900px)');
    const syncOrientation = () => setStageOrientation(query.matches ? 'horizontal' : 'vertical');
    syncOrientation();
    query.addEventListener('change', syncOrientation);
    return () => query.removeEventListener('change', syncOrientation);
  }, []);

  const selectStage = (stageId: MethodStageId) => setActiveId(stageId);

  const handleStageKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = methodStages.length - 1;
    const next = index === lastIndex ? 0 : index + 1;
    const previous = index === 0 ? lastIndex : index - 1;
    let nextIndex: number | null = null;

    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = lastIndex;

    if (stageOrientation === 'vertical') {
      if (event.key === 'ArrowDown') nextIndex = next;
      if (event.key === 'ArrowUp') nextIndex = previous;
    } else {
      const forwardKey = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      const backwardKey = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
      if (event.key === forwardKey) nextIndex = next;
      if (event.key === backwardKey) nextIndex = previous;
    }

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
      <style>{howWeWorkRemediationStyles}</style>
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

        <section className="working-relationship" aria-labelledby="working-relationship-title">
          <header>
            <h2 id="working-relationship-title">{copy.relationshipTitle}</h2>
            <p>{copy.relationshipIntro}</p>
          </header>
          <ol>
            {copy.relationshipItems.map(([label, title, body]) => (
              <li key={label}>
                <span>{label}</span>
                <strong>{title}</strong>
                <p>{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="method-corridor" aria-label={copy.corridorLabel}>
          <div className="method-corridor__topline" aria-hidden="true">
            <span>{copy.corridorStart}</span><i /><span>{copy.corridorEnd}</span>
          </div>

          <div
            className="method-stage-selector"
            role="tablist"
            aria-label={copy.stageSelector}
            aria-orientation={stageOrientation}
          >
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
                <dt>{copy.question}</dt>
                <dd>{methodText(active.question, locale)}</dd>
              </div>
              <div>
                <dt>{copy.control}</dt>
                <dd>{methodText(active.control, locale)}</dd>
              </div>
              <div>
                <dt>{copy.output}</dt>
                <dd>{methodText(active.output, locale)}</dd>
              </div>
              <div>
                <dt>{copy.decision}</dt>
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
        <nav className="about-gs__cta" aria-label={copy.ctaEyebrow}>
          <div>
            <span>{copy.ctaEyebrow}</span>
            <h3>{copy.ctaTitle}</h3>
            <p>{copy.ctaBody}</p>
          </div>
          <a href="/start" tabIndex={0}>{copy.ctaAction}</a>
          <small>{copy.ctaBoundary}</small>
        </nav>
      </section>
    </div>
  );
}
