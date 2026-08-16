import { ArrowLeft, Check, Eye, X } from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  PROVISIONAL_START_PRICING,
  START_ENTRY_INTENTS,
  START_MAJOR_STAGES,
  formatBudgetBand,
  getDecisionConsequence,
  getFamilyDecisions,
  getFamilyJourney,
  getStartFamily,
  isStartFamilyId,
  recommendStartFamily,
  startConfigurationDirections,
  startFamilies,
  type StartDecisionAnswer,
  type StartEntryIntent,
  type StartFamilyId,
  type StartStageId,
} from '../../data/start-discovery/startExperience';
import {
  getFamilyAssetId,
  getFamilyVisualAsset,
  type FamilyVisualAsset,
} from '../../data/visual/familyVisualAssets';
import type {
  DiscoveryCapabilitySelection,
  StartDiscoveryBodyProps,
  StartDiscoveryDraft,
  StartDiscoveryPrefill,
} from '../../types/start-discovery';
import { buildDiscoverySummary, createStartDiscoveryDraft } from './discoveryModel';
import './start-discovery.css';

const SESSION_KEY = 'gs-start-frozen-product-v1';

type Answers = Record<string, StartDecisionAnswer>;

interface LocalState {
  stage: StartStageId;
  furthest: StartStageId;
  discoverStep: 0 | 1 | 2;
  intent?: StartEntryIntent;
  recommended: StartFamilyId;
  selected?: StartFamilyId;
  decisionIndex: number;
  answers: Answers;
  experience: string;
}

interface StoredState {
  local: LocalState;
  draft: StartDiscoveryDraft;
}

function unique(values: readonly string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function familyFromPrefill(prefill?: StartDiscoveryPrefill): StartFamilyId | undefined {
  if (isStartFamilyId(prefill?.solutionFamilyId)) return prefill.solutionFamilyId;
  return startFamilies.find((family) => family.title === prefill?.recommendedFamily)?.id;
}

function userAlreadySelected(prefill?: StartDiscoveryPrefill) {
  return Boolean(prefill?.decisionOrigin && prefill.decisionOrigin !== 'SYSTEM_FINDER');
}

function readStored(): StoredState | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) ?? 'null') as StoredState | null;
    if (!parsed || !START_MAJOR_STAGES.some((stage) => stage.id === parsed.local?.stage)) return undefined;
    if (!isStartFamilyId(parsed.local.recommended)) return undefined;
    if (parsed.local.selected && !isStartFamilyId(parsed.local.selected)) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

function initialLocal(prefill?: StartDiscoveryPrefill): LocalState {
  if (!prefill) {
    const stored = readStored();
    if (stored) return stored.local;
  }
  const family = familyFromPrefill(prefill) ?? 'business';
  return {
    stage: 'discover',
    furthest: 'discover',
    discoverStep: prefill ? 2 : 0,
    recommended: family,
    selected: prefill && userAlreadySelected(prefill) ? family : undefined,
    decisionIndex: 0,
    answers: {},
    experience: 'focused',
  };
}

function initialDraft(prefill?: StartDiscoveryPrefill, initialCertainty?: StartDiscoveryBodyProps['initialCertainty']) {
  if (!prefill) {
    const stored = readStored();
    if (stored?.draft) return stored.draft;
  }
  return createStartDiscoveryDraft(prefill, initialCertainty);
}

function AssetSlot({ asset, alt, decorative = false }: { asset?: FamilyVisualAsset; alt: string; decorative?: boolean }) {
  if (!asset) return null;
  if (!asset.runtimeUrl) {
    return (
      <div
        className="sfp-asset-slot"
        data-asset-id={asset.id}
        data-asset-status={asset.status === 'UNRESOLVED' ? 'unresolved' : 'approved-unbound'}
        aria-hidden={decorative || undefined}
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : `${alt} — الأصل البصري بانتظار الربط التشغيلي.`}
      >
        <span aria-hidden="true">{asset.status === 'UNRESOLVED' ? '◇' : 'GS'}</span>
      </div>
    );
  }
  return <img src={asset.runtimeUrl} alt={decorative ? '' : alt} aria-hidden={decorative || undefined} data-asset-id={asset.id} />;
}

