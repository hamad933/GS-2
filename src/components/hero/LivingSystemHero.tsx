import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  MousePointer2,
  Send,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { StageId } from '../../types/hero';
import { heroCleanDataUrl } from '../../assets/gs-home-v2/heroCleanData';
import './LivingSystemHero.e2.css';

type HeroGlyphName =
  | 'rocket'
  | 'flow'
  | 'layers'
  | 'browser'
  | 'calendar'
  | 'tools'
  | 'code'
  | 'shield'
  | 'gear'
  | 'share'
  | 'check';

type PendingHeroFocus = 'need' | 'direction' | 'build-action' | 'brief' | 'launch';

function HeroGlyph({ name }: { name: HeroGlyphName }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.55,
    vectorEffect: 'non-scaling-stroke' as const,
  };

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <g {...common}>
        {name === 'rocket' && (
          <>
            <path d="M27.5 8.5c5.8-1.4 10.2-.8 12-.3.5 1.8 1.1 6.2-.3 12L25.4 34l-11.2-11.2L27.5 8.5Z" />
            <path d="m21 29-8.3 1.8-4.2 5.7 9-1.2M27.8 35l-1.6 6.3-5.7-4.2 1.8-8.3" />
            <circle cx="31.5" cy="16.2" r="3.4" />
            <path d="M11.2 38.7c1.9-3.2 4.2-4.7 7.2-4.8-.1 3-1.6 5.3-4.8 7.2" />
          </>
        )}
        {name === 'flow' && (
          <>
            <circle cx="11" cy="14" r="3.5" />
            <circle cx="37" cy="10" r="3.5" />
            <circle cx="37" cy="37" r="3.5" />
            <circle cx="12" cy="33" r="3.5" />
            <path d="M14.5 14h7c4.5 0 5.5-4 12-4M15.5 31.8c7.5-1.6 9.5-9.7 18-8.4M33.8 34.8c-6.2-1.7-9.5-7.8-9.5-14.2" />
          </>
        )}
        {name === 'layers' && (
          <>
            <path d="m7.5 17 16.5-9 16.5 9L24 26 7.5 17Z" />
            <path d="m9 24 15 8 15-8M9 31l15 8 15-8" />
          </>
        )}
        {name === 'browser' && (
          <>
            <rect x="6" y="8" width="36" height="31" rx="2.5" />
            <path d="M6 16h36M11 12h.1M15 12h.1M19 12h.1M12 22h11v11H12zM28 22h8M28 27h8M28 32h5" />
          </>
        )}
        {name === 'calendar' && (
          <>
            <rect x="7" y="10" width="34" height="31" rx="2.5" />
            <path d="M7 18h34M15 6v8M33 6v8M15 25h.1M24 25h.1M33 25h.1M15 33h.1M24 33h.1M33 33h.1" />
          </>
        )}
        {name === 'tools' && (
          <>
            <path d="m10 36 22-22 6 6-22 22H10v-6ZM27.5 18.5l6 6M12 12l24 24M8 9l4-2 4 4-3 3M35 34l5 5" />
            <path d="m19 12 4-4 17 17-4 4" />
          </>
        )}
        {name === 'code' && (
          <>
            <rect x="6" y="8" width="36" height="32" rx="2.5" />
            <path d="M6 16h36M11 12h.1M15 12h.1M19 12h.1M20 24l-6 4 6 4M28 24l6 4-6 4M26 21l-4 14" />
          </>
        )}
        {name === 'shield' && (
          <>
            <path d="M24 5.5 39 11v11c0 9.8-6 16.7-15 20.5C15 38.7 9 31.8 9 22V11l15-5.5Z" />
            <path d="m16.5 24.5 5 5 10.5-11" />
          </>
        )}
        {name === 'gear' && (
          <>
            <path d="m20.5 5.5-.8 4.3a15 15 0 0 0-4.2 1.8l-3.7-2.5-4.7 4.7 2.5 3.7a15 15 0 0 0-1.8 4.2l-4.3.8v6.6l4.3.8a15 15 0 0 0 1.8 4.2l-2.5 3.7 4.7 4.7 3.7-2.5a15 15 0 0 0 4.2 1.8l.8 4.3h6.6l.8-4.3a15 15 0 0 0 4.2-1.8l3.7 2.5 4.7-4.7-2.5-3.7a15 15 0 0 0 1.8-4.2l4.3-.8v-6.6l-4.3-.8a15 15 0 0 0-1.8-4.2l2.5-3.7-4.7-4.7-3.7 2.5a15 15 0 0 0-4.2-1.8l-.8-4.3h-6.6Z" />
            <circle cx="24" cy="25.8" r="6.2" />
          </>
        )}
        {name === 'share' && (
          <>
            <circle cx="11" cy="24" r="4" />
            <circle cx="36" cy="11" r="4" />
            <circle cx="36" cy="37" r="4" />
            <path d="m14.5 22 17.8-9.2M14.5 26l17.8 9.2" />
          </>
        )}
        {name === 'check' && <path d="m13 25 7 7 15-17" />}
      </g>
    </svg>
  );
}

