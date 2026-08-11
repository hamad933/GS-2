import { useEffect, useRef, useState } from 'react';
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
  const directionAdvanceRef = useRef<number | null>(null);
  const stageIndex = STAGES.findIndex((item) => item.id === stage);

  useEffect(() => () => {
    if (directionAdvanceRef.current !== null) window.clearTimeout(directionAdvanceRef.current);
  }, []);

  const restart = () => {
    if (directionAdvanceRef.current !== null) window.clearTimeout(directionAdvanceRef.current);
    setStage('need');
    setNeed(null);
    setDirection(null);
    setBuildStep(0);
    setBrief('أريد بدء رحلة واضحة');
  };

  const chooseDirection = (choice: (typeof DIRECTIONS)[number]) => {
    if (directionAdvanceRef.current !== null) window.clearTimeout(directionAdvanceRef.current);
    setDirection(choice);
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420;
    directionAdvanceRef.current = window.setTimeout(() => {
      setStage('build');
      setBuildStep(0);
      directionAdvanceRef.current = null;
    }, delay);
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
      />

      <div className="e2-scene-vignette" aria-hidden="true" />
      <div className="e2-scene-grain" aria-hidden="true" />
      <div className="e2-threshold-light" aria-hidden="true" />
      <div className="e2-floor-current" aria-hidden="true" />
      <div className="e2-threshold-architecture" aria-hidden="true">
        <span className="e2-threshold-plane e2-threshold-plane-back" />
        <span className="e2-threshold-plane e2-threshold-plane-outer" />
        <span className="e2-threshold-plane e2-threshold-plane-middle" />
        <span className="e2-threshold-plane e2-threshold-plane-inner" />
        <span className="e2-threshold-cavity">
          <i className="e2-threshold-edge e2-threshold-edge-a" />
          <i className="e2-threshold-edge e2-threshold-edge-b" />
          <i className="e2-threshold-edge e2-threshold-edge-c" />
        </span>
        <span className="e2-threshold-reveal" />
        <span className="e2-threshold-jamb" />
        <span className="e2-threshold-sill"><i /><i /><i /></span>
        <i className="e2-threshold-cap" />
      </div>
      <svg className="e2-floor-rails" viewBox="0 0 1440 810" preserveAspectRatio="none" aria-hidden="true">
        <path className="e2-floor-rail e2-floor-rail-a" d="M742 596 C790 637 954 645 1084 703 C1194 752 1199 798 1157 835" />
        <path className="e2-floor-rail e2-floor-rail-b" d="M756 603 C811 650 970 674 952 759 C945 791 921 817 898 837" />
        <path className="e2-floor-rail e2-floor-rail-c" d="M728 591 C742 635 824 662 850 712 C873 756 853 803 824 838" />
        <path className="e2-floor-rail e2-floor-rail-d" d="M705 584 C713 620 752 647 783 673" />
      </svg>

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
            <div className="e2-wall-shell" aria-hidden="true">
              <span className="e2-shell-edge e2-shell-edge-top" />
              <span className="e2-shell-edge e2-shell-edge-side" />
              <span className="e2-shell-edge e2-shell-edge-bottom" />
              <i className="e2-shell-joint e2-shell-joint-a" />
              <i className="e2-shell-joint e2-shell-joint-b" />
              <i className="e2-shell-joint e2-shell-joint-c" />
            </div>
            <div className="e2-wall-frame">
              <div className="e2-wall-structure" aria-hidden="true">
                <span className="e2-wall-recess" />
                <span className="e2-wall-mounting-plane" />
                <span className="e2-wall-rib e2-wall-rib-top" />
                <span className="e2-wall-rib e2-wall-rib-bottom" />
                <span className="e2-wall-rib e2-wall-rib-side" />
                <span className="e2-wall-bus"><i /><i /><i /><i /></span>
                <i className="e2-wall-mount e2-wall-mount-a" />
                <i className="e2-wall-mount e2-wall-mount-b" />
                <i className="e2-wall-mount e2-wall-mount-c" />
                <i className="e2-wall-mount e2-wall-mount-d" />
              </div>
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

              <div className="e2-control-chamber">
                <div className="e2-control-mount" aria-hidden="true"><i /><i /><i /></div>

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
                        <span className="e2-choice-index" aria-hidden="true">0{index + 1}</span>
                        <span className="e2-choice-icon" aria-hidden="true"><Icon /></span>
                        <span className="e2-choice-label">{choice.label}</span>
                        <span className="e2-choice-coupler" aria-hidden="true"><i /><i /></span>
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
                      <button
                        type="button"
                        key={choice.id}
                        className={direction?.id === choice.id ? 'selected' : ''}
                        aria-pressed={direction?.id === choice.id}
                        onClick={() => chooseDirection(choice)}>
                        <span className="e2-choice-index" aria-hidden="true">0{index + 1}</span>
                        <span className="e2-choice-icon" aria-hidden="true"><Icon /></span>
                        <span className="e2-choice-label">
                          <strong>{choice.label}</strong>
                          <small>{choice.note}</small>
                        </span>
                        <span className="e2-choice-coupler" aria-hidden="true"><i /><i /></span>
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
                      <span>
                        <span className="e2-resolution-icon" aria-hidden="true"><ShieldCheck /></span>
                        <span className="e2-resolution-copy"><b>المراجعة</b><small>قراءة الطلب في سياقه</small></span>
                      </span>
                      <span>
                        <span className="e2-resolution-icon" aria-hidden="true"><Route /></span>
                        <span className="e2-resolution-copy"><b>المسار</b><small>ترتيب الخطوة التالية</small></span>
                      </span>
                      <span>
                        <span className="e2-resolution-icon" aria-hidden="true"><Sparkles /></span>
                        <span className="e2-resolution-copy"><b>الوضوح</b><small>قرار نهائي بين يديك</small></span>
                      </span>
                    </div>
                  </div>
                )}
                </div>
              </div>

              <div className="e2-stage-heading">مراحل العمل</div>
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

          <div className="e2-coupling-bridge" aria-hidden="true">
            <span className="e2-coupling-bed" />
            <svg className="e2-gateway-link" viewBox="0 0 330 430" preserveAspectRatio="none">
              <path className="e2-conduit e2-conduit-a" d="M0 82 H82 L118 112 H318" />
              <path className="e2-conduit e2-conduit-b" d="M0 174 H96 L132 196 H318" />
              <path className="e2-conduit e2-conduit-c" d="M0 266 H86 L124 278 H318" />
              <path className="e2-conduit e2-conduit-d" d="M0 354 H74 L116 336 H318" />
              <path className="e2-link-bus" d="M0 43 H53 L72 62 V371 L54 390 H0" />
              <circle cx="118" cy="112" r="4" />
              <circle cx="132" cy="196" r="4" />
              <circle cx="124" cy="278" r="4" />
              <circle cx="116" cy="336" r="4" />
            </svg>
            <span className="e2-coupling-terminal"><i /><i /><i /><i /></span>
          </div>

          <div className="e2-gateway-spine" aria-hidden="true">
            <i /><span /><i />
          </div>
        </div>
      </div>
    </section>
  );
}
