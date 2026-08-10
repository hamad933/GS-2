import { useState } from 'react';
import { ArrowLeft, Check, Compass, MousePointer2, Send, Sparkles } from 'lucide-react';
import type { StageId } from '../../types/hero';

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
  { id: 'need', label: 'الاحتياج' }, { id: 'direction', label: 'الاتجاه' },
  { id: 'build', label: 'البناء' }, { id: 'launch', label: 'الإطلاق' },
];

const COPY: Record<StageId, { kicker: string; title: string; body: string }> = {
  need: { kicker: 'من الحاجة إلى نظام متكامل', title: 'نبني أنظمة رقمية تتشكّل حول واقع عملك', body: 'نبدأ بما تريد تغييره فعلًا، ثم نجعل كل قرار في النظام امتدادًا لهذا الاحتياج.' },
  direction: { kicker: 'اتجاه واحد، بلا ضوضاء', title: 'اختر كيف يصل المستخدم', body: 'شكّل اتجاه الحل داخل النظام نفسه؛ اختيارك هو الذي يعيد ترتيب السطح ويبدأ البناء.' },
  build: { kicker: 'من الهيكل إلى التفاعل', title: 'نحوّل المسار إلى تجربة واضحة', body: 'تتشكّل الرحلة حول الهدف، ثم تتوحّد في سطحٍ واحد يمكنك تجربته بنفسك.' },
  launch: { kicker: 'نتيجة هادئة ومتصلة', title: 'الفعل نفسه يبدأ التسليم', body: 'الطلب الذي أرسلته انتقل إلى مسار واضح، مع بقاء القرار النهائي بين يديك.' },
};

