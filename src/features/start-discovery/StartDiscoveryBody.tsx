import { ArrowLeft, ArrowRight, Check, Eye, X } from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import {
  PROVISIONAL_START_PRICING,
  START_ENTRY_INTENTS,
  START_MAJOR_STAGES,
  assessStartRecommendation,
  formatBudgetBand,
  getDecisionConsequence,
  getFamilyBuildSteps,
  getFamilyDecisions,
  getFamilyJourneyModel,
  getRecommendedExperience,
  getStartFamily,
  isStartFamilyId,
  startConfigurationDirections,
  startFamilies,
  type StartDecisionAnswer,
  type StartEntryIntent,
  type StartExperienceId,
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
import './start-ipa-remediation.css';

const SESSION_KEY = 'gs-start-frozen-product-v1';

type Answers = Record<string, StartDecisionAnswer>;
type DiscoverFocusTarget = 'questions' | 'confirmation' | 'recommendation';

interface LocalState {
  stage: StartStageId;
  furthest: StartStageId;
  discoverStep: 0 | 1 | 2;
  contextStep: number;
  intent?: StartEntryIntent;
  recommended?: StartFamilyId;
  recommendationReasons: string[];
  candidateIds: StartFamilyId[];
  selected?: StartFamilyId;
  previewFamily: StartFamilyId;
  buildStepIndex: number;
  furthestBuildStep: number;
  answers: Answers;
  recommendedExperience: StartExperienceId;
  selectedExperience?: StartExperienceId;
}

interface StoredState {
  fingerprint: string;
  local: Partial<LocalState> & { decisionIndex?: number; experience?: StartExperienceId };
  draft: StartDiscoveryDraft;
}

interface RadioOption<Value extends string> {
  value: Value;
  label: string;
  description: string;
  eyebrow?: string;
}

interface BlueprintLayer {
  key: string;
  label: string;
  caption: string;
  nodes: Array<{ id: string; title: string; detail?: string }>;
}

function unique(values: readonly string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function prefillFingerprint(prefill?: StartDiscoveryPrefill) {
  return JSON.stringify(prefill ?? null);
}

function persistStoredState(prefill: StartDiscoveryPrefill | undefined, local: LocalState, draft: StartDiscoveryDraft) {
  window.sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ fingerprint: prefillFingerprint(prefill), local, draft } satisfies StoredState),
  );
}

function recommendationFromPrefill(prefill?: StartDiscoveryPrefill): StartFamilyId | undefined {
  const titleMatch = startFamilies.find((family) => family.title === prefill?.recommendedFamily)?.id;
  if (titleMatch) return titleMatch;
  if (prefill?.decisionOrigin === 'SYSTEM_FINDER' && isStartFamilyId(prefill.solutionFamilyId)) {
    return prefill.solutionFamilyId;
  }
  return undefined;
}

function selectionFromPrefill(prefill?: StartDiscoveryPrefill): StartFamilyId | undefined {
  if (prefill?.decisionOrigin === 'SYSTEM_FINDER') return undefined;
  return isStartFamilyId(prefill?.solutionFamilyId) ? prefill.solutionFamilyId : undefined;
}

function experienceFromPrefill(prefill: StartDiscoveryPrefill | undefined, familyId: StartFamilyId) {
  return startConfigurationDirections.find(
    (direction) => direction.title === prefill?.configurationPreference,
  )?.id ?? getRecommendedExperience(familyId);
}

function normalizeStored(prefill?: StartDiscoveryPrefill): StoredState | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) ?? 'null') as StoredState | null;
    if (!parsed || parsed.fingerprint !== prefillFingerprint(prefill)) return undefined;
    if (!START_MAJOR_STAGES.some((stage) => stage.id === parsed.local?.stage)) return undefined;
    const fallbackFamily = selectionFromPrefill(prefill) ?? recommendationFromPrefill(prefill) ?? 'business';
    const recommended = isStartFamilyId(parsed.local.recommended) ? parsed.local.recommended : recommendationFromPrefill(prefill);
    const selected = isStartFamilyId(parsed.local.selected) ? parsed.local.selected : selectionFromPrefill(prefill);
    const previewFamily = isStartFamilyId(parsed.local.previewFamily) ? parsed.local.previewFamily : selected ?? recommended ?? fallbackFamily;
    const stage = parsed.local.stage ?? 'discover';
    const storedFurthest = parsed.local.furthest;
    const furthest: StartStageId = storedFurthest && START_MAJOR_STAGES.some((item) => item.id === storedFurthest) ? storedFurthest : stage;
    parsed.local = {
      stage,
      furthest,
      discoverStep: parsed.local.discoverStep === 1 || parsed.local.discoverStep === 2 ? parsed.local.discoverStep : 0,
      contextStep: Number.isInteger(parsed.local.contextStep) ? Math.max(0, parsed.local.contextStep ?? 0) : 0,
      intent: parsed.local.intent,
      recommended,
      recommendationReasons: parsed.local.recommendationReasons ?? (recommended ? [getStartFamily(recommended).problem] : []),
      candidateIds: (parsed.local.candidateIds ?? []).filter(isStartFamilyId),
      selected,
      previewFamily,
      buildStepIndex: parsed.local.buildStepIndex ?? parsed.local.decisionIndex ?? 0,
      furthestBuildStep: parsed.local.furthestBuildStep ?? parsed.local.decisionIndex ?? 0,
      answers: parsed.local.answers ?? {},
      recommendedExperience: parsed.local.recommendedExperience ?? parsed.local.experience ?? experienceFromPrefill(prefill, previewFamily),
      selectedExperience: parsed.local.selectedExperience,
    };
    return parsed;
  } catch {
    return undefined;
  }
}

function initialLocal(prefill?: StartDiscoveryPrefill): LocalState {
  const stored = normalizeStored(prefill);
  if (stored) return stored.local as LocalState;
  const recommended = recommendationFromPrefill(prefill);
  const selected = selectionFromPrefill(prefill);
  const previewFamily = selected ?? recommended ?? 'business';
  return {
    stage: 'discover',
    furthest: 'discover',
    discoverStep: prefill ? 2 : 0,
    contextStep: 0,
    recommended,
    recommendationReasons: recommended ? [getStartFamily(recommended).problem] : [],
    candidateIds: [],
    selected,
    previewFamily,
    buildStepIndex: 0,
    furthestBuildStep: 0,
    answers: {},
    recommendedExperience: experienceFromPrefill(prefill, previewFamily),
  };
}

function initialDraft(prefill?: StartDiscoveryPrefill, initialCertainty?: StartDiscoveryBodyProps['initialCertainty']) {
  const stored = normalizeStored(prefill);
  if (stored?.draft) return stored.draft;
  return createStartDiscoveryDraft(prefill, initialCertainty);
}