function StageRail({ current, furthest, onChange }: { current: StartStageId; furthest: StartStageId; onChange: (stage: StartStageId) => void }) {
  const currentIndex = START_MAJOR_STAGES.findIndex((stage) => stage.id === current);
  const furthestIndex = START_MAJOR_STAGES.findIndex((stage) => stage.id === furthest);
  return (
    <nav className="sfp-stage-rail" aria-label="مراحل البدء">
      <ol>
        {START_MAJOR_STAGES.map((stage, index) => (
          <li key={stage.id} data-stage-state={stage.id === current ? 'current' : index < currentIndex ? 'complete' : 'future'}>
            <button type="button" disabled={index > furthestIndex} aria-current={stage.id === current ? 'step' : undefined} onClick={() => onChange(stage.id)}>
              <bdi>{stage.number}</bdi><span>{stage.label}</span>
              {index < currentIndex ? <Check aria-hidden="true" /> : null}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Pulse({ goal, recommended, selected, budget, reviewNeeds }: { goal: string; recommended: StartFamilyId; selected?: StartFamilyId; budget: string; reviewNeeds?: readonly string[] }) {
  return (
    <aside className="sfp-pulse" data-testid="project-pulse" aria-labelledby="sfp-pulse-title">
      <span>الحالة الحالية</span><h2 id="sfp-pulse-title">مشروعك الآن</h2>
      <dl>
        {goal ? <div><dt>الهدف</dt><dd>{goal}</dd></div> : null}
        <div><dt>الاتجاه المقترح</dt><dd>{getStartFamily(recommended).title}</dd></div>
        <div><dt>اختيارك</dt><dd>{selected ? getStartFamily(selected).title : 'لم تعتمد اتجاهًا بعد.'}</dd></div>
        <div><dt>الميزانية التقريبية</dt><dd><bdi dir="ltr">USD {budget}</bdi></dd></div>
        {reviewNeeds?.length ? <div><dt>يحتاج مراجعة</dt><dd>{reviewNeeds.slice(0, 2).join('، ')}</dd></div> : null}
      </dl>
    </aside>
  );
}

function RadioGroup({ label, children }: { label: string; children: ReactNode }) {
  return <div className="sfp-radio-group" role="radiogroup" aria-label={label}>{children}</div>;
}

function Drawer({ open, asset, familyTitle, onClose, trigger }: { open: boolean; asset?: FamilyVisualAsset; familyTitle: string; onClose: () => void; trigger: React.RefObject<HTMLButtonElement | null> }) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    close.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
      trigger.current?.focus();
    };
  }, [open, trigger]);
  if (!open) return null;
  const trap = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
    if (event.key !== 'Tab') return;
    const nodes = [...(panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])') ?? [])];
    if (!nodes.length) return;
    const first = nodes[0]; const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  return (
    <div className="sfp-drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={panel} className="sfp-drawer" role="dialog" aria-modal="true" aria-labelledby="sfp-drawer-title" onKeyDown={trap}>
        <button ref={close} type="button" className="sfp-drawer-close" onClick={onClose} aria-label="إغلاق المثال"><X /></button>
        <span className="sfp-eyebrow">مثال سياقي</span><h2 id="sfp-drawer-title">كيف يمكن أن يبدو جزء من {familyTitle}؟</h2>
        <AssetSlot asset={asset} alt={`مثال سياقي لعائلة ${familyTitle}`} />
        <div className="sfp-drawer-copy">
          <p><strong>ما الذي يعرضه؟</strong> يوضح اتجاهًا بصريًا وسياق استخدام مرتبطًا بالقرار الحالي.</p>
          <p><strong>ما الذي لا يعرضه؟</strong> ليس تصميمًا نهائيًا ولا يثبت كل الوظائف أو التكاملات.</p>
          {asset?.status === 'UNRESOLVED' ? <p data-asset-note="pending">المثال البصري لهذا السياق لم يُعتمد بعد.</p> : null}
          {asset?.status === 'APPROVED_UNBOUND' ? <p data-asset-note="unbound">الأصل البصري المعتمد بانتظار الربط التشغيلي.</p> : null}
        </div>
      </div>
    </div>
  );
}

export function StartDiscoveryBody({ prefill, initialCertainty, className = '', onDraftChange, onLocalComplete }: StartDiscoveryBodyProps) {
  const [draft, setDraft] = useState<StartDiscoveryDraft>(() => initialDraft(prefill, initialCertainty));
  const [local, setLocal] = useState<LocalState>(() => initialLocal(prefill));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const exampleTrigger = useRef<HTMLButtonElement>(null);

  const activeFamilyId = local.selected ?? local.recommended;
  const activeFamily = getStartFamily(activeFamilyId);
  const decisions = useMemo(() => getFamilyDecisions(activeFamilyId), [activeFamilyId]);
  const currentDecision = decisions[Math.min(local.decisionIndex, Math.max(0, decisions.length - 1))];
  const currentAnswer = currentDecision ? local.answers[currentDecision.id] : undefined;
  const currentConsequence = currentDecision && currentAnswer ? getDecisionConsequence(activeFamilyId, currentDecision, currentAnswer) : undefined;
  const materialEffect = decisions.some((decision) => {
    const answer = local.answers[decision.id];
    return answer ? getDecisionConsequence(activeFamilyId, decision, answer).material : false;
  });
  const budgetBand = formatBudgetBand(materialEffect);
  const journey = getFamilyJourney(activeFamilyId);
  const experienceDirection = startConfigurationDirections.find((item) => item.id === local.experience) ?? startConfigurationDirections[0];
  const reviewNeeds = unique([
    ...draft.unknowns,
    ...decisions.filter((decision) => local.answers[decision.id] === 'unknown').map((decision) => decision.capabilityName),
    ...decisions.filter((decision) => local.answers[decision.id] === 'yes' && getDecisionConsequence(activeFamilyId, decision, 'yes').material).map((decision) => `تحقق ${decision.capabilityName}`),
  ]).slice(0, 3);
  const goal = draft.objective || draft.capturedFacts?.outcome || draft.currentProblem;
  const familyCode = String(startFamilies.findIndex((family) => family.id === activeFamilyId) + 1).padStart(2, '0');
  const masterAsset = getFamilyVisualAsset(getFamilyAssetId(activeFamilyId, 'MASTER'));
  const contextAsset = getFamilyVisualAsset(getFamilyAssetId(activeFamilyId, 'CTX-01'));

  useEffect(() => { onDraftChange?.(draft); }, [draft, onDraftChange]);
  useEffect(() => {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ local, draft } satisfies StoredState));
  }, [local, draft]);
  useEffect(() => { window.requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true })); }, [local.stage]);

  const patchDraft = (patch: Partial<StartDiscoveryDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const setStage = (stage: StartStageId) => {
    const order = START_MAJOR_STAGES.map((item) => item.id);
    setLocal((current) => ({ ...current, stage, furthest: order.indexOf(stage) > order.indexOf(current.furthest) ? stage : current.furthest }));
  };

  const buildRecommendation = () => {
    const family = recommendStartFamily(`${draft.currentProblem} ${draft.objective} ${draft.intendedUsers}`);
    setLocal((current) => ({ ...current, recommended: family, discoverStep: 2 }));
    patchDraft({ recommendedFamily: getStartFamily(family).title, solutionFamilyId: family });
  };

  const chooseFamily = (familyId: StartFamilyId) => {
    const family = getStartFamily(familyId);
    const inherited = draft.capabilitySelections.filter((selection) => family.capabilities.some((capability) => capability.name === selection.name));
    setLocal((current) => ({ ...current, selected: familyId, decisionIndex: 0, answers: {} }));
    patchDraft({
      solutionFamilyId: familyId,
      recommendedFamily: family.title,
      decisionOrigin: 'USER_DIRECT',
      selectedCapabilities: inherited.filter((selection) => selection.provenance === 'USER_SELECTED').map((selection) => selection.name),
      capabilitySelections: inherited,
    });
  };

  const selectAnswer = (answer: StartDecisionAnswer) => {
    if (!currentDecision) return;
    const capability = activeFamily.capabilities.find((item) => item.name === currentDecision.capabilityName);
    const without = draft.capabilitySelections.filter((selection) => selection.name !== currentDecision.capabilityName);
    let selections: DiscoveryCapabilitySelection[] = without;
    if (answer === 'yes' && capability) {
      selections = [...without, { name: capability.name, classification: capability.classification, provenance: 'USER_SELECTED' }];
    }
    setLocal((current) => ({ ...current, answers: { ...current.answers, [currentDecision.id]: answer } }));
    patchDraft({
      capabilitySelections: selections,
      selectedCapabilities: selections.filter((selection) => selection.provenance === 'USER_SELECTED').map((selection) => selection.name),
      uncertainCapabilities: answer === 'unknown' ? unique([...draft.uncertainCapabilities, currentDecision.capabilityName]) : draft.uncertainCapabilities.filter((name) => name !== currentDecision.capabilityName),
    });
  };

  const nextBuild = () => {
    if (currentDecision && !currentAnswer) return;
    if (local.decisionIndex < decisions.length - 1) {
      setLocal((current) => ({ ...current, decisionIndex: current.decisionIndex + 1 }));
      return;
    }
    setStage('review');
  };

  const complete = () => {
    setCompleted(true);
    onLocalComplete?.(buildDiscoverySummary(draft), draft);
  };

  const carriedFactValues = [
    draft.capturedFacts?.outcome && `النتيجة: ${draft.capturedFacts.outcome}`,
    draft.capturedFacts?.activity && `النشاط: ${draft.capturedFacts.activity}`,
    draft.capturedFacts?.audience && `الجمهور: ${draft.capturedFacts.audience}`,
    draft.capturedFacts?.complexity && `العمق: ${draft.capturedFacts.complexity}`,
    draft.capturedFacts?.constraints && `القيد: ${draft.capturedFacts.constraints}`,
  ].filter(Boolean) as string[];
  const carriedFacts = carriedFactValues.join(' · ');

  const discover = (
    <section className="sfp-stage sfp-discover" aria-labelledby="start-discovery-title">
      <header className="sfp-stage-heading">
        <p className="sfp-eyebrow">المرحلة 01 · اكتشف ما يناسبك</p>
        <h1 id="start-discovery-title" ref={headingRef} tabIndex={-1}>ابدأ بما تريد تغييره، لا باسم منتج جاهز.</h1>
        <p>قدّم فقط ما يكفي لنكوّن اتجاهًا مفيدًا، ثم اعتمده أنت أو غيّره.</p>
      </header>
      {prefill && carriedFacts ? <div className="sfp-carried" data-testid="carried-context" data-carried-facts={carriedFactValues.length > 1 ? 'true' : undefined}><strong>ما نعرفه من قرارك السابق</strong><p>{carriedFacts}</p></div> : null}
      {local.discoverStep === 0 ? (
        <div className="sfp-entry-intents" role="radiogroup" aria-label="نقطة الدخول إلى الاكتشاف">
          <h2>كيف تفضّل أن تبدأ؟</h2>
          {START_ENTRY_INTENTS.map((intent) => <button key={intent.id} type="button" role="radio" aria-checked={local.intent === intent.id} onKeyDown={(event) => { if (event.key === ' ') { event.preventDefault(); setLocal((current) => ({ ...current, intent: intent.id })); } }} onClick={() => setLocal((current) => ({ ...current, intent: intent.id, discoverStep: 1 }))}><strong>{intent.label}</strong><small>{intent.description}</small>{local.intent === intent.id ? <Check aria-hidden="true" /> : <ArrowLeft aria-hidden="true" />}</button>)}
        </div>
      ) : null}
      {local.discoverStep === 1 ? (
        <div className="sfp-discovery-fields">
          <label>ما الذي تريد تغييره؟<textarea dir="auto" value={draft.currentProblem} onChange={(event) => patchDraft({ currentProblem: event.target.value })} placeholder="مثال: أريد جعل حجز الخدمة أوضح وأسهل." /></label>
          <label>من سيستخدم هذا الحل؟<input dir="auto" value={draft.intendedUsers} onChange={(event) => patchDraft({ intendedUsers: event.target.value })} placeholder="العملاء، فريق الخدمة، أو أطراف أخرى" /></label>
          <label>ما النتيجة التي تريد الوصول إليها؟<textarea dir="auto" value={draft.objective} onChange={(event) => patchDraft({ objective: event.target.value })} placeholder="صف النتيجة التي تهمك بجملة قصيرة." /></label>
          <button type="button" className="sfp-primary" disabled={!draft.currentProblem.trim()} onClick={buildRecommendation}>ابنِ اتجاهًا أوليًا <ArrowLeft /></button>
        </div>
      ) : null}
      {local.discoverStep === 2 ? (
        <div className="sfp-recommendation-grid">
          <main>
            <div className="sfp-recommendation" data-testid="system-recommendation">
              <span>ما نوصي به</span><h2>{getStartFamily(local.recommended).title}</h2><p>نعتقد أن هذا الاتجاه يناسب ما نعرفه الآن؛ التوصية ليست اختيارًا نيابةً عنك.</p>
              <AssetSlot asset={getFamilyVisualAsset(getFamilyAssetId(local.recommended, 'MASTER'))} alt={`مشهد عائلة ${getStartFamily(local.recommended).title}`} />
            </div>
            <div className="sfp-user-selection" data-testid="user-selection"><span>اختيارك</span><strong>{local.selected ? getStartFamily(local.selected).title : 'لم تعتمد اتجاهًا بعد.'}</strong></div>
            <div className="sfp-budget"><span>{PROVISIONAL_START_PRICING.label}</span><strong><bdi dir="ltr">USD {formatBudgetBand(false)}</bdi></strong><small>{PROVISIONAL_START_PRICING.disclaimer}</small></div>
            <button type="button" className="sfp-primary" onClick={() => { chooseFamily(local.selected ?? local.recommended); setStage('build'); }}>اختر هذا الاتجاه <ArrowLeft /></button>
            <details className="sfp-family-explorer"><summary>قارن أو اختر اتجاهًا آخر</summary><div>{startFamilies.map((family) => <button key={family.id} type="button" aria-pressed={local.selected === family.id} onClick={() => chooseFamily(family.id)}><bdi>{family.number}</bdi><span><strong>{family.title}</strong><small>{family.cue}</small></span>{local.selected === family.id ? <Check /> : null}</button>)}</div></details>
          </main>
          <Pulse goal={goal} recommended={local.recommended} selected={local.selected} budget={formatBudgetBand(false)} />
        </div>
      ) : null}
    </section>
  );

  const build = (
    <section className="sfp-stage sfp-build" aria-labelledby="start-build-title">
      <header className="sfp-stage-heading"><p className="sfp-eyebrow">المرحلة 02 · كوّن حلّك</p><h1 id="start-build-title" ref={headingRef} tabIndex={-1}>قرار واحد واضح في كل مرة.</h1><p>{activeFamily.title}</p></header>
      <div className="sfp-build-layout">
        <main>
          <nav className="sfp-journey" aria-label="لحظات رحلة الحل">{journey.map((moment, index) => <span key={moment} data-current={index === Math.min(local.decisionIndex, journey.length - 1) ? 'true' : undefined}><bdi>{String(index + 1).padStart(2, '0')}</bdi>{moment}</span>)}</nav>
          {currentDecision ? <article className="sfp-decision"><span>القرار الحالي</span><h2>{currentDecision.question}</h2><RadioGroup label={currentDecision.question}>{currentDecision.answers.map((answer) => { const selected = currentAnswer === answer.id; return <button key={answer.id} type="button" role="radio" aria-checked={selected} className={selected ? 'is-selected' : ''} onClick={() => selectAnswer(answer.id)}><i aria-hidden="true">{selected ? <Check /> : null}</i><span><strong>{answer.label}</strong><small>{answer.detail}</small></span></button>; })}</RadioGroup></article> : null}
          {currentConsequence ? <section className="sfp-consequence" data-testid="decision-consequence" aria-labelledby="sfp-consequence-title"><span>الأثر الفوري</span><h2 id="sfp-consequence-title">ماذا يتغير؟</h2><div><article><strong>للعميل</strong><p>{currentConsequence.customer}</p></article><article><strong>في الحل</strong><p>{currentConsequence.solution}</p></article><article><strong>في المشروع</strong><p>{currentConsequence.project}</p></article></div></section> : null}
          <section className="sfp-experience" aria-labelledby="sfp-experience-title"><span>اتجاه التجربة</span><h2 id="sfp-experience-title">كيف تريد أن يستخدم العميل الحل؟</h2><RadioGroup label="اتجاه تجربة العميل">{startConfigurationDirections.map((direction, index) => <button key={direction.id} type="button" role="radio" aria-checked={local.experience === direction.id} className={local.experience === direction.id ? 'is-selected' : ''} onClick={() => { setLocal((current) => ({ ...current, experience: direction.id })); patchDraft({ configurationPreference: direction.title }); }}><span><small>{index === 0 ? 'موصى به' : 'بديل'}</small><strong>{direction.shortLabel}</strong><em>{direction.description}</em></span></button>)}</RadioGroup></section>
          <div className="sfp-build-actions"><button ref={exampleTrigger} type="button" className="sfp-example" onClick={() => setDrawerOpen(true)}><Eye /> شاهد مثالًا</button><button type="button" className="sfp-primary" disabled={Boolean(currentDecision && !currentAnswer)} onClick={nextBuild}>{local.decisionIndex < decisions.length - 1 ? 'تابع إلى القرار التالي' : 'احفظ التكوين وتابع'} <ArrowLeft /></button></div>
        </main>
        <Pulse goal={goal} recommended={local.recommended} selected={activeFamilyId} budget={budgetBand} reviewNeeds={reviewNeeds} />
      </div>
      <Drawer open={drawerOpen} asset={contextAsset} familyTitle={activeFamily.title} onClose={() => setDrawerOpen(false)} trigger={exampleTrigger} />
    </section>
  );

  const selectedCapabilityNames = unique([
    ...activeFamily.capabilities.filter((capability) => capability.classification === 'CORE').map((capability) => capability.name),
    ...draft.capabilitySelections.filter((selection) => selection.provenance === 'USER_SELECTED').map((selection) => selection.name),
  ]);
  const externalNeeds = decisions.filter((decision) => local.answers[decision.id] === 'yes' && getDecisionConsequence(activeFamilyId, decision, 'yes').material).map((decision) => decision.capabilityName);

  const review = (
    <section className="sfp-stage sfp-review" aria-labelledby="start-review-title">
      <header className="sfp-stage-heading"><p className="sfp-eyebrow">المرحلة 03 · راجع وابدأ</p><h1 id="start-review-title" ref={headingRef} tabIndex={-1}>مشروعك أصبح واضحًا بما يكفي للبدء</h1><p>راجع ما حددته، وما بقي للمراجعة، ثم ابدأ المشروع بهذا المخطط.</p></header>
      <div className="sfp-review-layout">
        <main className="sfp-blueprint" data-testid="project-blueprint" aria-labelledby="sfp-blueprint-title"><div className="sfp-blueprint-head"><div><span>مخطط مشروعك</span><h2 id="sfp-blueprint-title">{activeFamily.title}</h2></div><AssetSlot asset={masterAsset} alt={`مشهد داعم لعائلة ${activeFamily.title}`} /></div><div className="sfp-blueprint-flow">{journey.map((moment, index) => <details key={moment} open={index < 3}><summary><bdi>{String(index + 1).padStart(2, '0')}</bdi><strong>{moment}</strong></summary><p>{activeFamily.operatingLoop[index % activeFamily.operatingLoop.length]}</p>{index === 0 ? <small>اتجاه التجربة: {experienceDirection.shortLabel}</small> : null}{index === 1 ? <small>النطاق: {selectedCapabilityNames.join('، ')}</small> : null}{index === journey.length - 1 && externalNeeds.length ? <small>خدمات خارجية تحتاج مراجعة: {externalNeeds.join('، ')}</small> : null}</details>)}</div></main>
        <aside className="sfp-project-summary" data-testid="project-summary" aria-labelledby="sfp-summary-title"><span>ملخص واحد للمشروع</span><h2 id="sfp-summary-title">ما الذي سنبدأ منه؟</h2><dl><div><dt>الحل المختار</dt><dd>{activeFamily.title}</dd></div><div><dt>اتجاه التجربة</dt><dd>{experienceDirection.shortLabel}</dd></div><div><dt>النطاق</dt><dd>{selectedCapabilityNames.join('، ')}</dd></div><div><dt>الميزانية التقريبية</dt><dd><bdi dir="ltr">USD {budgetBand}</bdi><small>{PROVISIONAL_START_PRICING.disclaimer}</small></dd></div>{externalNeeds.length ? <div><dt>خدمات خارجية</dt><dd>{externalNeeds.join('، ')}</dd></div> : null}</dl>{reviewNeeds.length ? <section className="sfp-review-needs"><h3>ما الذي سنراجعه معك؟</h3><ul>{reviewNeeds.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}<section className="sfp-ready"><Check aria-hidden="true" /><div><h3>يمكنك المتابعة</h3><p>مشروعك واضح بما يكفي للبدء، وهناك بعض التفاصيل التي سنراجعها معك قبل تثبيت النطاق النهائي.</p></div></section><div className="sfp-final-actions"><button type="button" className="sfp-primary" onClick={complete}>ابدأ المشروع بهذا المخطط <ArrowLeft /></button><button type="button" className="sfp-secondary" onClick={() => setStage('build')}>عدّل مشروعك</button><p>المعلومات التي أدخلتها ستنتقل إلى موجز المشروع لاحقًا، ولن تحتاج إلى إدخالها من جديد.</p>{completed ? <p role="status">تم تجهيز المخطط محليًا للخطوة التالية.</p> : null}</div></aside>
      </div>
    </section>
  );

  return (
    <div className={`start-discovery sfp-start ${className}`.trim()} dir="rtl" data-stage={local.stage} data-major-stage-count="3" data-prefilled={prefill ? 'true' : 'false'} data-certainty={prefill ? 'configured' : local.intent ? 'exploring' : 'unselected'} data-recommended-family={local.recommended} data-selected-family={local.selected ?? ''} data-family-code={`FAM-${familyCode}`}>
      <input type="hidden" id="sd-objective" readOnly value={draft.objective || draft.capturedFacts?.outcome || draft.currentProblem} />
      <div className="sfp-shell"><StageRail current={local.stage} furthest={local.furthest} onChange={setStage} />{local.stage === 'discover' ? discover : null}{local.stage === 'build' ? build : null}{local.stage === 'review' ? review : null}</div>
    </div>
  );
}