export function LivingSystemHero() {
  const [stage, setStage] = useState<StageId>('need');
  const [need, setNeed] = useState<(typeof NEEDS)[number] | null>(null);
  const [direction, setDirection] = useState<(typeof DIRECTIONS)[number] | null>(null);
  const [buildStep, setBuildStep] = useState(0);
  const [brief, setBrief] = useState('أريد بدء رحلة واضحة');
  const stageIndex = STAGES.findIndex((item) => item.id === stage);

  const restart = () => {
    setStage('need'); setNeed(null); setDirection(null); setBuildStep(0);
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
    <section id="hero" className="living-hero" aria-labelledby="hero-title" data-stage={stage} data-build={buildStep}>
      <div className="living-glow" aria-hidden="true" />
      <div className="living-shell">
        <div className="hero-copy-panel">
          <div className="stage-constellation" aria-label={`المرحلة الحالية: ${STAGES[stageIndex].label}`}>
            {STAGES.map((item, index) => <span key={item.id} className={index <= stageIndex ? 'reached' : ''}><i>{index + 1}</i><b>{item.label}</b></span>)}
          </div>
          <p className="hero-kicker">{COPY[stage].kicker}</p>
          <h1 id="hero-title">{COPY[stage].title}</h1>
          <p className="hero-body">{COPY[stage].body}</p>
          {stage === 'need' && <p className="entry-cue"><MousePointer2 /> ابدأ من حاجتك داخل النظام</p>}
          {stage !== 'need' && <button className="restart-action" type="button" onClick={restart}>ابدأ بحاجة أخرى</button>}
        </div>

        <div className="system-field" aria-live="polite">
          <div className="system-frame" aria-hidden="true"><span>01</span><i /><span>GENERAL SOLUTIONS / DIGITAL SYSTEM</span></div>
          <div className="system-seed" aria-hidden="true">
            <span className="seed-label">نقطة البداية</span>
            <strong>{need?.short || 'احتياج واضح'}</strong>
            <svg viewBox="0 0 420 230"><path className="seed-path" d="M30 115 H132 C172 115 166 42 220 42 H390 M132 115 C172 115 166 115 220 115 H390 M132 115 C172 115 166 188 220 188 H390"/><circle cx="132" cy="115" r="7"/><circle cx="390" cy="42" r="4"/><circle cx="390" cy="115" r="4"/><circle cx="390" cy="188" r="4"/></svg>
          </div>

          <div className="need-selector" aria-label="اختر احتياجك">
            {NEEDS.map((choice, index) => <button type="button" key={choice.id} className={need?.id === choice.id ? 'selected' : ''} onClick={() => { setNeed(choice); setStage('direction'); }}><i>0{index + 1}</i><span>{choice.label}</span><ArrowLeft /></button>)}
          </div>

          <div className="direction-selector" aria-label="اختر اتجاه الحل">
            <p><Compass /> الحاجة المختارة: <strong>{need?.label}</strong></p>
            {DIRECTIONS.map((choice) => <button type="button" key={choice.id} onClick={() => chooseDirection(choice)}><span><strong>{choice.label}</strong><small>{choice.note}</small></span><ArrowLeft /></button>)}
          </div>

          <div className="product-surface">
            <header className="surface-top"><span className="surface-mark">GS</span><div><small>{need?.short || 'نظام يبدأ من احتياجك'}</small><strong>{stage === 'launch' ? 'مسار الطلب' : direction?.label || 'سطح واحد يتشكّل حول الهدف'}</strong></div><span className="surface-mode">{stage === 'launch' ? 'مسار واضح' : buildStep < 2 ? 'تشكيل التجربة' : 'تجربة المنتج'}</span></header>
            <div className="build-phase" aria-label={`مرحلة تشكيل السطح ${buildStep + 1} من 4`}><span>0{Math.min(buildStep + 1, 4)}</span><p>{buildStep === 0 ? 'رتّب الرحلة حول الهدف' : buildStep === 1 ? 'وحّد التجربة' : buildStep === 2 ? 'قرّبها من المستخدم' : 'جرّب المسار'}</p></div>
            <div className="surface-content">
              <div className="surface-copy">
                <small>{need?.short}</small>
                <strong>{stage === 'launch' ? 'طلبك أصبح خطوة واضحة' : buildStep < 2 ? direction?.label : 'ابدأ طلبك بخطوة واحدة'}</strong>
                {buildStep === 0 && <p>نرتّب البداية والقرار والنتيجة في مسارٍ واحد.</p>}
                {buildStep === 1 && <p>يتّسق المحتوى والفعل البصري حول ما يهم المستخدم.</p>}
                {buildStep >= 2 && stage !== 'launch' && <p>صف ما تحتاجه؛ هذه الخطوة نفسها ستبدأ التسليم.</p>}
                {stage === 'launch' && <p>انتقل الفعل من الواجهة إلى نتيجة مفهومة دون انقطاع.</p>}
              </div>
              <div className="surface-visual" aria-hidden="true"><span className="visual-word">{stage === 'launch' ? 'تم' : 'ابدأ'}</span><svg viewBox="0 0 260 180"><path d="M24 140 C70 140 70 42 130 42 S194 140 236 140"/><circle cx="24" cy="140" r="6"/><circle cx="130" cy="42" r="9"/><circle cx="236" cy="140" r="6"/></svg><small>{stage === 'launch' ? 'اكتمل المسار' : direction?.label}</small></div>
            </div>
            <div className="surface-workbench">
              {stage === 'build' && buildStep === 0 && <button type="button" onClick={() => setBuildStep(1)}>رتّب الرحلة حول الهدف <ArrowLeft /></button>}
              {stage === 'build' && buildStep === 1 && <button type="button" onClick={() => setBuildStep(2)}>وحّد التجربة <ArrowLeft /></button>}
              {stage === 'build' && buildStep === 2 && <button type="button" onClick={() => setBuildStep(3)}>جرّب المسار <Sparkles /></button>}
              {stage === 'build' && buildStep === 3 && <form onSubmit={(event) => { event.preventDefault(); submitProductAction(); }}><label htmlFor="hero-brief">طلبك المختصر</label><input id="hero-brief" value={brief} onChange={(event) => setBrief(event.target.value)} /><button type="submit" disabled={!brief.trim()}>إرسال الطلب <Send /></button></form>}
              {stage === 'launch' && <div className="resolution-flow"><span><Check /> تم الاستلام</span><i /><span>المراجعة</span><i /><span>خطوة تالية واضحة</span></div>}
            </div>
          </div>
          <p className="system-caption"><span /> نظام واحد يتغيّر مع قرارك</p>
        </div>
      </div>
    </section>
  );
}
