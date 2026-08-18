import { useRef, useState, type KeyboardEvent } from 'react';
import { familyById, solutionFamilies } from '../../data/solutions';
import { getFamilyAssetId, getFamilyVisualAsset } from '../../data/visual/familyVisualAssets';
import type { SolutionFamilyId } from '../../types/solutions';
import './solutionsExploration.css';

export type SolutionsExplorationStartOrigin = 'USER_DIRECT' | 'USER_COMPARE';
export interface SolutionsExplorationProps {
  onStartFamily?: (familyId: SolutionFamilyId, origin: SolutionsExplorationStartOrigin) => void;
  onDiscover?: () => void;
}

type Presentation = { users: string[]; directions: [string, string, string] };
const presentation: Record<SolutionFamilyId, Presentation> = {
  business: { users: ['أصحاب الأعمال', 'فرق التسويق والمحتوى', 'فرق الخدمات والتواصل'], directions: ['حضور خدمي مركز', 'تجربة محتوى وطلب', 'بوابة تعريفية متعددة المسارات'] },
  commerce: { users: ['المتسوقون والعملاء', 'فرق التجارة', 'فرق العلامة والمحتوى'], directions: ['قصة علامة تقود للاكتشاف', 'كتالوج وتجربة اختيار', 'تجارة مرتبطة بالمحتوى'] },
  booking: { users: ['العملاء', 'فرق الاستقبال والخدمة', 'المشرفون على المواعيد'], directions: ['تجربة حجز موجهة', 'مساحة عميل ومواعيد', 'تجربة عميل مرتبطة بالتشغيل'] },
  assets: { users: ['الباحثون عن أصل', 'فرق المبيعات والتأجير', 'فرق إدارة العرض والبيانات'], directions: ['دليل أصول موجه', 'استكشاف ومقارنة', 'استفسار مرتبط بالأصل'] },
  portals: { users: ['الفرق الداخلية', 'أصحاب الطلبات', 'المشرفون ومديرو العمليات'], directions: ['بوابة طلبات داخلية', 'مساحة تشغيل وسجلات', 'تجربة فريق مرتبطة بالتكاملات'] },
  knowledge: { users: ['المتعلمون والقراء', 'فرق المحتوى', 'فرق التدريب والمراجعة'], directions: ['مكتبة معرفة موجهة', 'تجربة تعلم منظمة', 'مساحة محتوى وصلاحيات'] },
};

const compare = [
  ['ما الذي يبدأ منه العمل؟', 'اختيار خدمة أو موعد من جانب العميل.', 'طلب أو مهمة أو سجل يحتاج انتقالًا داخل الفريق.'],
  ['من يستخدم الحل أكثر؟', 'العميل أولًا، مع فريق يدير الإتاحة والخدمة.', 'الفريق وأصحاب الطلبات والمشرفون داخل العملية.'],
  ['ماذا يتكرر يوميًا؟', 'اختيار الوقت، التأكيد، التذكير، وإدارة حالة الموعد.', 'استلام الطلبات، تحديث الحالات، التوزيع، والمتابعة بين الأدوار.'],
  ['متى يصبح هذا الاتجاه أنسب؟', 'عندما تكون رحلة الوصول إلى خدمة أو موعد هي محور التجربة.', 'عندما تكون حركة العمل الداخلية والطلبات والسجلات هي محور النظام.'],
  ['ما الذي قد يرفع حجم المشروع؟', 'الموارد والسعات والاستثناءات والدفع أو التقويم عند الحاجة.', 'تعدد الأدوار والموافقات والسجلات والتكاملات وقواعد التشغيل.'],
] as const;

function Asset({ familyId, role, alt = '', className }: { familyId: SolutionFamilyId; role: 'MASTER' | 'EMBLEM' | 'COMPARE' | 'DIR-01' | 'DIR-02' | 'DIR-03' | 'CTX-01' | 'CTX-02'; alt?: string; className?: string }) {
  const asset = getFamilyVisualAsset(getFamilyAssetId(familyId, role));
  if (!asset?.runtimeUrl) return null;
  return <img src={asset.runtimeUrl} alt={alt} className={className} data-asset-id={asset.id} data-asset-status="approved-bound" />;
}