function AssetSlot({ asset, alt, decorative = false, className = '' }: { asset?: FamilyVisualAsset; alt: string; decorative?: boolean; className?: string }) {
  if (!asset) return null;
  if (!asset.runtimeUrl) {
    return (
      <div
        className={`sfp-asset-slot ${className}`.trim()}
        data-asset-id={asset.id}
        data-asset-status="unresolved"
        aria-hidden={decorative || undefined}
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : `${alt} — المثال البصري لهذا السياق لم يُعتمد بعد.`}
      >
        <span aria-hidden="true">المثال البصري غير معتمد بعد</span>
      </div>
    );
  }
  return <img className={className || undefined} src={asset.runtimeUrl} alt={decorative ? '' : alt} aria-hidden={decorative || undefined} data-asset-id={asset.id} data-asset-status="approved-bound" />;
}

function AccessibleRadioGroup<Value extends string>({ label, value, fallbackValue, options, onChange, className = '' }: {
  label: string;
  value?: Value;
  fallbackValue?: Value;
  options: readonly RadioOption<Value>[];
  onChange: (value: Value) => void;
  className?: string;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const fallbackIndex = Math.max(0, options.findIndex((option) => option.value === fallbackValue));
  const tabbableIndex = selectedIndex >= 0 ? selectedIndex : fallbackIndex;
  const move = (index: number) => {
    const next = options[index];
    if (!next) return;
    onChange(next.value);
    window.requestAnimationFrame(() => refs.current[index]?.focus());
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % options.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index - 1 + options.length) % options.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = options.length - 1;
    if (event.key === ' ' || event.key === 'Enter') nextIndex = index;
    if (nextIndex === undefined) return;
    event.preventDefault();
    move(nextIndex);
  };
  return (
    <div className={`sfp-radio-group ${className}`.trim()} role="radiogroup" aria-label={label}>
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button key={option.value} ref={(node) => { refs.current[index] = node; }} type="button" role="radio" aria-checked={selected} tabIndex={index === tabbableIndex ? 0 : -1} className={selected ? 'is-selected' : ''} onKeyDown={(event) => handleKeyDown(event, index)} onClick={() => onChange(option.value)}>
            <i aria-hidden="true">{selected ? <Check /> : null}</i>
            <span>{option.eyebrow ? <small>{option.eyebrow}</small> : null}<strong>{option.label}</strong><em>{option.description}</em></span>
          </button>
        );
      })}
    </div>
  );
}

function StageRail({ current, furthest, onChange }: { current: StartStageId; furthest: StartStageId; onChange: (stage: StartStageId) => void }) {
  const currentIndex = START_MAJOR_STAGES.findIndex((stage) => stage.id === current);
  const furthestIndex = START_MAJOR_STAGES.findIndex((stage) => stage.id === furthest);
  return (
    <nav className="sfp-stage-rail" aria-label="مراحل البدء">
      <ol>{START_MAJOR_STAGES.map((stage, index) => (
        <li key={stage.id} data-stage-state={stage.id === current ? 'current' : index < currentIndex ? 'complete' : 'future'}>
          <button type="button" disabled={index > furthestIndex} aria-current={stage.id === current ? 'step' : undefined} onClick={() => onChange(stage.id)}>
            <bdi>{stage.number}</bdi><span>{stage.label}</span>{index < currentIndex ? <Check aria-hidden="true" /> : null}
          </button>
        </li>
      ))}</ol>
    </nav>
  );
}

function Pulse({ goal, recommended, selected, budget, reviewNeeds }: { goal: string; recommended?: StartFamilyId; selected?: StartFamilyId; budget: string; reviewNeeds?: readonly string[] }) {
  return (
    <aside className="sfp-pulse" data-testid="project-pulse" aria-labelledby="sfp-pulse-title">
      <span>الحالة الحالية</span><h2 id="sfp-pulse-title">مشروعك الآن</h2>
      <dl>
        {goal ? <div><dt>الهدف</dt><dd>{goal}</dd></div> : null}
        <div><dt>الاتجاه المقترح</dt><dd>{recommended ? getStartFamily(recommended).title : 'لم ننسب توصية بعد.'}</dd></div>
        <div><dt>اختيارك</dt><dd>{selected ? getStartFamily(selected).title : 'لم تعتمد اتجاهًا بعد.'}</dd></div>
        <div><dt>الميزانية التقريبية</dt><dd><bdi dir="ltr">USD {budget}</bdi></dd></div>
        {reviewNeeds?.length ? <div><dt>يحتاج مراجعة</dt><dd>{reviewNeeds.slice(0, 2).join('، ')}</dd></div> : null}
      </dl>
    </aside>
  );
}

function FamilyFocusBrowser({ familyId, mode, onPreview, onAdopt }: { familyId: StartFamilyId; mode: 'direction' | 'example'; onPreview: (familyId: StartFamilyId) => void; onAdopt: (familyId: StartFamilyId) => void }) {
  const family = getStartFamily(familyId);
  const familyIndex = startFamilies.findIndex((item) => item.id === familyId);
  const previous = startFamilies[(familyIndex - 1 + startFamilies.length) % startFamilies.length];
  const next = startFamilies[(familyIndex + 1) % startFamilies.length];
  return (
    <section className="sfp-family-focus" data-testid={`${mode}-entry-browser`} aria-labelledby="sfp-family-focus-title">
      <div className="sfp-family-focus-tabs" aria-label="استكشف عائلات الحلول">
        {startFamilies.map((item) => <button key={item.id} type="button" aria-pressed={item.id === familyId} onClick={() => onPreview(item.id)}><bdi>{item.number}</bdi><span>{item.title}</span></button>)}
      </div>
      <div className="sfp-family-focus-hero">
        <AssetSlot asset={getFamilyVisualAsset(getFamilyAssetId(familyId, 'MASTER'))} alt={`مشهد عائلة ${family.title}`} />
        <div><span>{mode === 'example' ? 'ابدأ من مشهد معتمد' : 'حدّد النوع الأقرب'}</span><h2 id="sfp-family-focus-title">{family.title}</h2><p>{family.problem}</p><ul>{family.fits.slice(0, 2).map((fit) => <li key={fit}>{fit}</li>)}</ul></div>
      </div>
      {mode === 'example' ? <div className="sfp-direction-scenes" aria-label={`أمثلة بصرية لاتجاه ${family.title}`}>{(['DIR-01', 'DIR-02', 'DIR-03'] as const).map((role, index) => <figure key={role}><AssetSlot asset={getFamilyVisualAsset(getFamilyAssetId(familyId, role))} alt={`شكل بصري ${index + 1} لعائلة ${family.title}`} /><figcaption>اتجاه بصري {index + 1} · مثال للاستكشاف وليس قالبًا نهائيًا</figcaption></figure>)}</div> : null}
      <div className="sfp-family-focus-actions">
        <button type="button" className="sfp-tertiary" onClick={() => onPreview(previous.id)}><ArrowRight aria-hidden="true" /> {previous.title}</button>
        <button type="button" className="sfp-primary" onClick={() => onAdopt(familyId)}>اعتمد {family.title} كنقطة بداية <ArrowLeft aria-hidden="true" /></button>
        <button type="button" className="sfp-tertiary" onClick={() => onPreview(next.id)}>{next.title} <ArrowLeft aria-hidden="true" /></button>
      </div>
    </section>
  );
}