const NEEDS = [
  { id: 'service', label: 'إطلاق خدمة رقمية', short: 'خدمة رقمية', icon: 'rocket' },
  { id: 'journey', label: 'تبسيط رحلة معقّدة', short: 'رحلة أوضح', icon: 'flow' },
  { id: 'product', label: 'تطوير منتج قائم', short: 'منتج متطور', icon: 'layers' },
] as const;

const DIRECTIONS = [
  { id: 'focus', label: 'خطوة رئيسية واحدة', note: 'نقود المستخدم مباشرة إلى النتيجة', icon: 'browser' },
  { id: 'guide', label: 'رحلة موجهة', note: 'نقسّم القرار إلى أسئلة قصيرة وواضحة', icon: 'calendar' },
  { id: 'self', label: 'مساحة خدمة ذاتية', note: 'نجمع الإجراء والمتابعة في مكان واحد', icon: 'layers' },
] as const;

const STAGES: { id: StageId; label: string }[] = [
  { id: 'need', label: 'الاحتياج' },
  { id: 'direction', label: 'الاتجاه' },
  { id: 'build', label: 'البناء' },
  { id: 'launch', label: 'الإطلاق' },
];

const OPERATING_WALL_LABEL: Record<StageId, string> = {
  need: 'اختيار احتياج المشروع',
  direction: 'اختيار اتجاه الحل',
  build: 'إعداد ملخّص المشروع',
  launch: 'مراجعة ملخّص الإطلاق',
};

const BUILD_PHASES = [
  { label: 'رتّب الرحلة حول الهدف', note: 'نصل البداية بالقرار والنتيجة.', icon: 'tools' },
  { label: 'وحّد التجربة', note: 'تتّسق الرسالة والفعل في سطح واحد.', icon: 'code' },
  { label: 'جرّب المسار', note: 'يتحوّل الهيكل إلى تجربة قابلة للمحاولة.', icon: 'shield' },
  { label: 'جهّز الملخّص', note: 'أضف طلبك المختصر لإكمال الملخّص.', icon: 'gear' },
] as const;

const CTA_COPY: Record<StageId, { secondary: string; secondaryTo: string }> = {
  need: { secondary: 'استكشف كيف نعمل', secondaryTo: '/how-we-work' },
  direction: { secondary: 'استكشف الحلول', secondaryTo: '/solutions' },
  build: { secondary: 'شاهد المشاريع المرجعية', secondaryTo: '/reference-projects' },
  launch: { secondary: 'راجع كيف نعمل', secondaryTo: '/how-we-work' },
};

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
    kicker: 'بداية واضحة للخطوة التالية',
    title: 'ملخّصك جاهز لبدء المشروع',
    body: 'راجع ما اخترته، ثم انتقل إلى نقطة البدء المنظّمة وأكمل تفاصيل مشروعك بنفسك.',
  },
};

