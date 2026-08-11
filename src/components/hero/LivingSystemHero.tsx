import { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Compass,
  Crosshair,
  Layers3,
  MousePointer2,
  Rocket,
  Route,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { StageId } from '../../types/hero';
import { heroCleanDataUrl } from '../../assets/gs-home-v2/heroCleanData';
import './LivingSystemHero.e2.css';

const NEEDS = [
  { id: 'service', label: 'إطلاق خدمة رقمية', short: 'خدمة رقمية', icon: Rocket },
  { id: 'journey', label: 'تبسيط رحلة معقّدة', short: 'رحلة أوضح', icon: Route },
  { id: 'product', label: 'تطوير منتج قائم', short: 'منتج متطور', icon: Layers3 },
] as const;

const DIRECTIONS = [
  { id: 'focus', label: 'خطوة رئيسية واحدة', note: 'نقود المستخدم مباشرة إلى النتيجة', icon: Crosshair },
  { id: 'guide', label: 'رحلة موجهة', note: 'نقسّم القرار إلى أسئلة قصيرة وواضحة', icon: Compass },
  { id: 'self', label: 'مساحة خدمة ذاتية', note: 'نجمع الإجراء والمتابعة في مكان واحد', icon: Layers3 },
] as const;

const STAGES: { id: StageId; label: string }[] = [
  { id: 'need', label: 'الاحتياج' },
  { id: 'direction', label: 'الاتجاه' },
  { id: 'build', label: 'البناء' },
  { id: 'launch', label: 'الإطلاق' },
];

const BUILD_PHASES = [
  { label: 'رتّب الرحلة حول الهدف', note: 'نصل البداية بالقرار والنتيجة.', icon: Route },
  { label: 'وحّد التجربة', note: 'تتّسق الرسالة والفعل في سطح واحد.', icon: Layers3 },
  { label: 'قرّبها من المستخدم', note: 'يتحوّل الهيكل إلى تجربة قابلة للمحاولة.', icon: Crosshair },
  { label: 'جرّب المسار', note: 'طلبك الحقيقي هو خطوة التسليم.', icon: ShieldCheck },
] as const;

const COPY: Record<StageId, { kicker: string; title: string; body: string }> = {
  need: {
    kicker: 'من الحاجة إلى نظام متكامل',
    title: 'نبني أنظمة رقمية تتشكّل حول واقع عملك',
    body: 'نبدأ بما تريد تغييره فعلًا، ثم نجعل كل قرار في النظام امتدادًا لهذا الاحتياج.',
  },
  direction: {
    kicker: 'اتجاه واحد، بلا ضوضاء',
    title: 'اختر كيف يصل المستخدم',
    body: 'شكّل اتجاه الحل داخل النظام نفسه؛ اختيارك يعيد ترتيب السطح ويبدأ البناء.',
  },
  build: {
    kicker: 'من الهيكل إلى التفاعل',
    title: 'نحوّل المسار إلى تجربة واضحة',
    body: 'تتشكّل الرحلة حول الهدف، ثم تتوحّد في سطحٍ واحد يمكنك تجربته بنفسك.',
  },
  launch: {
    kicker: 'نتيجة هادئة ومتصلة',
    title: 'الفعل نفسه يبدأ التسليم',
    body: 'الطلب الذي أرسلته انتقل إلى مسار واضح، مع بقاء القرار النهائي بين يديك.',
  },
};

export function LivingSystemHero() {
  const [stage, setStage] = useState<StageId>('need');
  const [need, setNeed] = useState<(typeof NEEDS)[number] | null>(null);
  const [direction, setDirection] = useState<(typeof DIRECTIONS)[number] | null>(null);
  const [buildStep, setBuildStep] = useState(0);
  const [brief, setBrief] = useState('أريد بدء رحلة واضحة');
  const stageIndex = STAGES.findIndex((item) => item.id === stage);

  const restart = () => {
    setStage('need');
    setNeed(null);
    setDirection(null);
    setBuildStep(0);
    setBrief('أريد بدء رحلة واضحة');
  };

  const chooseDirection = (choice: (typeof DIRECTIONS)[number]) => {
    setDirection(choice);
    setStage('build');
    setBuildStep(0);
  };

  const submitProductAction = () => {
    if (!brief.trim()) return;
    setStage('launch');
  };

  return (
    <section
      id="hero"
      className="living-hero e2-hero"
      aria-labelledby="hero-title"
      data-stage={stage}
      data-build={buildStep}>
      <img
        className="production-environment hero-environment e2-environment"
        src={heroCleanDataUrl}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
      />

      <div className="e2-scene-vignette" aria-hidden="true" />
      <div className="e2-threshold-light" aria-hidden="true" />
      <div className="e2-floor-current" aria-hidden="true" />

      <div className="e2-composition">
        <div className="hero-copy-panel e2-narrative">
          <div className="e2-narrative-index" aria-hidden="true">
            <span>0{stageIndex + 1}</span>
            <i />
          </div>
          <p className="hero-kicker e2-kicker">{COPY[stage].kicker}</p>
          <h1 id="hero-title">{COPY[stage].title}</h1>
          <p className="hero-body e2-body">{COPY[stage].body}</p>

          {stage === 'need' ? (
            <p className="entry-cue e2-entry-cue">
              <MousePointer2 aria-hidden="true" /> ابدأ من حاجتك داخل النظام
            </p>
          ) : (
            <div className="e2-context">
              <div>
                <span>{need?.label}</span>
                {direction && <span>{direction.label}</span>}
              </div>
              <button className="restart-action e2-restart" type="button" onClick={restart}>
                ابدأ بحاجة أخرى
              </button>
            </div>
          )}
        </div>

        <div className="system-field e2-system-field" aria-live="polite">
          <aside className="e2-operating-wall" aria-label="نظام تشكيل الحل">
            <div className="e2-wall-depth" aria-hidden="true" />
            <div className="e2-wall-frame">
              <div className="e2-brand-lockup" aria-hidden="true">
                <span className="e2-brand-glyph"><i /><i /></span>
                <b>General Solutions</b>
              </div>

              <header className="e2-wall-header">
                <div>
                  <small>مسار العمل / 0{stageIndex + 1}</small>
                  <strong>
                    {stage === 'need' && 'حدّد نقطة البداية'}
                    {stage === 'direction' && 'شكّل اتجاه الحل'}
                    {stage === 'build' && 'سطح البناء'}
                    {stage === 'launch' && 'جاهزية المسار'}
                  </strong>
                </div>
                <span className="e2-wall-signal" aria-hidden="true" />
              </header>

              <div className="need-selector e2-need-selector" aria-label="اختر احتياجك">
                <p className="e2-wall-intro"><span aria-hidden="true" /> نظام واحد يتغيّر مع قرارك</p>
                {NEEDS.map((choice, index) => {
                  const Icon = choice.icon;
                  return (
                    <button
                      type="button"
                      key={choice.id}
                      className={need?.id === choice.id ? 'selected' : ''}
                      onClick={() => {
                        setNeed(choice);
                        setStage('direction');
                      }}>
                      <span className="e2-choice-icon" aria-hidden="true"><Icon /></span>
                      <span>{choice.label}</span>
                      <i aria-hidden="true">0{index + 1}</i>
                      <ArrowLeft aria-hidden="true" />
                    </button>
                  );
                })}
              </div>

              <div className="direction-selector e2-direction-selector" aria-label="اختر اتجاه الحل">
                <p><Compass aria-hidden="true" /> الحاجة المختارة: <strong>{need?.label}</strong></p>
                {DIRECTIONS.map((choice, index) => {
                  const Icon = choice.icon;
                  return (
                    <button type="button" key={choice.id} onClick={() => chooseDirection(choice)}>
                      <span className="e2-choice-icon" aria-hidden="true"><Icon /></span>
                      <span>
                        <strong>{choice.label}</strong>
                        <small>{choice.note}</small>
                      </span>
                      <i aria-hidden="true">0{index + 1}</i>
                      <ArrowLeft aria-hidden="true" />
                    </button>
                  );
                })}
              </div>

              <div className="product-surface e2-product-surface">
                {stage === 'build' && (
                  <div className="e2-build-chamber">
                    <header className="e2-build-header">
                      <div>
                        <small>{need?.short}</small>
                        <strong>{direction?.label}</strong>
                      </div>
                      <span><Sparkles aria-hidden="true" /> مرحلة البناء</span>
                    </header>

                    <ol className="e2-build-phases" aria-label={`مرحلة تشكيل السطح ${buildStep + 1} من 4`}>
                      {BUILD_PHASES.map((phase, index) => {
                        const state = index < buildStep ? 'done' : index === buildStep ? 'active' : 'upcoming';
                        const Icon = phase.icon;
                        return (
                          <li key={phase.label} data-state={state}>
                            <span className="e2-phase-icon" aria-hidden="true"><Icon /></span>
                            <div>
                              <strong>{phase.label}</strong>
                              <small>{phase.note}</small>
                            </div>
                            <span className="e2-phase-index">0{index + 1}</span>
                            <span className="e2-phase-node" aria-hidden="true">{index < buildStep ? <Check /> : null}</span>
                          </li>
                        );
                      })}
                    </ol>

                    <div className="e2-build-workbench">
                      {buildStep === 0 && <button type="button" onClick={() => setBuildStep(1)}>رتّب الرحلة حول الهدف <ArrowLeft aria-hidden="true" /></button>}
                      {buildStep === 1 && <button type="button" onClick={() => setBuildStep(2)}>وحّد التجربة <ArrowLeft aria-hidden="true" /></button>}
                      {buildStep === 2 && <button type="button" onClick={() => setBuildStep(3)}>جرّب المسار <Sparkles aria-hidden="true" /></button>}
                      {buildStep === 3 && (
                        <form onSubmit={(event) => { event.preventDefault(); submitProductAction(); }}>
                          <label htmlFor="hero-brief">طلبك المختصر</label>
                          <input id="hero-brief" value={brief} onChange={(event) => setBrief(event.target.value)} />
                          <button type="submit" disabled={!brief.trim()}>إرسال الطلب <Send aria-hidden="true" /></button>
                        </form>
                      )}
                    </div>
                  </div>
                )}

                {stage === 'launch' && (
                  <div className="e2-launch-chamber">
                    <header>
                      <small>نتيجة المسار / الإطلاق</small>
                      <strong>طلبك أصبح خطوة واضحة</strong>
                      <p>انتقل الفعل إلى مسار متصل دون أن تنقطع الرحلة.</p>
                    </header>

                    <div className="e2-launch-primary">
                      <span className="e2-launch-seal" aria-hidden="true"><Check /></span>
                      <div>
                        <strong>تم الاستلام</strong>
                        <small>الطلب متصل بالاحتياج والاتجاه اللذين اخترتهما.</small>
                      </div>
                    </div>

                    <div className="e2-resolution-flow">
                      <span><ShieldCheck aria-hidden="true" /><b>المراجعة</b><small>قراءة الطلب في سياقه</small></span>
                      <span><Route aria-hidden="true" /><b>المسار</b><small>ترتيب الخطوة التالية</small></span>
                      <span><Sparkles aria-hidden="true" /><b>الوضوح</b><small>قرار نهائي بين يديك</small></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="stage-constellation e2-stage-rail" aria-label={`المرحلة الحالية: ${STAGES[stageIndex].label}`}>
                {STAGES.map((item, index) => (
                  <span
                    key={item.id}
                    className={index <= stageIndex ? 'reached' : ''}
                    aria-current={item.id === stage ? 'step' : undefined}>
                    <i aria-hidden="true" />
                    <b>{item.label}</b>
                  </span>
                ))}
              </div>
            </div>
          </aside>

          <svg className="e2-gateway-link" viewBox="0 0 320 420" aria-hidden="true">
            <path d="M0 78 H94 L128 112 H310" />
            <path d="M0 166 H106 L139 188 H310" />
            <path d="M0 254 H96 L130 266 H310" />
            <path d="M0 342 H82 L124 328 H310" />
            <circle cx="128" cy="112" r="4" />
            <circle cx="139" cy="188" r="4" />
            <circle cx="130" cy="266" r="4" />
            <circle cx="124" cy="328" r="4" />
          </svg>

          <div className="e2-gateway-spine" aria-hidden="true">
            <i /><span /><i />
          </div>
        </div>
      </div>
    </section>
  );
}