function Drawer({ open, asset, familyTitle, onClose, trigger }: { open: boolean; asset?: FamilyVisualAsset; familyTitle: string; onClose: () => void; trigger: React.RefObject<HTMLButtonElement | null> }) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const triggerNode = trigger.current;
    close.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; triggerNode?.focus(); };
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
        <span className="sfp-eyebrow">مثال سياقي</span><h2 id="sfp-drawer-title">كيف يمكن أن يبدو هذا الجزء من {familyTitle}؟</h2>
        <AssetSlot asset={asset} alt={`مثال سياقي لعائلة ${familyTitle}`} />
        <div className="sfp-drawer-copy"><p><strong>ما الذي يعرضه؟</strong> يوضح سياق استخدام مرتبطًا بلحظة الرحلة والقرار الحالي.</p><p><strong>ما الذي لا يعرضه؟</strong> ليس تصميمًا نهائيًا ولا يثبت كل الوظائف أو التكاملات.</p>{asset && !asset.runtimeUrl ? <p data-asset-note="pending">المثال البصري لهذا السياق لم يُعتمد بعد، لذلك أبقينا الحالة صريحة بلا بديل مصطنع.</p> : null}</div>
      </div>
    </div>
  );
}

function understoodNeed(draft: StartDiscoveryDraft) {
  const outcome = draft.objective || draft.capturedFacts?.outcome;
  const change = draft.currentProblem || draft.capturedFacts?.activity;
  const users = draft.intendedUsers || draft.capturedFacts?.audience;
  const domain = draft.domain;
  if (outcome && users && domain) return `${outcome}، لمصلحة ${users}، ضمن سياق تشغيلي: ${domain}.`;
  if (outcome && domain) return `${outcome}، ضمن سياق تشغيلي: ${domain}.`;
  if (outcome && users) return `${outcome}، لمصلحة ${users}.`;
  if (outcome) return `${outcome}.`;
  if (change && users) return `${change}، مع تجربة أوضح لـ ${users}.`;
  if (change) return `${change}.`;
  if (domain) return `تنظيم احتياجك ضمن السياق التشغيلي: ${domain}.`;
  return 'الوصول إلى اتجاه عملي من السياق الذي حملته معك.';
}

