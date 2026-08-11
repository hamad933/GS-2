import { useState } from 'react';
import { ArrowLeft, Check, Compass, MousePointer2, Send, Sparkles } from 'lucide-react';
import type { StageId } from '../../types/hero';
import { heroCleanDataUrl } from '../../assets/gs-home-v2/heroCleanData';
import './LivingSystemHero.e2.css';

const NEEDS = [
  { id: 'service', label: 'إطلاق خدمة رقمية', short: 'خدمة رقمية' },
  { id: 'journey', label: 'تبسيط رحلة معقّدة', short: 'رحلة أوضح' },
  { id: 'product', label: 'تطوير منتج قائم', short: 'منتج متطور' },
] as const;

const DIRECTIONS = [
  { id: 'focus', label: 'خطوة رئيسية واحدة', note: 'نقود المستخدم مباشرة إلى النتيجة' },
  { id: 'guide', label: 'رحلة موجهة', note: 'نقسّم القرار إلى أسئلة قصيرة وواضحة' },
  { id: 'self', label: 'مساحة خدمة ذاتية', note: 'نجمع الإجراء والمتابعة في مكان واحد' },
] as const;

const STAGES: { id: StageId; label: string }[] = [
  { id: 'need', label: 'الاحتياج' },
  { id: 'direction', label: 'الاتجاه' },
  { id: 'build', label: 'البناء' },
  { id: 'launch', label: 'الإطلاق' },
];

const BUILD_PHASES = [
  { label: 'رتّب الرحلة حول الهدف', note: 'نصل البداية بالقرار والنتيجة.' },
  { label: 'وحّد التجربة', note: 'تتّسق الرسالة والفعل في سطح واحد.' },
  { label: 'قرّبها من المستخدم', note: 'يتحوّل الهيكل إلى تجربة قابلة للمحاولة.' },
  { label: 'جرّب المسار', note: 'طلبك الحقيقي هو خطوة التسليم.' },
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
    body: 'شكّل اتجاه الحل داخل النظام نفسه؛ اختيارك هو الذي يعيد ترتيب السطح ويبدأ البناء.',
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

      <div className="e2-tonal-field" aria-hidden="true" />
      <div className="e2-threshold-light" aria-hidden="true" />

      <div className="e2-composition">
        <div className="hero-copy-panel e2-narrative">
          <p className="hero-kicker e2-kicker">{COPY[stage].kicker}</p>
          <h1 id="hero-title">{COPY[stage].title}</h1>
          <p className="hero-body e2-body">{COPY[stage].body}</p>

          {stage === 'need' ? (
            <p className="entry-cue e2-entry-cue"><MousePointer2 aria-hidden="true" /> ابدأ من حاجتك داخل النظام</p>
          ) : (
            <div className="e2-context">
              <span>{need?.label}</span>
              {direction && <span>{direction.label}</span>}
              <button className="restart-action e2-restart" type="button" onClick={restart}>ابدأ بحاجة أخرى</button>
            </div>
          )}
        </div>

        <div className="system-field e2-system-field" aria-live="polite">
          <aside className="e2-operating-wall" aria-label="نظام تشكيل الحل">
            <header className="e2-wall-header">
              <span className="e2-wall-signal" aria-hidden="true" />
              <div>
                <small>General Solutions</small>
                <strong>
                  {stage === 'need' && 'حدّد نقطة البداية'}
                  {stage === 'direction' && 'شكّل اتجاه الحل'}
                  {stage === 'build' && 'سطح البناء'}
                  {stage === 'launch' && 'جاهزية المسار'}
                </strong>
              </div>
            </header>

            <div className="need-selector e2-need-selector" aria-label="اختر احتياجك">
              <p className="e2-wall-intro"><span aria-hidden="true" /> نظام واحد يتغيّر مع قرارك</p>
              {NEEDS.map((choice, index) => (
                <button
                  type="button"
                  key={choice.id}
                  className={need?.id === choice.id ? 'selected' : ''}
                  onClick={() => {
                    setNeed(choice);
                    setStage('direction');
                  }}>
                  <i aria-hidden="true">0{index + 1}</i>
                  <span>{choice.label}</span>
                  <ArrowLeft aria-hidden="true" />
                </button>
              ))}
            </div>

            <div className="direction-selector e2-direction-selector" aria-label="اختر اتجاه الحل">
              <p><Compass aria-hidden="true" /> الحاجة المختارة: <strong>{need?.label}</strong></p>
              {DIRECTIONS.map((choice, index) => (
                <button type="button" key={choice.id} onClick={() => chooseDirection(choice)}>
                  <i aria-hidden="true">0{index + 1}</i>
                  <span>
                    <strong>{choice.label}</strong>
                    <small>{choice.note}</small>
                  </span>
                  <ArrowLeft aria-hidden="true" />
                </button>
              ))}
            </div>

            <div className="product-surface e2-product-surface">
              {stage === 'build' && (
                <div className="e2-build-chamber">
                  <header className="e2-build-header">
                    <div>
                      <small>{need?.short}</small>
                      <strong>{direction?.label}</strong>
                    </div>
                    <span>سطح البناء</span>
                  </header>

                  <ol className="e2-build-phases" aria-label={`مرحلة تشكيل السطح ${buildStep + 1} من 4`}>
                    {BUILD_PHASES.map((phase, index) => {
                      const state = index < buildStep ? 'done' : index === buildStep ? 'active' : 'upcoming';
                      return (
                        <li key={phase.label} data-state={state}>
                          <span className="e2-phase-index">0{index + 1}</span>
                          <div>
                            <strong>{phase.label}</strong>
                            <small>{phase.note}</small>
                          </div>
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
                    <small>نتيجة المسار</small>
                    <strong>طلبك أصبح خطوة واضحة</strong>
                  </header>
                  <div className="e2-launch-seal" aria-hidden="true"><Check /></div>
                  <div className="e2-resolution-flow">
                    <span className="is-complete"><Check aria-hidden="true" /> تم الاستلام</span>
                    <i aria-hidden="true" />
                    <span>المراجعة</span>
                    <i aria-hidden="true" />
                    <span>خطوة تالية واضحة</span>
                  </div>
                  <p>انتقل الفعل من الواجهة إلى نتيجة مفهومة دون انقطاع.</p>
                </div>
              )}
            </div>
          </aside>

          <svg className="e2-gateway-link" viewBox="0 0 260 320" aria-hidden="true">
            <path className="e2-link-primary" d="M4 72 H102 C128 72 128 126 158 126 H246" />
            <path d="M4 160 H118 C140 160 140 160 164 160 H246" />
            <path d="M4 248 H102 C128 248 128 194 158 194 H246" />
            <circle cx="158" cy="126" r="4" />
            <circle cx="164" cy="160" r="5" />
            <circle cx="158" cy="194" r="4" />
          </svg>

          <div className="e2-gateway-node" aria-hidden="true"><span /></div>
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
    </section>
  );
}
