import { useState } from 'react';
import { ArrowLeft, Check, MousePointer2, Sparkles } from 'lucide-react';
import type { StageId } from '../../types/hero';

const NEEDS = [
  { id: 'service', label: 'إطلاق خدمة رقمية', short: 'خدمة رقمية' },
  { id: 'journey', label: 'تبسيط رحلة معقّدة', short: 'رحلة أوضح' },
  { id: 'product', label: 'تطوير منتج قائم', short: 'منتج متطور' },
] as const;

const STAGES: { id: StageId; label: string }[] = [
  { id: 'need', label: 'الاحتياج' },
  { id: 'direction', label: 'الاتجاه' },
  { id: 'build', label: 'التصميم والتطوير' },
  { id: 'launch', label: 'الإطلاق والتشغيل' },
];

const COPY: Record<StageId, { kicker: string; title: string; body: string }> = {
  need: {
    kicker: 'من الحاجة إلى أثرٍ واضح',
    title: 'نبني أنظمة رقمية',
    body: 'نبدأ بما تريد تغييره فعلًا، ثم نجعل كل قرارٍ في النظام امتدادًا لهذا الاحتياج.',
  },
  direction: {
    kicker: 'اتجاه واحد، بلا ضوضاء',
    title: 'نحوّل الحاجة إلى مسار واضح',
    body: 'يعاد ترتيب النظام حول الأولوية التي اخترتها، لتظهر الرحلة والحل قبل أن يبدأ البناء.',
  },
  build: {
    kicker: 'من الهيكل إلى السطح',
    title: 'التصميم يعمل أمامك',
    body: 'يتحوّل الهيكل نفسه تدريجيًا إلى واجهة متماسكة ثم إلى سطح منتج قابل للتفاعل.',
  },
  launch: {
    kicker: 'نتيجة هادئة ومتصلة',
    title: 'من الطلب إلى الإغلاق الواضح',
    body: 'تنتقل التجربة ذاتها إلى تسليم تشغيلي مفهوم—مثال توضيحي، لا ادعاء عن نظامٍ حي.',
  },
};

export function LivingSystemHero() {
  const [stage, setStage] = useState<StageId>('need');
  const [need, setNeed] = useState<(typeof NEEDS)[number] | null>(null);
  const [buildStep, setBuildStep] = useState(0);
  const [requestSent, setRequestSent] = useState(false);
  const stageIndex = STAGES.findIndex((item) => item.id === stage);
  const copy = COPY[stage];

  const selectNeed = (choice: (typeof NEEDS)[number]) => {
    setNeed(choice);
    setStage('direction');
  };

  const advance = () => {
    if (stage === 'direction') setStage('build');
    else if (stage === 'build' && buildStep < 2) setBuildStep((step) => step + 1);
    else if (stage === 'build') setStage('launch');
    else if (stage === 'launch' && !requestSent) setRequestSent(true);
  };

  return (
    <section id="hero" className="living-hero" aria-labelledby="hero-title" data-stage={stage} data-build={buildStep}>
      <div className="living-glow" aria-hidden="true" />
      <div className="living-shell">
        <div className="hero-copy-panel">
          <div className="stage-constellation" aria-label={`المرحلة الحالية: ${STAGES[stageIndex].label}`}>
            {STAGES.map((item, index) => (
              <span key={item.id} className={index <= stageIndex ? 'reached' : ''}>
                <i>{index + 1}</i><b>{item.label}</b>
              </span>
            ))}
          </div>
          <p className="hero-kicker">{copy.kicker}</p>
          <h1 id="hero-title">{copy.title}</h1>
          <p className="hero-body">{copy.body}</p>
          {stage === 'need' ? <p className="entry-cue"><MousePointer2 /> ابدأ من حاجتك داخل النظام</p> : (
            <button className="hero-action" type="button" onClick={advance}>
              {stage === 'direction' && 'شكّل هذا الاتجاه'}
              {stage === 'build' && buildStep === 0 && 'حوّل الهيكل إلى واجهة'}
              {stage === 'build' && buildStep === 1 && 'اصقل سطح المنتج'}
              {stage === 'build' && buildStep === 2 && 'جهّزه للإطلاق'}
              {stage === 'launch' && !requestSent && 'جرّب تسليم طلب توضيحي'}
              {stage === 'launch' && requestSent && 'تم إغلاق المسار'}
              <ArrowLeft />
            </button>
          )}
          {stage !== 'need' && <button className="restart-action" type="button" onClick={() => { setStage('need'); setNeed(null); setBuildStep(0); setRequestSent(false); }}>ابدأ بحاجة أخرى</button>}
        </div>

        <div className="system-field" aria-live="polite">
          <div className="system-orbit orbit-one" /><div className="system-orbit orbit-two" />
          <div className="need-selector" aria-label="اختر احتياجك">
            {NEEDS.map((choice, index) => (
              <button type="button" key={choice.id} className={need?.id === choice.id ? 'selected' : ''} onClick={() => selectNeed(choice)} style={{ '--i': index } as React.CSSProperties}>
                <span>{choice.label}</span><ArrowLeft />
              </button>
            ))}
          </div>

          <div className="product-surface">
            <div className="surface-top"><span className="surface-mark">GS</span><div className="surface-nav"><i /><i /><i /></div><span className="surface-state">{stage === 'launch' ? 'مثال توضيحي' : need?.short}</span></div>
            <div className="surface-content">
              <div className="surface-copy"><small>{need?.short || 'احتياجك هو نقطة البداية'}</small><strong>{stage === 'launch' ? 'طلب واضح، ومسار مكتمل' : stage === 'build' && buildStep > 0 ? 'تجربة أبسط لخطوتك التالية' : 'مسار واحد يصل إلى النتيجة'}</strong><span /><span /></div>
              <div className="surface-visual"><div className="visual-core"><Sparkles /><span /></div><i /><i /></div>
            </div>
            <div className="surface-actions"><button type="button" onClick={() => stage === 'launch' ? setRequestSent(true) : undefined}>{stage === 'launch' ? 'إرسال الطلب' : 'ابدأ الآن'}</button><span /></div>
          </div>

          <div className={`handoff ${requestSent ? 'resolved' : ''}`}>
            <span className="handoff-icon">{requestSent ? <Check /> : '01'}</span>
            <div><small>تدفق توضيحي</small><strong>{requestSent ? 'اكتمل التسليم بوضوح' : 'طلب جاهز للتسليم'}</strong><p>{requestSent ? 'تم الاستلام ← المراجعة ← الإغلاق' : 'اضغط لتجربة النتيجة التشغيلية'}</p></div>
          </div>
          <p className="system-caption"><span /> نظام واحد يتغيّر مع قرارك</p>
        </div>
      </div>
    </section>
  );
}