function formatReferenceCode(code: string) {
  return code.replace(/^RP(\d{2})$/, 'RP-$1');
}

export function SolutionsExploration({ onStartFamily, onDiscover }: SolutionsExplorationProps) {
  const [familyId, setFamilyId] = useState<SolutionFamilyId>('booking');
  const [mode, setMode] = useState<'explore' | 'compare'>('explore');
  const [compareIndex, setCompareIndex] = useState(0);
  const [summary, setSummary] = useState(false);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const family = familyById[familyId];
  const meta = presentation[familyId];
  const reference = family.reference;
  const referenceAvailable = Boolean(reference.code) && reference.evidenceState !== 'NOT_AVAILABLE';

  const choose = (id: SolutionFamilyId) => { setFamilyId(id); setMode('explore'); };
  const move = (index: number) => {
    const next = solutionFamilies[index];
    if (!next) return;
    choose(next.id);
    requestAnimationFrame(() => refs.current[index]?.focus());
  };
  const key = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | undefined;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % solutionFamilies.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + solutionFamilies.length) % solutionFamilies.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = solutionFamilies.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    move(next);
  };
  const openCompare = () => { setMode('compare'); setCompareIndex(0); setSummary(false); };
  const closeCompare = () => { setMode('explore'); setCompareIndex(0); setSummary(false); };

  return <section id="solutions-exploration" className="solutions-exploration" dir="rtl" data-mode={mode} data-family={familyId} aria-labelledby="solutions-page-title">
    <header className="solutions-exploration__intro">
      <p className="solutions-eyebrow">SOLUTIONS · ما الذي يمكن أن نبنيه؟</p>
      <h1 id="solutions-page-title">ست عائلات للحلول، ومساحة واحدة لفهم الاتجاه الأقرب.</h1>
      <p>استكشف طبيعة كل حل كما يمكن أن يعمل في الواقع. لا تحتاج إلى تكوين مشروعك هنا؛ اختر عائلة لفهمها، ثم انتقل إلى START عندما تريد تحويل الاتجاه إلى مشروعك.</p>
      <button type="button" className="solutions-link" onClick={onDiscover}>لست متأكدًا من الاتجاه؟ ساعدني على الاختيار</button>
    </header>

    {mode === 'explore' ? <div className="solutions-stage">
      <nav className="solutions-browser" aria-label="عائلات الحلول">
        <div className="solutions-browser__rail" role="tablist" aria-label="اختر عائلة حل لاستكشافها" aria-orientation="vertical">
          {solutionFamilies.map((item, index) => {
            const active = item.id === familyId;
            return <button key={item.id} ref={(node) => { refs.current[index] = node; }} id={`solutions-family-${item.id}`} type="button" role="tab" aria-selected={active} aria-controls="solutions-selected-family" tabIndex={active ? 0 : -1} className="solutions-family-tab" data-family-id={item.id} onClick={() => choose(item.id)} onKeyDown={(event) => key(event, index)}>
              <Asset familyId={item.id} role="EMBLEM" className="solutions-family-tab__image" />
              <span className="solutions-family-tab__number" aria-hidden="true">{item.number}</span>
              <span><strong>{item.title}</strong><small>{item.cue}</small></span>
            </button>;
          })}
        </div>
        <button type="button" className="solutions-compare-trigger" onClick={openCompare}>قارن الحجوزات بالتشغيل</button>
      </nav>

      <article id="solutions-selected-family" role="tabpanel" aria-labelledby={`solutions-family-${familyId}`} className="solutions-selected">
        <div className="solutions-selected__lead">
          <div className="solutions-selected__copy">
            <p className="solutions-eyebrow">{family.number} · اتجاه مفتوح للاستكشاف</p>
            <h2>{family.title}</h2>
            <p className="solutions-selected__problem">{family.problem}</p>
            <div className="solutions-fit-grid">
              <section><h3>متى يناسبني هذا النوع؟</h3><ul>{family.fits.map((item) => <li key={item}>{item}</li>)}</ul></section>
              <section><h3>من يستخدمه؟</h3><ul>{meta.users.map((item) => <li key={item}>{item}</li>)}</ul></section>
            </div>
            <div className="solutions-actions">
              <button type="button" className="solutions-primary" onClick={() => onStartFamily?.(familyId, 'USER_DIRECT')}>ابدأ من هذا الاتجاه</button>
              {(familyId === 'booking' || familyId === 'portals') && <button type="button" className="solutions-secondary" onClick={openCompare}>قارن بالحجوزات والتشغيل</button>}
            </div>
          </div>
          <figure className="solutions-scene"><Asset familyId={familyId} role="MASTER" alt={`مشهد منتج معتمد يوضح طبيعة ${family.title}`} /><figcaption><span>Product Scene</span> يوضح طبيعة هذا الاتجاه، وليس واجهة جاهزة للبيع أو شكلًا نهائيًا لمشروعك.</figcaption></figure>
        </div>

        <section className="solutions-loop" aria-labelledby="solutions-how"><div className="solutions-heading"><p>كيف يعمل؟</p><h3 id="solutions-how">حلقة العمل الأساسية</h3></div><ol>{family.operatingLoop.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong></li>)}</ol></section>

        <section className="solutions-directions" aria-labelledby="solutions-directions"><div className="solutions-heading"><p>Product Directions</p><h3 id="solutions-directions">أشكال ممكنة يمكن أن يأخذها الحل</h3><small>اتجاهات استكشافية، وليست قوالب أو باقات أو منتجات جاهزة للبيع.</small></div><div className="solutions-directions__grid">{meta.directions.map((direction, index) => <figure key={direction}><Asset familyId={familyId} role={`DIR-0${index + 1}` as 'DIR-01' | 'DIR-02' | 'DIR-03'} alt={`${direction} — شكل ممكن لعائلة ${family.title}`} /><figcaption><span>0{index + 1}</span><strong>{direction}</strong></figcaption></figure>)}</div></section>

        <div className="solutions-detail-band">
          <section className="solutions-includes"><h3>ما الذي يمكن أن يتضمنه؟</h3><p>أمثلة على قدرات شائعة في هذه العائلة، وليست اختيارات مشروعك أو تكوينًا محسومًا.</p><ul>{family.capabilities.map((capability) => <li key={capability.name}>{capability.name}</li>)}</ul></section>
          <aside className="solutions-budget" aria-label="اتجاه مالي واسع"><p>اتجاه مالي واسع</p><strong dir="ltr">من نحو USD 8k إلى USD 30k+</strong><span>اتجاه استكشافي غير ملزم وليس عرض سعر. يتغير الحجم حسب عمق التشغيل والتكاملات والبيانات. يعطي START تقديرًا أدق بعد فهم المشروع.</span><small>{family.complexityNote}</small></aside>
        </div>

        <section className="solutions-proof"><div className="solutions-heading"><p>تفاصيل إضافية عند الحاجة</p><h3>مشاهد أقرب إلى سلوك المنتج</h3></div><div className="solutions-proof__grid"><details><summary>لحظة من جهة المستخدم</summary><Asset familyId={familyId} role="CTX-01" alt={`لقطة سياقية معتمدة من جهة المستخدم لعائلة ${family.title}`} /></details><details><summary>لحظة من داخل التشغيل</summary><Asset familyId={familyId} role="CTX-02" alt={`لقطة سياقية معتمدة من داخل تشغيل عائلة ${family.title}`} /></details></div></section>

        <aside className="solutions-reference" aria-label="السياق المرجعي للعائلة المحددة" data-reference-state={referenceAvailable ? 'available' : 'unavailable'} data-reference-code={reference.code ?? 'none'}>
          <p>{referenceAvailable ? 'مثال سياقي محدود' : 'حالة المرجع المتاح'}</p>
          {referenceAvailable && reference.code ? <>
            <h3><bdi dir="ltr">{formatReferenceCode(reference.code)}</bdi> — {reference.title}</h3>
            <span>{reference.note}</span>
            <small>مرجع سياقي لفهم طبيعة الاتجاه فقط؛ لا يثبت نطاق مشروعك ولا ينشئ صفحة مشروع أو دراسة حالة.</small>
          </> : <>
            <h3>{reference.title}</h3>
            <span>{reference.note}</span>
          </>}
        </aside>

        <footer className="solutions-footer"><div><p>هل صار الاتجاه أوضح؟</p><strong>{family.nextDecision}</strong></div><button type="button" className="solutions-primary" onClick={() => onStartFamily?.(familyId, 'USER_DIRECT')}>ابدأ من هذا الاتجاه</button></footer>
      </article>
    </div> : <section className="solutions-compare" aria-labelledby="solutions-compare-title">
      <header className="solutions-compare__header"><div><p className="solutions-eyebrow">COMPARE · داخل SOLUTIONS</p><h2 id="solutions-compare-title">الحجوزات والخدمات أم الأنظمة التشغيلية والبوابات؟</h2><span>السؤال ليس من يملك خصائص أكثر، بل ما الذي يدور حوله النظام أساسًا.</span></div><button type="button" className="solutions-secondary" onClick={closeCompare}>العودة إلى جميع الحلول</button></header>
      <div className="solutions-compare__visuals" aria-hidden="true"><Asset familyId="booking" role="COMPARE" /><div><span>رحلة العميل إلى الخدمة والموعد</span><i /><span>عمل الفريق والطلبات والسجلات</span></div><Asset familyId="portals" role="COMPARE" /></div>
      <div className="solutions-compare__desktop" aria-label="مقارنة موجزة بين الاتجاهين"><div className="solutions-compare__title"><strong>الحجوزات والخدمات</strong><span>محورها رحلة العميل إلى الخدمة أو الموعد.</span></div><div className="solutions-compare__title solutions-compare__title--ops"><strong>الأنظمة التشغيلية والبوابات</strong><span>محورها عمل الفريق والطلبات والسجلات الداخلية.</span></div>{compare.map(([question, booking, portals]) => <article className="solutions-compare-row" key={question}><h3>{question}</h3><p>{booking}</p><p>{portals}</p></article>)}</div>
      <div className="solutions-compare__mobile" aria-live="polite">{!summary ? <article className="solutions-compare-step" data-compare-step={compareIndex + 1}><p>سؤال {compareIndex + 1} من {compare.length}</p><h3>{compare[compareIndex][0]}</h3><section><strong>الحجوزات والخدمات</strong><span>{compare[compareIndex][1]}</span></section><section><strong>الأنظمة التشغيلية والبوابات</strong><span>{compare[compareIndex][2]}</span></section><div className="solutions-actions"><button type="button" className="solutions-secondary" disabled={compareIndex === 0} onClick={() => setCompareIndex((value) => Math.max(0, value - 1))}>السابق</button><button type="button" className="solutions-primary" onClick={() => compareIndex === compare.length - 1 ? setSummary(true) : setCompareIndex((value) => value + 1)}>{compareIndex === compare.length - 1 ? 'عرض الخلاصة' : 'السؤال التالي'}</button></div></article> : <article className="solutions-compare-summary"><p>الخلاصة</p><h3>اختر المركز الحقيقي للعمل، لا قائمة الخصائص المشتركة.</h3><span>المستخدمون والإشعارات والإدارة والتكاملات قد توجد في الاتجاهين. الفرق هو ما إذا كان النظام يبدأ من رحلة العميل للخدمة، أم من حركة العمل داخل الفريق.</span></article>}</div>
      <footer className="solutions-compare__actions"><button type="button" className="solutions-primary" onClick={() => onStartFamily?.('booking', 'USER_COMPARE')}>ابدأ من الحجوزات والخدمات</button><button type="button" className="solutions-primary solutions-primary--ops" onClick={() => onStartFamily?.('portals', 'USER_COMPARE')}>ابدأ من الأنظمة التشغيلية والبوابات</button><button type="button" className="solutions-link" onClick={closeCompare}>لم أحسم بعد — ارجع إلى جميع الحلول</button></footer>
    </section>}
  </section>;
}