export function StartDiscoveryBody({ prefill, initialCertainty, className = '', onDraftChange, onLocalComplete }: StartDiscoveryBodyProps) {
  const [draft, setDraft] = useState<StartDiscoveryDraft>(() => initialDraft(prefill, initialCertainty));
  const [local, setLocal] = useState<LocalState>(() => initialLocal(prefill));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completionError, setCompletionError] = useState('');
  const [storageWarning, setStorageWarning] = useState(false);
  const [compactBuildComposition, setCompactBuildComposition] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 520px)').matches);
  const [buildSupportOpen, setBuildSupportOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const buildMomentRef = useRef<HTMLElement>(null);
  const exampleTrigger = useRef<HTMLButtonElement>(null);
  const discoverQuestionsRef = useRef<HTMLDivElement>(null);
  const guidedConfirmationRef = useRef<HTMLDivElement>(null);
  const recommendationRef = useRef<HTMLDivElement>(null);
  const pendingDiscoverFocus = useRef<DiscoverFocusTarget | null>(null);
  const pendingBuildFocus = useRef(false);

  const activeFamilyId = local.selected ?? local.recommended ?? local.previewFamily;
  const activeFamily = getStartFamily(activeFamilyId);
  const recommendedFamily = local.recommended ? getStartFamily(local.recommended) : undefined;
  const journey = useMemo(() => getFamilyJourneyModel(activeFamilyId), [activeFamilyId]);
  const buildSteps = useMemo(() => getFamilyBuildSteps(activeFamilyId), [activeFamilyId]);
  const decisions = useMemo(() => getFamilyDecisions(activeFamilyId), [activeFamilyId]);
  const currentStep = buildSteps[Math.min(local.buildStepIndex, Math.max(0, buildSteps.length - 1))];
  const currentMoment = journey.find((moment) => moment.id === currentStep?.momentId);
  const currentDecision = currentStep?.decision;
  const currentAnswer = currentDecision ? local.answers[currentDecision.id] : undefined;
  const currentConsequence = currentDecision && currentAnswer ? getDecisionConsequence(activeFamilyId, currentDecision, currentAnswer) : undefined;
  const materialEffect = decisions.some((decision) => {
    const answer = local.answers[decision.id];
    return answer ? getDecisionConsequence(activeFamilyId, decision, answer).material : false;
  });
  const externalNeeds = unique(decisions.flatMap((decision) => {
    const answer = local.answers[decision.id];
    if (!answer) return [];
    const dependency = getDecisionConsequence(activeFamilyId, decision, answer).externalDependency;
    return dependency ? [dependency] : [];
  }));
  const budgetBand = formatBudgetBand(local.stage !== 'discover' || materialEffect);
  const recommendedExperienceDirection = startConfigurationDirections.find((item) => item.id === local.recommendedExperience) ?? startConfigurationDirections[0];
  const selectedExperienceDirection = startConfigurationDirections.find((item) => item.id === local.selectedExperience);
  const reviewNeeds = unique([
    ...draft.unknowns,
    ...decisions.filter((decision) => local.answers[decision.id] === 'unknown').map((decision) => decision.capabilityName),
    ...decisions.filter((decision) => local.answers[decision.id] === 'yes' && getDecisionConsequence(activeFamilyId, decision, 'yes').material).map((decision) => `تحقق ${decision.capabilityName}`),
    ...externalNeeds.map((need) => `تحقق ${need}`),
    ...(!local.selectedExperience ? ['اعتماد شكل التجربة أو تغييره'] : []),
  ]).slice(0, 3);
  const goal = draft.objective || draft.capturedFacts?.outcome || draft.currentProblem;
  const familyCode = String(startFamilies.findIndex((family) => family.id === activeFamilyId) + 1).padStart(2, '0');
  const masterAsset = getFamilyVisualAsset(getFamilyAssetId(activeFamilyId, 'MASTER'));
  const contextAsset = getFamilyVisualAsset(getFamilyAssetId(activeFamilyId, currentStep?.evidenceRole ?? 'CTX-01'));

  useEffect(() => { onDraftChange?.(draft); }, [draft, onDraftChange]);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 520px)');
    const updateComposition = () => setCompactBuildComposition(query.matches);
    updateComposition();
    query.addEventListener('change', updateComposition);
    return () => query.removeEventListener('change', updateComposition);
  }, []);
  useEffect(() => {
    try {
      persistStoredState(prefill, local, draft);
      setStorageWarning(false);
    } catch {
      setStorageWarning(true);
    }
  }, [draft, local, prefill]);
  useEffect(() => { window.requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true })); }, [local.stage]);
  useEffect(() => {
    const target = pendingDiscoverFocus.current;
    if (!target) return;
    const node = target === 'questions' ? discoverQuestionsRef.current : target === 'confirmation' ? guidedConfirmationRef.current : recommendationRef.current;
    if (!node) return;
    pendingDiscoverFocus.current = null;
    window.requestAnimationFrame(() => node.focus({ preventScroll: false }));
  }, [local.discoverStep, local.contextStep, local.intent]);
  useEffect(() => {
    if (local.stage !== 'build' || !pendingBuildFocus.current) return;
    pendingBuildFocus.current = false;
    window.requestAnimationFrame(() => buildMomentRef.current?.focus({ preventScroll: false }));
  }, [local.buildStepIndex, local.stage]);

  const patchDraft = (patch: Partial<StartDiscoveryDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const setStage = (stage: StartStageId) => {
    const order = START_MAJOR_STAGES.map((item) => item.id);
    setLocal((current) => ({ ...current, stage, furthest: order.indexOf(stage) > order.indexOf(current.furthest) ? stage : current.furthest }));
  };
  const changeStage = (stage: StartStageId) => {
    if (local.stage === 'review' && stage !== 'review') {
      setCompleted(false);
      setCompletionError('');
      onDraftChange?.(draft);
    }
    setStage(stage);
  };
  const requestDiscoverFocus = (target: DiscoverFocusTarget) => { pendingDiscoverFocus.current = target; };

  const chooseFamily = (familyId: StartFamilyId, origin: StartDiscoveryDraft['decisionOrigin'] = 'USER_DIRECT') => {
    const family = getStartFamily(familyId);
    const inherited = draft.capabilitySelections.filter((selection) => family.capabilities.some((capability) => capability.name === selection.name));
    const recommendedExperience = getRecommendedExperience(familyId);
    setLocal((current) => ({ ...current, selected: familyId, previewFamily: familyId, buildStepIndex: 0, furthestBuildStep: 0, answers: {}, recommendedExperience, selectedExperience: undefined }));
    patchDraft({
      solutionFamilyId: familyId,
      decisionOrigin: origin,
      selectedCapabilities: inherited.filter((selection) => selection.provenance === 'USER_SELECTED').map((selection) => selection.name),
      capabilitySelections: inherited,
      recommendedConfigurationPreference: startConfigurationDirections.find((direction) => direction.id === recommendedExperience)?.title,
      configurationPreference: '',
    });
  };

  const buildRecommendation = () => {
    requestDiscoverFocus('recommendation');
    const assessment = assessStartRecommendation({ currentProblem: draft.currentProblem, objective: draft.objective, intendedUsers: draft.intendedUsers, domain: draft.domain });
    if (assessment.resolution === 'decisive' && assessment.recommendedId) {
      const recommendedId = assessment.recommendedId;
      const family = getStartFamily(recommendedId);
      setLocal((current) => ({ ...current, recommended: recommendedId, previewFamily: current.selected ?? recommendedId, recommendationReasons: [...assessment.reasons], candidateIds: [], discoverStep: 2 }));
      patchDraft({ recommendedFamily: family.title, solutionFamilyId: draft.solutionFamilyId, decisionOrigin: draft.solutionFamilyId ? draft.decisionOrigin : 'SYSTEM_FINDER', recommendationResolution: 'decisive' });
      return;
    }
    setLocal((current) => ({ ...current, recommended: undefined, recommendationReasons: [...assessment.reasons], candidateIds: [...assessment.candidateIds], discoverStep: 2 }));
    patchDraft({ recommendedFamily: '', recommendationResolution: 'insufficient', decisionOrigin: draft.solutionFamilyId ? draft.decisionOrigin : 'SYSTEM_FINDER' });
  };

  const adoptEntryFamily = (familyId: StartFamilyId) => {
    requestDiscoverFocus('confirmation');
    chooseFamily(familyId);
    setLocal((current) => ({ ...current, contextStep: 1 }));
  };

  const selectAnswer = (answer: StartDecisionAnswer) => {
    if (!currentDecision) return;
    const capability = activeFamily.capabilities.find((item) => item.name === currentDecision.capabilityName);
    const without = draft.capabilitySelections.filter((selection) => selection.name !== currentDecision.capabilityName);
    let selections: DiscoveryCapabilitySelection[] = without;
    if (answer === 'yes' && capability) selections = [...without, { name: capability.name, classification: capability.classification, provenance: 'USER_SELECTED' }];
    setLocal((current) => ({ ...current, answers: { ...current.answers, [currentDecision.id]: answer } }));
    patchDraft({
      capabilitySelections: selections,
      selectedCapabilities: selections.filter((selection) => selection.provenance === 'USER_SELECTED').map((selection) => selection.name),
      uncertainCapabilities: answer === 'unknown' ? unique([...draft.uncertainCapabilities, currentDecision.capabilityName]) : draft.uncertainCapabilities.filter((name) => name !== currentDecision.capabilityName),
    });
  };

  const nextBuild = () => {
    if (currentDecision && !currentAnswer) return;
    if (local.buildStepIndex < buildSteps.length - 1) {
      pendingBuildFocus.current = true;
      setLocal((current) => ({ ...current, buildStepIndex: current.buildStepIndex + 1, furthestBuildStep: Math.max(current.furthestBuildStep, current.buildStepIndex + 1) }));
      return;
    }
    setStage('review');
  };

  const complete = () => {
    const completionDraft: StartDiscoveryDraft = externalNeeds.length
      ? { ...draft, dependencies: unique([...draft.dependencies, ...externalNeeds]) }
      : draft;
    setCompletionError('');
    try {
      persistStoredState(prefill, local, completionDraft);
      onLocalComplete?.(buildDiscoverySummary(completionDraft), completionDraft);
      setStorageWarning(false);
      setCompleted(true);
    } catch {
      setCompleted(false);
      setStorageWarning(true);
      setCompletionError('تعذر حفظ موجز المشروع داخل جلسة المتصفح. لم نسجل نجاحًا، ولم يتم إرسال أي شيء. أبقِ الصفحة مفتوحة ثم أعد المحاولة بعد إتاحة تخزين الجلسة.');
    }
  };

  const editReview = () => {
    changeStage(draft.unknowns.length ? 'discover' : 'build');
  };

  const carriedFactValues = [
    draft.capturedFacts?.outcome && `النتيجة: ${draft.capturedFacts.outcome}`,
    draft.capturedFacts?.activity && `النشاط: ${draft.capturedFacts.activity}`,
    draft.capturedFacts?.audience && `الجمهور: ${draft.capturedFacts.audience}`,
    draft.capturedFacts?.complexity && `العمق: ${draft.capturedFacts.complexity}`,
    draft.capturedFacts?.constraints && `القيد: ${draft.capturedFacts.constraints}`,
  ].filter(Boolean) as string[];

  const entryOptions: RadioOption<StartEntryIntent>[] = START_ENTRY_INTENTS.map((intent, index) => ({ value: intent.id, label: intent.label, description: intent.description, eyebrow: `مدخل ${String(index + 1).padStart(2, '0')}` }));
  const moveContext = (next: number) => {
    requestDiscoverFocus('questions');
    setLocal((current) => ({ ...current, contextStep: next }));
  };

  const directNeedJourney = local.intent === 'discover' ? (
    <div className="sfp-progressive-need" data-testid="discover-need-flow" data-question={local.contextStep + 1}>
      <div className="sfp-question-progress" aria-label="تقدم أسئلة الاكتشاف"><span data-current={local.contextStep === 0}>التغيير</span><span data-current={local.contextStep === 1}>المستخدمون</span><span data-current={local.contextStep === 2}>النتيجة</span><span data-current={local.contextStep === 3}>السياق</span></div>
      <p className="sfp-field-guidance">التغيير والمستخدمون والنتيجة مطلوبة لبناء اتجاه أولي. السياق التشغيلي اختياري، لكنه قد يجعل التوصية أدق.</p>
      {local.contextStep === 0 ? <label>ما الذي تريد تغييره؟ <small>مطلوب</small><textarea dir="auto" value={draft.currentProblem} onChange={(event) => patchDraft({ currentProblem: event.target.value })} placeholder="مثال: أريد جعل حجز الخدمة أوضح وأسهل." /></label> : null}
      {local.contextStep === 1 ? <label>من سيستخدم هذا الحل؟ <small>مطلوب</small><input dir="auto" value={draft.intendedUsers} onChange={(event) => patchDraft({ intendedUsers: event.target.value })} placeholder="العملاء، فريق الخدمة، أو أطراف أخرى" /></label> : null}
      {local.contextStep === 2 ? <label>ما النتيجة التي تريد الوصول إليها؟ <small>مطلوب</small><textarea dir="auto" value={draft.objective} onChange={(event) => patchDraft({ objective: event.target.value })} placeholder="صف النتيجة التي تهمك بجملة قصيرة." /></label> : null}
      {local.contextStep === 3 ? <label>ما السياق التشغيلي الذي يجب أن نعرفه؟ <small>اختياري</small><textarea dir="auto" value={draft.domain} onChange={(event) => patchDraft({ domain: event.target.value })} placeholder="خدمة بمواعيد، فريق داخلي، محتوى متجدد..." /></label> : null}
      <div className="sfp-flow-actions">
        {local.contextStep > 0 ? <button type="button" className="sfp-secondary" onClick={() => moveContext(local.contextStep - 1)}>السابق</button> : null}
        {local.contextStep < 3 ? <button type="button" className="sfp-primary" disabled={local.contextStep === 0 ? !draft.currentProblem.trim() : local.contextStep === 1 ? !draft.intendedUsers.trim() : !draft.objective.trim()} onClick={() => moveContext(local.contextStep + 1)}>تابع <ArrowLeft /></button> : <button type="button" className="sfp-primary" onClick={buildRecommendation}>ابنِ اتجاهًا أوليًا <ArrowLeft /></button>}
      </div>
    </div>
  ) : null;

  const guidedEntry = local.intent === 'direction' || local.intent === 'example' ? (
    local.contextStep === 0 ? <FamilyFocusBrowser familyId={local.previewFamily} mode={local.intent} onPreview={(familyId) => setLocal((current) => ({ ...current, previewFamily: familyId }))} onAdopt={adoptEntryFamily} /> : (
      <div ref={guidedConfirmationRef} tabIndex={-1} className="sfp-entry-confirmation sfp-transition-focus" data-testid={`${local.intent}-entry-confirmation`}>
        <span>اختيارك المبكر: {getStartFamily(local.selected ?? local.previewFamily).title}</span>
        <h2>{local.intent === 'example' ? 'ما الذي تريد أن يحققه المشروع، بعيدًا عن شكل المثال؟' : 'ما النتيجة التي يجب أن يؤكدها هذا الاتجاه؟'}</h2>
        <p className="sfp-field-guidance">النتيجة مطلوبة لمراجعة الاتجاه. المستخدمون والسياق التشغيلي اختياريان، وإضافتهما تحسن دقة القراءة.</p>
        <label>النتيجة المطلوبة <small>مطلوب</small><textarea dir="auto" value={draft.objective} onChange={(event) => patchDraft({ objective: event.target.value })} placeholder="اكتب النتيجة بجملة قصيرة." /></label>
        <label>المستخدمون الرئيسيون <small>اختياري</small><input dir="auto" value={draft.intendedUsers} onChange={(event) => patchDraft({ intendedUsers: event.target.value })} placeholder="من سيعتمد على الحل؟" /></label>
        <label>السياق التشغيلي <small>اختياري</small><textarea dir="auto" value={draft.domain} onChange={(event) => patchDraft({ domain: event.target.value })} placeholder="ما الذي يجب أن نعرفه عن طريقة العمل؟" /></label>
        <div className="sfp-flow-actions"><button type="button" className="sfp-secondary" onClick={() => { requestDiscoverFocus('questions'); setLocal((current) => ({ ...current, contextStep: 0 })); }}>غيّر نقطة البداية</button><button type="button" className="sfp-primary" disabled={!draft.objective.trim()} onClick={buildRecommendation}>راجع الاتجاه <ArrowLeft /></button></div>
      </div>
    )
  ) : null;

  const discover = (
    <section className="sfp-stage sfp-discover" aria-labelledby="start-discovery-title">
      <header className="sfp-stage-heading" data-density={local.discoverStep === 2 ? 'compact' : 'intro'}><p className="sfp-eyebrow">المرحلة 01 · اكتشف ما يناسبك</p><h1 id="start-discovery-title" ref={headingRef} tabIndex={-1} data-route-focus>{local.discoverStep === 2 ? 'اتجاه واضح لتبدأ منه.' : 'ابدأ بما تريد تغييره.'}</h1><p>{local.discoverStep === 2 ? 'راجع ما فهمناه، ثم اعتمد الاتجاه أو استكشف بديلًا.' : 'اختر نقطة البداية التي تناسبك. النتيجة هنا هي مخطط وموجز مشروع يمكنك حفظهما داخل جلسة المتصفح، وليست إنشاء مشروع أو إرسال طلب.'}</p></header>
      {prefill && carriedFactValues.length ? <div className="sfp-carried" data-testid="carried-context" data-carried-facts={carriedFactValues.length > 1 ? 'true' : undefined}><strong>ما نعرفه من قرارك السابق</strong><p>{carriedFactValues.join(' · ')}</p></div> : null}
      {local.discoverStep === 0 ? <div className="sfp-entry-intents"><h2>كيف تفضّل أن تبدأ؟</h2><AccessibleRadioGroup label="نقطة الدخول إلى الاكتشاف" value={local.intent} options={entryOptions} onChange={(intent) => setLocal((current) => ({ ...current, intent }))} /><div className="sfp-entry-footer"><button type="button" className="sfp-primary" disabled={!local.intent} onClick={() => { requestDiscoverFocus('questions'); setLocal((current) => ({ ...current, discoverStep: 1, contextStep: 0 })); }}>ابدأ بهذا المدخل <ArrowLeft aria-hidden="true" /></button></div></div> : null}
      {local.discoverStep === 1 ? <div ref={discoverQuestionsRef} tabIndex={-1} className="sfp-discovery-fields sfp-transition-focus" data-testid="discover-focused-subtree">{directNeedJourney}{guidedEntry}</div> : null}
      {local.discoverStep === 2 ? (
        <div ref={recommendationRef} tabIndex={-1} className="sfp-recommendation-grid sfp-transition-focus" data-testid="discover-recommendation-state">
          <div className="sfp-recommendation-main">
            <section className="sfp-understood" data-testid="understood-need"><span>ما فهمناه</span><h2>فهمنا أنك تريد...</h2><p>{understoodNeed(draft)}</p></section>
            {recommendedFamily ? <div className="sfp-recommendation" data-testid="system-recommendation"><div className="sfp-recommendation-copy-block"><span>الاتجاه الذي نوصي بمراجعته</span><h2>{recommendedFamily.title}</h2><div className="sfp-recommendation-copy"><strong>لماذا يناسبك؟</strong>{local.recommendationReasons.map((reason) => <p key={reason}>{reason}</p>)}</div></div><div className="sfp-recommendation-visual"><AssetSlot asset={getFamilyVisualAsset(getFamilyAssetId(recommendedFamily.id, 'MASTER'))} alt={`مشهد عائلة ${recommendedFamily.title}`} /></div></div> : local.candidateIds.length ? (
              <section className="sfp-candidate-choice" data-testid="bounded-candidate-choice"><span>نحتاج تمييزًا واحدًا</span><h2>أي نوع تغيير أقرب إلى أولويتك؟</h2><p>{local.recommendationReasons[0]}</p><AccessibleRadioGroup label="اتجاهات محتملة تحتاج اختيارك" value={local.selected} options={local.candidateIds.map((familyId) => ({ value: familyId, label: getStartFamily(familyId).title, description: getStartFamily(familyId).cue }))} onChange={(familyId) => chooseFamily(familyId, 'USER_OPEN_DIRECTION')} /></section>
            ) : null}
            <div className="sfp-recommendation-truth"><div className="sfp-user-selection" data-testid="user-selection"><span>اختيارك أنت</span><strong>{local.selected ? getStartFamily(local.selected).title : 'لم تعتمد اتجاهًا بعد.'}</strong><small>{local.selected && !local.recommended ? 'هذا اختيارك الحالي، وليس توصية من النظام.' : 'التوصية لا تصبح اختيارًا إلا بعد اعتمادك.'}</small></div><div className="sfp-budget"><span>{PROVISIONAL_START_PRICING.label}</span><strong><bdi dir="ltr">USD {formatBudgetBand(false)}</bdi></strong><small>{PROVISIONAL_START_PRICING.disclaimer}</small></div></div>
            <div className="sfp-adoption-row"><button type="button" className="sfp-primary" disabled={!local.selected && !local.recommended} onClick={() => { if (!local.selected && local.recommended) chooseFamily(local.recommended); setStage('build'); }}>{local.selected ? 'تابع مع اختيارك' : 'اختر هذا الاتجاه'} <ArrowLeft /></button><p>يمكنك تغيير الاتجاه لاحقًا دون إعادة ما أدخلته.</p></div>
            {recommendedFamily ? <details className="sfp-direction-explorer"><summary>شاهد ثلاثة أشكال ممكنة لهذا الاتجاه</summary><div>{(['DIR-01', 'DIR-02', 'DIR-03'] as const).map((role, index) => <figure key={role}><AssetSlot asset={getFamilyVisualAsset(getFamilyAssetId(recommendedFamily.id, role))} alt={`شكل ${index + 1} لاتجاه ${recommendedFamily.title}`} /><figcaption>شكل {index + 1} · للاستكشاف</figcaption></figure>)}</div></details> : null}
            <details className="sfp-family-explorer"><summary>قارن أو اختر اتجاهًا آخر</summary><div>{startFamilies.map((family) => <button key={family.id} type="button" aria-pressed={local.selected === family.id} onClick={() => chooseFamily(family.id, 'USER_ALTERNATIVE')}><bdi>{family.number}</bdi><span><strong>{family.title}</strong><small>{family.cue}</small></span>{local.selected === family.id ? <Check /> : null}</button>)}</div></details>
          </div>
          <Pulse goal={goal} recommended={local.recommended} selected={local.selected} budget={formatBudgetBand(false)} />
        </div>
      ) : null}
    </section>
  );

  const build = (
    <section className="sfp-stage sfp-build" aria-labelledby="start-build-title">
      <header className="sfp-stage-heading" data-density="compact"><p className="sfp-eyebrow">المرحلة 02 · كوّن حلّك</p><h1 id="start-build-title" ref={headingRef} tabIndex={-1}>كوّن الحل حول طريقة الاستخدام والعمل.</h1><p>{activeFamily.title} · لحظة واحدة في كل مرة؛ وعندما يوجد قرار سترى نتيجته المباشرة.</p></header>
      <div className="sfp-build-layout"><div className="sfp-build-workspace">
        <div className="sfp-build-primary">
          <nav className="sfp-journey" aria-label="لحظات رحلة الحل">{journey.map((moment, index) => { const firstStep = buildSteps.findIndex((step) => step.momentId === moment.id); const current = currentStep?.momentId === moment.id; return <button key={moment.id} type="button" disabled={firstStep > local.furthestBuildStep} data-current={current ? 'true' : undefined} data-complete={firstStep < local.buildStepIndex ? 'true' : undefined} onClick={() => { pendingBuildFocus.current = true; setLocal((state) => ({ ...state, buildStepIndex: firstStep })); }}><bdi>{String(index + 1).padStart(2, '0')}</bdi><span>{moment.label}</span>{firstStep < local.buildStepIndex ? <Check aria-hidden="true" /> : null}</button>; })}</nav>
          <section ref={buildMomentRef} tabIndex={-1} className="sfp-current-moment sfp-transition-focus" aria-labelledby="sfp-current-moment-title"><span>لحظة الرحلة الحالية</span><h2 id="sfp-current-moment-title">{currentMoment?.label}</h2><p>{currentStep?.body}</p></section>
          {currentStep?.kind === 'information' ? <article className="sfp-moment-brief" data-testid="journey-information"><span>لحظة في الرحلة</span><h2>{currentStep.title}</h2><p>{currentStep.body}</p><ul>{activeFamily.capabilities.filter((capability) => capability.classification === 'CORE').map((capability) => <li key={capability.name}><strong>{capability.name}</strong><small>{capability.description}</small></li>)}</ul></article> : null}
          {currentDecision ? <div className="sfp-decision-result"><article className="sfp-decision" data-moment-id={currentDecision.momentId}><span>القرار الحالي</span><h2>{currentDecision.question}</h2><AccessibleRadioGroup label={currentDecision.question} value={currentAnswer} options={currentDecision.answers.map((answer) => ({ value: answer.id, label: answer.label, description: answer.detail }))} onChange={selectAnswer} /></article>{currentConsequence ? <section className="sfp-consequence" data-testid="decision-consequence" aria-labelledby="sfp-consequence-title"><span>النتيجة المرتبطة بقرارك</span><h2 id="sfp-consequence-title">ماذا يتغير؟</h2><div><article><strong>للعميل</strong><p>{currentConsequence.customer}</p></article><article><strong>في الحل</strong><p>{currentConsequence.solution}</p></article><article><strong>في المشروع</strong><p>{currentConsequence.project}</p></article></div></section> : null}</div> : null}
        </div>
        <Pulse goal={goal} recommended={local.recommended} selected={local.selected} budget={budgetBand} reviewNeeds={reviewNeeds} />
        <div className="sfp-build-actions"><p>{currentDecision && !currentAnswer ? 'اختر إجابة واحدة للمتابعة. إذا لم تحسم القرار بعد، اختر «لم أحدد بعد» لتسجيله بوضوح للمراجعة.' : 'يمكنك العودة وتعديل أي قرار سابق.'}</p><button type="button" className="sfp-primary" disabled={Boolean(currentDecision && !currentAnswer)} onClick={nextBuild}>{local.buildStepIndex < buildSteps.length - 1 ? 'تابع في الرحلة' : 'احفظ التكوين وتابع'} <ArrowLeft /></button></div>
        <details className="sfp-build-support" open={!compactBuildComposition || buildSupportOpen} onToggle={(event) => { if (compactBuildComposition) setBuildSupportOpen(event.currentTarget.open); }}>
          <summary><span>استكشاف داعم</span><strong>شكل التجربة والمشهد السياقي</strong><small>نقترح: {recommendedExperienceDirection.shortLabel} · اعتمدت: {selectedExperienceDirection?.shortLabel ?? 'لم تعتمد شكلًا بعد.'}</small></summary>
          <div className="sfp-build-support-content">
            <section className="sfp-experience" aria-labelledby="sfp-experience-title" data-recommended-experience={local.recommendedExperience} data-selected-experience={local.selectedExperience ?? ''}><span>شكل التجربة</span><h2 id="sfp-experience-title">اتجاه مقترح، والاعتماد قرارك.</h2><div className="sfp-experience-truth"><p><strong>نقترح:</strong> {recommendedExperienceDirection.shortLabel}</p><p><strong>اعتمدت:</strong> {selectedExperienceDirection?.shortLabel ?? 'لم تعتمد شكلًا بعد.'}</p></div><AccessibleRadioGroup label="شكل تجربة العميل" value={local.selectedExperience} fallbackValue={local.recommendedExperience} options={startConfigurationDirections.map((direction) => ({ value: direction.id, label: direction.shortLabel, description: direction.description, eyebrow: direction.id === local.recommendedExperience ? 'موصى به للمراجعة' : 'بديل' }))} onChange={(experience) => { setLocal((current) => ({ ...current, selectedExperience: experience })); patchDraft({ configurationPreference: startConfigurationDirections.find((direction) => direction.id === experience)?.title ?? '' }); }} /></section>
            <section className="sfp-context-preview" aria-labelledby="sfp-context-preview-title"><div><span>مشهد مرتبط بهذه اللحظة</span><h2 id="sfp-context-preview-title">{currentMoment?.label}</h2><p>يساعدك هذا المشهد على قراءة القرار في سياقه، ولا يمثل تصميم مشروعك النهائي.</p></div><AssetSlot asset={contextAsset} alt={`مثال سياقي لعائلة ${activeFamily.title} في ${currentMoment?.label}`} /><button ref={exampleTrigger} type="button" className="sfp-example" onClick={() => setDrawerOpen(true)}><Eye /> شاهد مثالًا مرتبطًا بهذه اللحظة وتفاصيله</button></section>
          </div>
        </details>
      </div></div>
      <Drawer open={drawerOpen} asset={contextAsset} familyTitle={activeFamily.title} onClose={() => setDrawerOpen(false)} trigger={exampleTrigger} />
    </section>
  );

  const selectedCapabilityNames = unique([
    ...activeFamily.capabilities.filter((capability) => capability.classification === 'CORE').map((capability) => capability.name),
    ...draft.capabilitySelections.filter((selection) => selection.provenance === 'USER_SELECTED').map((selection) => selection.name),
  ]);
  const experienceReviewLabel = selectedExperienceDirection ? selectedExperienceDirection.shortLabel : `مقترح للمراجعة: ${recommendedExperienceDirection.shortLabel}`;
  const coreCapabilities = activeFamily.capabilities.filter((capability) => capability.classification === 'CORE');
  const dependencyReviewItems = unique([...draft.unknowns, ...decisions.filter((decision) => local.answers[decision.id] === 'unknown').map((decision) => decision.capabilityName)]);
  const answerLabel = (answer: StartDecisionAnswer | undefined) => answer === 'yes' ? 'ضمن التكوين' : answer === 'no' ? 'ليس الآن' : 'يحتاج مراجعة';
  const blueprintLayers: BlueprintLayer[] = [
    { key: 'experience', label: 'تجربة العميل', caption: 'شكل التجربة الذي سيقود الاستخدام.', nodes: [{ id: 'experience-direction', title: experienceReviewLabel, detail: selectedExperienceDirection ? 'اعتمدته أنت.' : 'ما زال اقتراحًا للمراجعة.' }] },
    { key: 'journey', label: 'لحظات الرحلة', caption: 'من بداية الحاجة حتى اكتمال المسار.', nodes: journey.map((moment) => { const momentDecisions = decisions.filter((decision) => decision.momentId === moment.id); return { id: moment.id, title: moment.label, detail: momentDecisions.length ? momentDecisions.map((decision) => `${decision.capabilityName}: ${answerLabel(local.answers[decision.id])}`).join(' · ') : moment.description }; }) },
    { key: 'operation', label: 'الخدمة والتشغيل', caption: 'الوظائف الأساسية التي تحمل الرحلة.', nodes: coreCapabilities.map((capability) => ({ id: capability.name, title: capability.name, detail: capability.description })) },
    { key: 'scope', label: 'النطاق المختار', caption: 'ما يتضمنه التكوين المبدئي الآن.', nodes: selectedCapabilityNames.map((capability) => ({ id: capability, title: capability })) },
  ];
  if (externalNeeds.length) blueprintLayers.push({ key: 'external', label: 'خدمة خارجية', caption: 'احتياج خارجي مرتبط بقرار داخل الرحلة.', nodes: externalNeeds.map((need) => ({ id: need, title: need, detail: 'يحتاج تحققًا قبل تثبيت النطاق النهائي.' })) });
  if (dependencyReviewItems.length) blueprintLayers.push({ key: 'dependency', label: 'بيانات أو تفاصيل مترابطة', caption: 'أمور موجودة في الحالة الحالية وما زالت تحتاج مراجعة.', nodes: dependencyReviewItems.map((item) => ({ id: item, title: item })) });

  const projectSummary = (
    <aside className="sfp-project-summary" data-testid="project-summary" aria-labelledby="sfp-summary-title"><span>مشروعك باختصار</span><h2 id="sfp-summary-title">ما الذي سنبدأ منه؟</h2><dl>{local.recommended ? <div><dt>اتجاه اقترحته GS</dt><dd>{getStartFamily(local.recommended).title}</dd></div> : null}<div><dt>الحل الذي اعتمدته</dt><dd>{activeFamily.title}</dd></div><div><dt>شكل التجربة</dt><dd data-experience-state={selectedExperienceDirection ? 'adopted' : 'recommended-only'}>{experienceReviewLabel}</dd></div><div><dt>النطاق</dt><dd>{selectedCapabilityNames.join('، ')}</dd></div><div><dt>الميزانية التقريبية</dt><dd><bdi dir="ltr">USD {budgetBand}</bdi><small>{PROVISIONAL_START_PRICING.disclaimer}</small></dd></div>{externalNeeds.length ? <div><dt>خدمات خارجية</dt><dd>{externalNeeds.join('، ')}</dd></div> : null}</dl>{reviewNeeds.length ? <section className="sfp-review-needs"><h3>بنود تحتاج مراجعتك قبل أي خطوة خارجية</h3><ul>{reviewNeeds.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}</aside>
  );
  const blueprint = (
    <article className="sfp-blueprint" data-testid="project-blueprint" aria-labelledby="sfp-blueprint-title"><div className="sfp-blueprint-head"><div><span>مخطط مشروعك</span><h2 id="sfp-blueprint-title">{activeFamily.title}</h2><p>{understoodNeed(draft)}</p></div><AssetSlot asset={masterAsset} alt={`مشهد داعم لعائلة ${activeFamily.title}`} /></div><div className="sfp-blueprint-map" aria-label="العلاقات بين تجربة العميل والرحلة والتشغيل والنطاق">{blueprintLayers.map((layer, index) => <section key={layer.key} className="sfp-blueprint-band" data-layer={layer.key}><header><bdi>{String(index + 1).padStart(2, '0')}</bdi><div><h3>{layer.label}</h3><p>{layer.caption}</p></div></header><div className="sfp-blueprint-nodes">{layer.nodes.map((node) => <article key={node.id}><strong>{node.title}</strong>{node.detail ? <small>{node.detail}</small> : null}</article>)}</div></section>)}</div><div className="sfp-blueprint-layers-mobile">{blueprintLayers.map((layer, index) => <details key={layer.key} open={index === 0}><summary><bdi>{String(index + 1).padStart(2, '0')}</bdi><span><strong>{layer.label}</strong><small>{layer.caption}</small></span></summary><div>{layer.nodes.map((node) => <article key={node.id}><strong>{node.title}</strong>{node.detail ? <small>{node.detail}</small> : null}</article>)}</div></details>)}</div></article>
  );

  const reviewEditStage: StartStageId = draft.unknowns.length ? 'discover' : 'build';
  const review = (
    <section className="sfp-stage sfp-review" aria-labelledby="start-review-title">
      <header className="sfp-stage-heading" data-density="compact"><p className="sfp-eyebrow">المرحلة 03 · راجع وجهّز الموجز</p><h1 id="start-review-title" ref={headingRef} tabIndex={-1}>مخططك جاهز للمراجعة قبل أي خطوة خارجية</h1><p>راجع العلاقات بين التجربة والرحلة والتشغيل والنطاق، ثم احفظ موجز هذه النسخة داخل جلسة المتصفح إذا كانت صحيحة.</p></header>
      <div className="sfp-review-layout">{projectSummary}{blueprint}<section className="sfp-review-close" aria-labelledby="sfp-ready-title"><div className="sfp-ready"><Check aria-hidden="true" /><div><h3 id="sfp-ready-title">جاهز لتجهيز موجز محلي</h3><p>الحفظ هنا يجهّز موجزًا داخل جلسة متصفحك فقط. لا ينشئ مشروعًا، ولا يرسل طلبًا، ولا يبدأ شراءً أو دفعًا أو التزامًا تجاريًا.</p></div></div><div className="sfp-final-actions"><button type="button" className="sfp-primary" disabled={completed} onClick={complete}>{completed ? 'تم حفظ الموجز محليًا' : completionError ? 'أعد محاولة حفظ الموجز محليًا' : 'احفظ موجز المشروع محليًا'} {!completed ? <ArrowLeft aria-hidden="true" /> : <Check aria-hidden="true" />}</button><button type="button" className="sfp-secondary" onClick={editReview}>{reviewEditStage === 'discover' ? 'عدّل معلومات الاكتشاف' : 'عدّل قرارات الحل'}</button><p>لن نعرض هذه النسخة على أنها محفوظة بنجاح إلا بعد نجاح تخزين الجلسة المطلوب.</p>{storageWarning && !completionError && !completed ? <p className="sfp-storage-warning" role="status">تعذر حفظ التقدم في جلسة المتصفح تلقائيًا. يمكنك متابعة التحرير، لكن أبقِ الصفحة مفتوحة وأعد محاولة الحفظ هنا قبل مغادرتها.</p> : null}{completionError ? <p className="sfp-storage-error" role="alert">{completionError}</p> : null}{completed ? <p role="status">تم حفظ موجز هذه النسخة داخل جلسة المتصفح فقط. لم يتم إرسال أي شيء خارج الصفحة.</p> : null}</div></section></div>
    </section>
  );

  return (
    <div className={`start-discovery sfp-start ${className}`.trim()} dir="rtl" data-stage={local.stage} data-major-stage-count="3" data-prefilled={prefill ? 'true' : 'false'} data-certainty={prefill ? 'configured' : local.intent ? 'exploring' : 'unselected'} data-recommended-family={local.recommended ?? ''} data-selected-family={local.selected ?? ''} data-family-code={`FAM-${familyCode}`}>
      <input type="hidden" id="sd-objective" readOnly value={draft.objective || draft.capturedFacts?.outcome || draft.currentProblem} />
      <div className="sfp-shell"><StageRail current={local.stage} furthest={local.furthest} onChange={changeStage} />{local.stage === 'discover' ? discover : null}{local.stage === 'build' ? build : null}{local.stage === 'review' ? review : null}</div>
    </div>
  );
}