export function LivingSystemHero() {
  const [stage, setStage] = useState<StageId>('need');
  const [need, setNeed] = useState<(typeof NEEDS)[number] | null>(null);
  const [direction, setDirection] = useState<(typeof DIRECTIONS)[number] | null>(null);
  const [buildStep, setBuildStep] = useState(0);
  const [brief, setBrief] = useState('');
  const firstNeedRef = useRef<HTMLButtonElement>(null);
  const firstDirectionRef = useRef<HTMLButtonElement>(null);
  const buildActionRef = useRef<HTMLButtonElement>(null);
  const briefInputRef = useRef<HTMLInputElement>(null);
  const launchSurfaceRef = useRef<HTMLDivElement>(null);
  const pendingFocusRef = useRef<PendingHeroFocus | null>(null);
  const stageIndex = STAGES.findIndex((item) => item.id === stage);

  useEffect(() => {
    const pendingFocus = pendingFocusRef.current;
    if (!pendingFocus) return;

    pendingFocusRef.current = null;
    const target = pendingFocus === 'need'
      ? firstNeedRef.current
      : pendingFocus === 'direction'
        ? firstDirectionRef.current
        : pendingFocus === 'build-action'
          ? buildActionRef.current
          : pendingFocus === 'brief'
            ? briefInputRef.current
            : launchSurfaceRef.current;

    target?.focus({ preventScroll: true });
  }, [stage, buildStep]);

  const restart = () => {
    pendingFocusRef.current = 'need';
    setStage('need');
    setNeed(null);
    setDirection(null);
    setBuildStep(0);
    setBrief('');
  };

  const chooseNeed = (choice: (typeof NEEDS)[number]) => {
    pendingFocusRef.current = 'direction';
    setNeed(choice);
    setStage('direction');
  };

  const chooseDirection = (choice: (typeof DIRECTIONS)[number]) => {
    pendingFocusRef.current = 'build-action';
    setDirection(choice);
    setStage('build');
    setBuildStep(0);
  };

  const advanceBuild = (nextStep: number, focusTarget: 'build-action' | 'brief') => {
    pendingFocusRef.current = focusTarget;
    setBuildStep(nextStep);
  };

  const submitProductAction = () => {
    if (!brief.trim()) return;
    pendingFocusRef.current = 'launch';
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

          <div className="e2-hero-actions">
            <Link className="e2-cta e2-cta-primary" to="/start">
              ابدأ اختيارك <ArrowLeft aria-hidden="true" />
            </Link>
            <Link className="e2-cta e2-cta-secondary" to={CTA_COPY[stage].secondaryTo}>
              {CTA_COPY[stage].secondary} <ArrowLeft aria-hidden="true" />
            </Link>
          </div>

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
          <aside className="e2-operating-wall" aria-label={OPERATING_WALL_LABEL[stage]}>
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
                  <small>المرحلة / 0{stageIndex + 1}</small>
                  <strong>
                    {stage === 'need' && 'اختر نقطة البداية'}
                    {stage === 'direction' && 'اختر اتجاه التجربة'}
                    {stage === 'build' && 'خطوات البناء'}
                    {stage === 'launch' && 'الملخّص جاهز'}
                  </strong>
                </div>
                <span className="e2-wall-signal" aria-hidden="true" />
              </header>

              <div className="e2-control-chamber">
                <div className="e2-control-mount" aria-hidden="true"><i /><i /><i /></div>

                <div className="need-selector e2-need-selector" aria-label="اختر احتياجك" hidden={stage !== 'need'}>
                  <p className="e2-wall-intro"><span aria-hidden="true" /> اختر ما تريد تغييره</p>
                  {NEEDS.map((choice, index) => {
                    return (
                      <button
                        ref={index === 0 ? firstNeedRef : undefined}
                        type="button"
                        key={choice.id}
                        className={need?.id === choice.id ? 'selected' : ''}
                        onClick={() => chooseNeed(choice)}>
                        <span className="e2-choice-index" aria-hidden="true">0{index + 1}</span>
                        <span className="e2-choice-icon" aria-hidden="true"><HeroGlyph name={choice.icon} /></span>
                        <span className="e2-choice-label">{choice.label}</span>
                        <span className="e2-choice-coupler" aria-hidden="true"><i /><i /></span>
                        <ArrowLeft aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>

                <div className="direction-selector e2-direction-selector" aria-label="اختر اتجاه الحل" hidden={stage !== 'direction'}>
                  <p><HeroGlyph name="flow" /> الحاجة المختارة: <strong>{need?.label}</strong></p>
                  {DIRECTIONS.map((choice, index) => {
                    return (
                      <button
                        ref={index === 0 ? firstDirectionRef : undefined}
                        type="button"
                        key={choice.id}
                        onClick={() => chooseDirection(choice)}>
                        <span className="e2-choice-index" aria-hidden="true">0{index + 1}</span>
                        <span className="e2-choice-icon" aria-hidden="true"><HeroGlyph name={choice.icon} /></span>
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
                      <span><Sparkles aria-hidden="true" /> خطوات البناء</span>
                    </header>

                    <ol className="e2-build-phases" aria-label={`مرحلة تشكيل السطح ${buildStep + 1} من 4`}>
                      {BUILD_PHASES.map((phase, index) => {
                        const state = index < buildStep ? 'done' : index === buildStep ? 'active' : 'upcoming';
                        return (
                          <li key={phase.label} data-state={state}>
                            <span className="e2-phase-icon" aria-hidden="true"><HeroGlyph name={phase.icon} /></span>
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
                      {buildStep === 0 && <button ref={buildActionRef} type="button" onClick={() => advanceBuild(1, 'build-action')}>رتّب الرحلة حول الهدف <ArrowLeft aria-hidden="true" /></button>}
                      {buildStep === 1 && <button ref={buildActionRef} type="button" onClick={() => advanceBuild(2, 'build-action')}>وحّد التجربة <ArrowLeft aria-hidden="true" /></button>}
                      {buildStep === 2 && <button ref={buildActionRef} type="button" onClick={() => advanceBuild(3, 'brief')}>جرّب المسار <Sparkles aria-hidden="true" /></button>}
                      {buildStep === 3 && (
                        <form onSubmit={(event) => { event.preventDefault(); submitProductAction(); }}>
                          <label htmlFor="hero-brief">طلبك المختصر</label>
                          <input
                            ref={briefInputRef}
                            id="hero-brief"
                            value={brief}
                            placeholder="اكتب باختصار ما تريد تحقيقه"
                            onChange={(event) => setBrief(event.target.value)}
                          />
                          <button
                            type="submit"
                            aria-label="جهّز الملخّص"
                            disabled={!brief.trim()}>
                            جهّز الملخّص <Send aria-hidden="true" />
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}

                {stage === 'launch' && (
                  <div
                    ref={launchSurfaceRef}
                    className="e2-launch-chamber"
                    tabIndex={-1}
                    aria-label="ملخّص الإطلاق">
                    <header>
                      <small>ملخّص الاختيارات</small>
                      <strong>أصبحت نقطة البداية واضحة</strong>
                      <p>يمكنك الآن الانتقال إلى صفحة بدء الاختيار وإكمال التفاصيل بنفسك.</p>
                    </header>

                    <div className="e2-launch-primary">
                      <span className="e2-launch-seal" aria-hidden="true"><HeroGlyph name="check" /></span>
                      <div>
                        <strong>الملخّص جاهز</strong>
                        <small>لم يُرسل شيء بعد؛ ستبقى المراجعة والإرسال بين يديك.</small>
                      </div>
                    </div>

                    <div className="e2-resolution-flow">
                      <span><HeroGlyph name="shield" /><b>راجع الاختيارات</b><small>تأكّد من الحاجة والاتجاه</small></span>
                      <span><HeroGlyph name="share" /><b>ابدأ الاختيار</b><small>أضف سياق المشروع</small></span>
                      <span><HeroGlyph name="rocket" /><b>ثبّت ملخّصك</b><small>لن يُرسل شيء تلقائيًا</small></span>
                    </div>
                  </div>
                )}
                </div>
              </div>

              <div className="stage-constellation e2-stage-rail" aria-label={`المرحلة الحالية: ${STAGES[stageIndex].label}`}>
                <p className="e2-stage-rail-title">مراحل العمل</p>
                <div className="e2-stage-track">
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
