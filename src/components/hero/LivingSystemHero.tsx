import { useState } from 'react';
import { ArrowLeft, Check, Compass, LayoutTemplate, MousePointer2, Palette, Send, Sparkles } from 'lucide-react';
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
  { id: 'build', label: 'التصميم والتطوير' }, { id: 'launch', label: 'الإطلاق والتشغيل' },
];

const COPY: Record<StageId, { kicker: string; title: string; body: string }> = {
  need: { kicker: 'من الحاجة إلى أثرٍ واضح', title: 'نبني أنظمة رقمية', body: 'نبدأ بما تريد تغييره فعلًا، ثم نجعل كل قرارٍ في النظام امتدادًا لهذا الاحتياج.' },
  direction: { kicker: 'اتجاه واحد، بلا ضوضاء', title: 'اختر كيف يصل المستخدم', body: 'شكّل اتجاه الحل داخل النظام نفسه؛ اختيارك هو الذي يعيد ترتيب السطح ويبدأ البناء.' },
  build: { kicker: 'من الهيكل إلى التفاعل', title: 'ابنِ السطح بقرارات حقيقية', body: 'اعتمد البنية، فعّل نظام الواجهة، ثم استخدم المنتج المصغّر كما سيستخدمه الزائر.' },
  launch: { kicker: 'نتيجة هادئة ومتصلة', title: 'الفعل نفسه يبدأ التسليم', body: 'الطلب الذي أرسلته من السطح انتقل إلى مسار توضيحي مفهوم—لا ادعاء عن نظامٍ حي.' },
};

export function LivingSystemHero() {
  const [stage, setStage] = useState<StageId>('need');
  const [need, setNeed] = useState<(typeof NEEDS)[number] | null>(null);
  const [direction, setDirection] = useState<(typeof DIRECTIONS)[number] | null>(null);
  const [buildStep, setBuildStep] = useState(0);
  const [brief, setBrief] = useState('أريد بدء رحلة واضحة');
  const [resolved, setResolved] = useState(false);
  const stageIndex = STAGES.findIndex((item) => item.id === stage);

  const restart = () => {
    setStage('need'); setNeed(null); setDirection(null); setBuildStep(0);
    setBrief('أريد بدء رحلة واضحة'); setResolved(false);
  };

  const chooseDirection = (choice: (typeof DIRECTIONS)[number]) => {
    setDirection(choice);
    setStage('build');
    setBuildStep(0);
  };

  const submitProductAction = () => {
    if (!brief.trim()) return;
    setStage('launch');
    setResolved(true);
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
          <div className="system-orbit orbit-one" /><div className="system-orbit orbit-two" />

          <div className="need-selector" aria-label="اختر احتياجك">
            {NEEDS.map((choice) => <button type="button" key={choice.id} className={need?.id === choice.id ? 'selected' : ''} onClick={() => { setNeed(choice); setStage('direction'); }}><span>{choice.label}</span><ArrowLeft /></button>)}
          </div>

          <div className="direction-selector" aria-label="اختر اتجاه الحل">
            <p><Compass /> الحاجة المختارة: <strong>{need?.label}</strong></p>
            {DIRECTIONS.map((choice) => <button type="button" key={choice.id} onClick={() => chooseDirection(choice)}><span><strong>{choice.label}</strong><small>{choice.note}</small></span><ArrowLeft /></button>)}
          </div>

          <div className="product-surface">
            <header className="surface-top"><span className="surface-mark">GS</span><nav aria-label="معاينة تنقل المنتج"><span>البداية</span><span>الخدمة</span><span>المتابعة</span></nav><small>{stage === 'launch' ? 'مثال توضيحي' : direction?.label}</small></header>
            <div className="build-rail" aria-label="حالة بناء السطح"><span className={buildStep >= 0 ? 'active' : ''}><LayoutTemplate />الهيكل</span><span className={buildStep >= 1 ? 'active' : ''}><Palette />النظام</span><span className={buildStep >= 2 ? 'active' : ''}><Sparkles />السطح</span><span className={buildStep >= 3 ? 'active' : ''}><MousePointer2 />التفاعل</span></div>
            <div className="surface-content">
              <div className="surface-copy">
                <small>{need?.short}</small>
                <strong>{buildStep < 2 ? direction?.label : 'ابدأ طلبك بخطوة واحدة'}</strong>
                {buildStep === 0 && <p>رتّبنا المحتوى حول قرار المستخدم بدل ازدحام الخيارات.</p>}
                {buildStep === 1 && <p>لغة بصرية موحّدة تربط العنوان بالفعل والنتيجة.</p>}
                {buildStep >= 2 && <p>صف ما تحتاجه، وسيصبح هذا الفعل مدخل مسار التسليم.</p>}
              </div>
              <div className="surface-visual" aria-hidden="true"><svg viewBox="0 0 180 140"><path d="M18 104 C45 104 45 35 87 35 S128 104 162 104"/><circle cx="18" cy="104" r="5"/><circle cx="87" cy="35" r="7"/><circle cx="162" cy="104" r="5"/></svg><span>{direction?.label}</span></div>
            </div>
            <div className="surface-workbench">
              {stage === 'build' && buildStep === 0 && <button type="button" onClick={() => setBuildStep(1)}><LayoutTemplate /> اعتمد هذه البنية</button>}
              {stage === 'build' && buildStep === 1 && <button type="button" onClick={() => setBuildStep(2)}><Palette /> فعّل نظام الواجهة</button>}
              {stage === 'build' && buildStep === 2 && <button type="button" onClick={() => setBuildStep(3)}><Sparkles /> افتح تجربة المنتج</button>}
              {stage === 'build' && buildStep === 3 && <form onSubmit={(event) => { event.preventDefault(); submitProductAction(); }}><label htmlFor="hero-brief">طلبك المختصر</label><input id="hero-brief" value={brief} onChange={(event) => setBrief(event.target.value)} /><button type="submit" disabled={!brief.trim()}>إرسال الطلب <Send /></button></form>}
              {stage === 'launch' && <div className="sent-action"><Check /> أُرسل من سطح المنتج</div>}
            </div>
          </div>

          <div className={`handoff ${resolved ? 'resolved' : ''}`}><span className="handoff-icon"><Check /></span><div><small>تدفق توضيحي</small><strong>اكتمل التسليم بوضوح</strong><p>تم الاستلام ← المراجعة ← الإغلاق</p></div></div>
          <p className="system-caption"><span /> نظام واحد يتغيّر مع قرارك</p>
        </div>
      </div>
    </section>
  );
}
