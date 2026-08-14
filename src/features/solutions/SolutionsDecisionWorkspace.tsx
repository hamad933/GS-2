import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import {
  budgetPreferences,
  configurationDirections,
  familyById,
  finderQuestions,
  getFactLabel,
  recommendFromFacts,
  solutionFamilies,
} from '../../data/solutions';
import type {
  BudgetPreferenceId,
  Capability,
  CapabilityClassification,
  CapabilitySelection,
  ConfigurationDirectionId,
  ConfigurationPhase,
  DecisionFacts,
  DecisionOrigin,
  DecisionSnapshot,
  EntryMode,
  EvidenceState,
  Recommendation,
  RecommendationResolution,
  SolutionFamily,
  SolutionFamilyId,
  SolutionsDecisionWorkspaceProps,
  WorkspaceStep,
} from '../../types/solutions';
import './solutionsDecisionWorkspace.css';
import './solutionsDecisionWorkspace.accessibility.css';

const stepOrder: WorkspaceStep[] = ['entry', 'qualify', 'recommend', 'configure', 'summary'];

const stepLabels: Record<WorkspaceStep, { ar: string; en: string }> = {
  entry: { ar: 'نقطة البداية', en: 'DISCOVER' },
  qualify: { ar: 'فهم الاحتياج', en: 'QUALIFY' },
  recommend: { ar: 'الاتجاه', en: 'RECOMMEND' },
  configure: { ar: 'التكوين', en: 'CONFIGURE' },
  summary: { ar: 'ملخص القرار', en: 'REVIEW' },
};

const modeContent: Array<{ id: EntryMode; number: string; title: string; detail: string; route: string }> = [
  {
    id: 'discover',
    number: '01',
    title: 'ساعدني أكتشف ما أحتاجه',
    detail: 'أسئلة قصيرة متتابعة تبني اتجاهًا من المعلومات التي تقدمها فقط.',
    route: 'اكتشاف موجّه',
  },
  {
    id: 'direction',
    number: '02',
    title: 'أعرف تقريبًا ما أحتاجه',
    detail: 'ابدأ بعائلة حل، ثم راجع ملاءمتها وحدودها قبل التكوين.',
    route: 'اتجاه أولي',
  },
  {
    id: 'compare',
    number: '03',
    title: 'أريد مقارنة الخيارات',
    detail: 'قارن اتجاهين وفق التشغيل والاعتمادات، لا وفق عدد المزايا.',
    route: 'مقارنة مركّزة',
  },
];

const classificationLabels: Record<CapabilityClassification, string> = {
  CORE: 'أساسي في الاتجاه الحالي',
  RECOMMENDED: 'موصى به',
  OPTIONAL: 'اختياري',
  CONDITIONAL: 'مشروط',
  CUSTOM: 'مخصص / يحتاج اكتشافًا',
};

const evidenceLabels: Record<EvidenceState, string> = {
  VERIFIED_IMPLEMENTATION: 'تنفيذ متحقق',
  REVIEWED_VISUAL_EVIDENCE: 'دليل بصري مراجع',
  BOUNDED_DEMO: 'عرض تجريبي محدود',
  REFERENCE_ONLY: 'مرجع سياقي فقط',
  PLANNED: 'مخطط',
  NOT_AVAILABLE: 'الدليل غير متاح',
  REJECTED: 'مرفوض',
};

type SummaryKind = 'fact' | 'recommendation' | 'configuration' | 'unknown' | 'evidence';

const summaryKindLabels: Record<SummaryKind, string> = {
  fact: 'معلومة قدّمتها',
  recommendation: 'مصدر الاتجاه الحالي',
  configuration: 'التكوين الحالي',
  unknown: 'يحتاج اكتشافًا',
  evidence: 'حالة تحقق من النظام',
};

const budgetLabels = Object.fromEntries(
  budgetPreferences.map((preference) => [preference.id, preference.title]),
) as Record<BudgetPreferenceId, string>;

function handleRovingRadioKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
  const navigationKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
  if (!navigationKeys.includes(event.key)) return;

  const group = event.currentTarget.closest('[role="radiogroup"]');
  const radios = group
    ? Array.from(group.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'))
    : [];
  if (!radios.length) return;

  const currentIndex = radios.indexOf(event.currentTarget);
  if (currentIndex < 0) return;

  let nextIndex = currentIndex;
  if (event.key === 'Home') nextIndex = 0;
  if (event.key === 'End') nextIndex = radios.length - 1;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    nextIndex = (currentIndex + 1) % radios.length;
  }
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    nextIndex = (currentIndex - 1 + radios.length) % radios.length;
  }

  event.preventDefault();
  radios[nextIndex].focus();
  radios[nextIndex].click();
}

function FamilyMark({ family }: { family: SolutionFamily }) {
  return (
    <span className="gsdw-family-mark" aria-hidden="true">
      <i />
      <b dir="ltr">{family.number}</b>
    </span>
  );
}

function ProgressRail({ step }: { step: WorkspaceStep }) {
  const activeIndex = stepOrder.indexOf(step);

  return (
    <nav className="gsdw-progress" aria-label="مراحل مساحة القرار">
      <ol>
        {stepOrder.map((item, index) => (
          <li
            key={item}
            className={index === activeIndex ? 'is-current' : index < activeIndex ? 'is-complete' : ''}
            aria-current={index === activeIndex ? 'step' : undefined}
            aria-label={`${index + 1}. ${stepLabels[item].ar}${index === activeIndex ? ' — المرحلة الحالية' : ''}`}
          >
            <span className="gsdw-progress-node"><i />{String(index + 1).padStart(2, '0')}</span>
            <span><strong>{stepLabels[item].ar}</strong><small dir="ltr">{stepLabels[item].en}</small></span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

type FamilyFieldProps = {
  selectedIds: SolutionFamilyId[];
  onSelect: (id: SolutionFamilyId) => void;
  selectionLimit?: number;
  label: string;
};

function FamilyField({ selectedIds, onSelect, selectionLimit = 1, label }: FamilyFieldProps) {
  return (
    <div className="gsdw-family-field" role="group" aria-label={label} data-count={selectedIds.length}>
      <span className="gsdw-family-axis" aria-hidden="true"><i /><i /><i /></span>
      {solutionFamilies.map((family) => {
        const selected = selectedIds.includes(family.id);
        const atLimit = selectionLimit > 1 && selectedIds.length >= selectionLimit && !selected;
        return (
          <button
            key={family.id}
            type="button"
            className={selected ? 'is-selected' : ''}
            aria-pressed={selected}
            aria-disabled={atLimit}
            onClick={() => onSelect(family.id)}
          >
            <FamilyMark family={family} />
            <span><strong>{family.title}</strong><small>{family.cue}</small></span>
            {selectionLimit > 1 && selected ? <em>{selectedIds.indexOf(family.id) + 1}</em> : null}
          </button>
        );
      })}
    </div>
  );
}

function FamilyQuickContext({ family }: { family: SolutionFamily }) {
  return (
    <div className="gsdw-quick-context" aria-live="polite">
      <div>
        <span className="gsdw-mini-label">النتيجة التي ينظمها</span>
        <p>{family.problem}</p>
      </div>
      <div>
        <span className="gsdw-mini-label">حلقة التشغيل</span>
        <ol>
          {family.operatingLoop.map((item, index) => <li key={item}><b dir="ltr">0{index + 1}</b>{item}</li>)}
        </ol>
      </div>
      <div>
        <span className="gsdw-mini-label">تنبيه حدود</span>
        <p>{family.doesNotFit}</p>
      </div>
    </div>
  );
}

function ComparisonField({ families, onChoose }: { families: SolutionFamily[]; onChoose: (id: SolutionFamilyId) => void }) {
  return (
    <div className="gsdw-comparison" aria-label="مقارنة اتجاهي الحل">
      <div className="gsdw-comparison-head" aria-hidden="true">
        <span>بُعد القرار</span>
        {families.map((family) => <strong key={family.id}>{family.title}</strong>)}
      </div>
      {[
        { label: 'النتيجة', render: (family: SolutionFamily) => family.problem },
        { label: 'حلقة التشغيل', render: (family: SolutionFamily) => family.operatingLoop.join(' ← ') },
        { label: 'عمق التكوين', render: (family: SolutionFamily) => family.complexityNote },
        { label: 'الاعتمادات', render: (family: SolutionFamily) => family.dependencies.slice(0, 2).join('، ') },
        { label: 'الحدود', render: (family: SolutionFamily) => family.doesNotFit },
      ].map((row) => (
        <div className="gsdw-comparison-row" key={row.label}>
          <span>{row.label}</span>
          {families.map((family) => <p key={family.id}>{row.render(family)}</p>)}
        </div>
      ))}
      <div className="gsdw-comparison-actions">
        <span>الاتجاه الأقرب الآن</span>
        {families.map((family) => (
          <button key={family.id} type="button" className="gsdw-button gsdw-button--quiet" onClick={() => onChoose(family.id)}>
            اعتماد {family.title}
          </button>
        ))}
      </div>
    </div>
  );
}

function CapabilityRow({
  capability,
  selected,
  onToggle,
}: {
  capability: Capability;
  selected: boolean;
  onToggle: () => void;
}) {
  const locked = capability.classification === 'CORE';

  return (
    <button
      type="button"
      className={`gsdw-capability ${selected ? 'is-selected' : ''} ${locked ? 'is-locked' : ''}`}
      aria-pressed={selected}
      onClick={onToggle}
      disabled={locked}
    >
      <span className="gsdw-capability-state" aria-hidden="true"><i /></span>
      <span><strong>{capability.name}</strong><small>{capability.description}</small></span>
      <em data-classification={capability.classification}>{classificationLabels[capability.classification]}</em>
    </button>
  );
}

function SummaryRow({
  kind,
  label,
  provenance,
  children,
}: {
  kind: SummaryKind;
  label: string;
  provenance?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="gsdw-summary-row" data-kind={kind}>
      <div><span>{label}</span><em>{provenance ?? summaryKindLabels[kind]}</em></div>
      <div>{children}</div>
    </div>
  );
}

function EvidenceBadge({ state }: { state: EvidenceState }) {
  return (
    <span className="gsdw-evidence" data-state={state}>
      <strong>{evidenceLabels[state]}</strong>
    </span>
  );
}

function initialCapabilities(family: SolutionFamily) {
  return family.capabilities
    .filter((capability) => capability.classification === 'CORE' || capability.classification === 'RECOMMENDED')
    .map((capability) => capability.name);
}

export function SolutionsDecisionWorkspace({
  initialMode,
  onDecisionChange,
  onStartDiscovery,
}: SolutionsDecisionWorkspaceProps) {
  const [step, setStep] = useState<WorkspaceStep>(initialMode ? 'qualify' : 'entry');
  const [mode, setMode] = useState<EntryMode | undefined>(initialMode);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [facts, setFacts] = useState<DecisionFacts>({ constraints: '' });
  const [manualFamilyId, setManualFamilyId] = useState<SolutionFamilyId>();
  const [compareIds, setCompareIds] = useState<SolutionFamilyId[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation>();
  const [decisionOrigin, setDecisionOrigin] = useState<DecisionOrigin>();
  const [recommendationResolution, setRecommendationResolution] = useState<RecommendationResolution>();
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [userSelectedCapabilities, setUserSelectedCapabilities] = useState<string[]>([]);
  const [configuration, setConfiguration] = useState<ConfigurationDirectionId>('focused');
  const [configurationPhase, setConfigurationPhase] = useState<ConfigurationPhase>('capabilities');
  const [budgetPreference, setBudgetPreference] = useState<BudgetPreferenceId>('unknown');
  const [budgetRange, setBudgetRange] = useState('');
  const [confirmedDependencies, setConfirmedDependencies] = useState<string[]>([]);
  const [transitionPrepared, setTransitionPrepared] = useState(false);
  const workspaceRef = useRef<HTMLElement>(null);
  const pendingFocusStepRef = useRef<WorkspaceStep>();

  const selectedFamily = recommendation?.recommendedId
    ? familyById[recommendation.recommendedId]
    : undefined;
  const alternativeFamily = recommendation?.alternativeId ? familyById[recommendation.alternativeId] : undefined;
  const activeQuestion = finderQuestions[questionIndex];
  const activeOptionId = activeQuestion ? facts[activeQuestion.key] : undefined;

  const moveToStep = (nextStep: WorkspaceStep) => {
    pendingFocusStepRef.current = nextStep;
    setStep(nextStep);
  };

  useEffect(() => {
    if (pendingFocusStepRef.current !== step) return;
    const target = workspaceRef.current?.querySelector<HTMLElement>(`[data-step-focus="${step}"]`);
    if (!target) return;
    target.focus({ preventScroll: true });
    pendingFocusStepRef.current = undefined;
  }, [configurationPhase, mode, recommendation, selectedFamily, step]);

  const unknowns = useMemo(() => {
    if (!recommendation || !selectedFamily) return [];
    const items = [...recommendation.missing];
    selectedFamily.dependencies.forEach((dependency) => {
      if (!confirmedDependencies.includes(dependency)) items.push(`اعتماد غير محسوم: ${dependency}`);
    });
    if (budgetPreference === 'unknown') items.push('تفضيل الميزانية غير محدد');
    if (configuration === 'custom') items.push('تفاصيل التخصيص تحتاج جلسة اكتشاف');
    selectedFamily.capabilities.forEach((capability) => {
      if (selectedCapabilities.includes(capability.name) && capability.classification === 'CUSTOM') {
        items.push(`نطاق «${capability.name}» يحتاج جلسة اكتشاف`);
      }
    });
    return Array.from(new Set(items));
  }, [budgetPreference, configuration, confirmedDependencies, recommendation, selectedCapabilities, selectedFamily]);

  const capabilitySelections = useMemo<CapabilitySelection[]>(() => {
    if (!selectedFamily) return [];
    return selectedCapabilities.map((name) => {
      const capability = selectedFamily.capabilities.find((item) => item.name === name);
      return {
        name,
        classification: capability?.classification ?? 'CUSTOM',
        provenance: userSelectedCapabilities.includes(name) ? 'USER_SELECTED' : 'SYSTEM_SEEDED',
      };
    });
  }, [selectedCapabilities, selectedFamily, userSelectedCapabilities]);

  const snapshot = useMemo<DecisionSnapshot | undefined>(() => {
    if (!mode || !recommendation?.recommendedId || !selectedFamily || !decisionOrigin) return undefined;
    return {
      entryMode: mode,
      facts,
      recommendedFamily: recommendation.recommendedId,
      alternativeFamily: recommendation.alternativeId,
      decisionOrigin,
      recommendationResolution,
      selectedCapabilities,
      capabilitySelections,
      configuration,
      budgetPreference,
      budgetRange,
      confirmedDependencies,
      unknowns,
      evidenceState: selectedFamily.reference.evidenceState,
    };
  }, [budgetPreference, budgetRange, capabilitySelections, configuration, confirmedDependencies, decisionOrigin, facts, mode, recommendation, recommendationResolution, selectedCapabilities, selectedFamily, unknowns]);

  useEffect(() => {
    if (snapshot) onDecisionChange?.(snapshot);
  }, [onDecisionChange, snapshot]);

  const resetDecision = (nextMode?: EntryMode) => {
    setMode(nextMode);
    setQuestionIndex(0);
    setFacts({ constraints: '' });
    setManualFamilyId(undefined);
    setCompareIds([]);
    setRecommendation(undefined);
    setDecisionOrigin(undefined);
    setRecommendationResolution(undefined);
    setSelectedCapabilities([]);
    setUserSelectedCapabilities([]);
    setConfiguration('focused');
    setConfigurationPhase('capabilities');
    setBudgetPreference('unknown');
    setBudgetRange('');
    setConfirmedDependencies([]);
    setTransitionPrepared(false);
    moveToStep(nextMode ? 'qualify' : 'entry');
  };

  const buildUserSelection = (
    recommendedId: SolutionFamilyId,
    origin: DecisionOrigin,
    alternativeId?: SolutionFamilyId,
    reasons: string[] = [],
    resolutionContext?: RecommendationResolution,
  ) => {
    const nextRecommendation: Recommendation = {
      resolution: resolutionContext ?? 'decisive',
      recommendedId,
      candidateIds: [recommendedId],
      alternativeId,
      reasons,
      missing: recommendation?.missing ?? ['النتيجة التفصيلية لم تُجمع عبر Finder', 'القيود الخاصة غير مذكورة'],
    };
    setRecommendation(nextRecommendation);
    setDecisionOrigin(origin);
    setRecommendationResolution(resolutionContext);
    setSelectedCapabilities(initialCapabilities(familyById[recommendedId]));
    setUserSelectedCapabilities([]);
    setConfirmedDependencies([]);
    moveToStep('recommend');
  };

  const chooseOpenDirection = (recommendedId: SolutionFamilyId) => {
    if (!recommendation || recommendation.recommendedId) return;
    const previousResolution = recommendation.resolution;
    const alternativeId = recommendation.candidateIds.find((candidateId) => candidateId !== recommendedId);
    const nextRecommendation: Recommendation = {
      ...recommendation,
      recommendedId,
      alternativeId,
      reasons: [
        ...recommendation.reasons,
        `اخترت أنت ${familyById[recommendedId].title} من الاتجاهات التي بقيت مفتوحة.`,
      ],
    };
    setRecommendation(nextRecommendation);
    setDecisionOrigin('USER_OPEN_DIRECTION');
    setRecommendationResolution(previousResolution);
    setSelectedCapabilities(initialCapabilities(familyById[recommendedId]));
    setUserSelectedCapabilities([]);
    setConfirmedDependencies([]);
    moveToStep('recommend');
  };

  const finishFinder = () => {
    const nextRecommendation = recommendFromFacts(facts);
    setRecommendation(nextRecommendation);
    setDecisionOrigin(nextRecommendation.recommendedId ? 'SYSTEM_FINDER' : undefined);
    setRecommendationResolution(nextRecommendation.resolution);
    setSelectedCapabilities(
      nextRecommendation.recommendedId
        ? initialCapabilities(familyById[nextRecommendation.recommendedId])
        : [],
    );
    setUserSelectedCapabilities([]);
    setConfirmedDependencies([]);
    moveToStep('recommend');
  };

  const toggleCompare = (id: SolutionFamilyId) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 2) return current;
      return [...current, id];
    });
  };

  const toggleCapability = (capability: Capability) => {
    if (capability.classification === 'CORE') return;
    const wasSelected = selectedCapabilities.includes(capability.name);
    setSelectedCapabilities((current) => (
      wasSelected
        ? current.filter((item) => item !== capability.name)
        : [...current, capability.name]
    ));
    setUserSelectedCapabilities((current) => (
      wasSelected
        ? current.filter((item) => item !== capability.name)
        : Array.from(new Set([...current, capability.name]))
    ));
  };

  const budgetStatus = (() => {
    if (budgetPreference === 'unknown') return 'لم تقدّم تفضيلًا للميزانية بعد؛ يبقى القيد غير محسوم.';
    if (configuration === 'custom') return 'سُجّل تفضيلك فقط؛ يحتاج الاتجاه المخصص إلى اكتشاف الاعتمادات قبل أي تقييم مالي.';
    if (budgetPreference === 'control' && configuration !== 'focused') return 'تفضيل ضبط التعقيد مسجّل، بينما التكوين الحالي أوسع من المسار المركز.';
    return 'تفضيل الميزانية مسجّل كقيد من إدخالك؛ ولا يمثّل سعرًا أو تقييم ملاءمة مالية.';
  })();

  const goToConfiguration = () => {
    setConfigurationPhase('capabilities');
    moveToStep('configure');
  };

  const showSummary = () => {
    setTransitionPrepared(false);
    moveToStep('summary');
  };

  const prepareDiscovery = () => {
    if (!snapshot) return;
    setTransitionPrepared(true);
    onStartDiscovery?.(snapshot);
  };

  const selectedFactRows = finderQuestions
    .map((question) => ({ label: question.eyebrow, value: getFactLabel(question.key, facts[question.key]) }))
    .filter((item) => item.value);

  const directionPresentation = (() => {
    switch (decisionOrigin) {
      case 'SYSTEM_FINDER':
        return {
          code: 'RECOMMENDED DIRECTION',
          badge: 'اتجاه أولي قابل للمراجعة',
          label: 'الاتجاه الموصى به الآن',
          reasonLabel: 'لماذا أوصى Finder بهذا الاتجاه؟',
          summaryLabel: 'الاتجاه الموصى به',
          provenance: 'توصية النظام الحاسمة من المدخلات المتاحة',
        };
      case 'USER_COMPARE':
        return {
          code: 'CHOSEN AFTER COMPARE',
          badge: 'اختيارك بعد المقارنة',
          label: 'الاتجاه الذي اخترته بعد المقارنة',
          reasonLabel: 'سياق اختيارك بعد المقارنة',
          summaryLabel: 'الاتجاه المختار بعد المقارنة',
          provenance: 'اتجاه اخترته أنت بعد المقارنة',
        };
      case 'USER_OPEN_DIRECTION':
        return {
          code: 'SELECTED OPEN DIRECTION',
          badge: recommendationResolution === 'tied' ? 'اختيارك بعد تعادل الاتجاهات' : 'اختيارك مع بقاء معلومات ناقصة',
          label: 'الاتجاه الذي اخترته من الخيارات المفتوحة',
          reasonLabel: 'سياق اختيارك من الاتجاهات المفتوحة',
          summaryLabel: 'الاتجاه المختار من خيارات مفتوحة',
          provenance: recommendationResolution === 'tied'
            ? 'اختيارك بعد تعادل Finder؛ لم يحوّل النظام التعادل إلى توصية'
            : 'اختيارك مع بقاء معلومات Finder غير كافية للحسم',
        };
      case 'USER_ALTERNATIVE':
        return {
          code: 'SELECTED ALTERNATIVE',
          badge: 'اختيارك بعد مراجعة البديل',
          label: 'الاتجاه البديل الذي اخترته',
          reasonLabel: 'سياق تغييرك للاتجاه',
          summaryLabel: 'الاتجاه الذي اخترته بعد مراجعة البديل',
          provenance: 'اتجاه بديل اخترته أنت بعد المراجعة',
        };
      case 'USER_DIRECT':
      default:
        return {
          code: 'SELECTED DIRECTION',
          badge: 'اختيارك المباشر',
          label: 'الاتجاه الذي اخترته',
          reasonLabel: 'سياق اختيارك المباشر',
          summaryLabel: 'الاتجاه الذي اخترته',
          provenance: 'اتجاه بدأت منه أنت مباشرة',
        };
    }
  })();

  const alternativeProvenance = decisionOrigin === 'SYSTEM_FINDER'
    ? 'بديل اقترحه النظام'
    : 'اتجاه بديل ضمن الخيارات التي راجعتها';

  return (
    <section
      ref={workspaceRef}
      id="solutions-decision-workspace"
      className="gsdw"
      dir="rtl"
      data-step={step}
      data-mode={mode ?? 'unset'}
      data-family={selectedFamily?.id ?? 'unset'}
      data-decision-origin={decisionOrigin ?? 'unset'}
      data-recommendation-resolution={recommendationResolution ?? 'unset'}
    >
      <div className="gsdw-atmosphere" aria-hidden="true"><i /><i /><i /></div>

      <header className="gsdw-header">
        <a className="gsdw-brand" href="#solutions-decision-workspace" aria-label="GS — مساحة قرار الحلول">
          <span aria-hidden="true"><b>GS</b></span>
          <span><strong>مساحة قرار الحلول</strong><small dir="ltr">SOLUTIONS DECISION WORKSPACE</small></span>
        </a>
        <div className="gsdw-header-state">
          <span><i /> القرار الحالي محفوظ داخل هذه الجلسة</span>
          {mode ? <button type="button" onClick={() => resetDecision()}>تغيير نقطة البداية</button> : null}
        </div>
      </header>

      <ProgressRail step={step} />

      <div className="gsdw-stage">
        {step === 'entry' ? (
          <section className="gsdw-entry" aria-labelledby="gsdw-entry-title">
            <div className="gsdw-entry-copy">
              <span className="gsdw-eyebrow"><i /> GS-PUB-002 <b>مساحة قرار واحدة</b></span>
              <h1 id="gsdw-entry-title" data-route-focus data-step-focus="entry" tabIndex={-1}>لا تحتاج أن تعرف<br />اسم الحل قبل أن تبدأ.</h1>
              <p>ابدأ من النتيجة أو من اتجاه تعرفه، وسنحافظ على الفرق بين ما ذكرته، وما فضّلته، وما لا يزال مجهولًا.</p>
              <div className="gsdw-principle">
                <span dir="ltr">NO ASSUMED CERTAINTY</span>
                <p>توصية محدودة، قابلة للتفسير والمراجعة.</p>
              </div>
            </div>
            <div className="gsdw-mode-field" role="group" aria-label="اختر نقطة البداية">
              {modeContent.map((item) => (
                <button key={item.id} type="button" onClick={() => resetDecision(item.id)}>
                  <span className="gsdw-mode-number" dir="ltr"><b>{item.number}</b></span>
                  <span><small>{item.route}</small><strong>{item.title}</strong><p>{item.detail}</p></span>
                  <span className="gsdw-arrow" aria-hidden="true">←</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {step === 'qualify' && mode === 'discover' && activeQuestion ? (
          <section className="gsdw-qualify" aria-labelledby="gsdw-question-title">
            <div className="gsdw-context-column">
              <span className="gsdw-eyebrow"><i /> FINDER <b>سؤال {questionIndex + 1} من {finderQuestions.length}</b></span>
              <h2>نضيّق مساحة القرار<br />معلومة واحدة كل مرة.</h2>
              <div className="gsdw-answer-ledger">
                <span>المعلومات المسجلة</span>
                {finderQuestions.map((question, index) => {
                  const value = getFactLabel(question.key, facts[question.key]);
                  return (
                    <button
                      key={question.key}
                      type="button"
                      className={index === questionIndex ? 'is-current' : value ? 'is-answered' : ''}
                      onClick={() => value && setQuestionIndex(index)}
                      disabled={!value && index !== questionIndex}
                    >
                      <b dir="ltr">0{index + 1}</b>
                      <span><small>{question.eyebrow}</small><strong>{value ?? 'لم يُسأل بعد'}</strong></span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="gsdw-question-field">
              <span className="gsdw-mini-label">{activeQuestion.eyebrow}</span>
              <h2 id="gsdw-question-title" data-step-focus="qualify" tabIndex={-1}>{activeQuestion.title}</h2>
              <p>{activeQuestion.help}</p>
              <div className="gsdw-options" role="radiogroup" aria-label={activeQuestion.title}>
                {activeQuestion.options.map((option, index) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={activeOptionId === option.id}
                    tabIndex={activeOptionId === option.id || (!activeOptionId && index === 0) ? 0 : -1}
                    onKeyDown={handleRovingRadioKeyDown}
                    onClick={() => setFacts((current) => ({ ...current, [activeQuestion.key]: option.id }))}
                  >
                    <span className="gsdw-radio" aria-hidden="true"><i /></span>
                    <span><strong>{option.label}</strong><small>{option.detail}</small></span>
                  </button>
                ))}
              </div>
              {questionIndex === finderQuestions.length - 1 ? (
                <label className="gsdw-constraints-input">
                  <span>قيد تعرفه الآن <small>اختياري</small></span>
                  <textarea
                    value={facts.constraints}
                    onChange={(event) => setFacts((current) => ({ ...current, constraints: event.target.value }))}
                    placeholder="مثال: نظام قائم يجب مراعاته، أو محتوى غير جاهز بعد"
                    rows={3}
                  />
                </label>
              ) : null}
              <div className="gsdw-question-actions">
                <button
                  type="button"
                  className="gsdw-button gsdw-button--quiet"
                  onClick={() => questionIndex === 0 ? resetDecision() : setQuestionIndex((current) => current - 1)}
                >
                  رجوع
                </button>
                <button
                  type="button"
                  className="gsdw-button gsdw-button--primary"
                  disabled={!activeOptionId}
                  onClick={() => questionIndex === finderQuestions.length - 1 ? finishFinder() : setQuestionIndex((current) => current + 1)}
                >
                  {questionIndex === finderQuestions.length - 1 ? 'بناء الاتجاه' : 'السؤال التالي'} <span aria-hidden="true">←</span>
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {step === 'qualify' && mode === 'direction' ? (
          <section className="gsdw-family-selection" aria-labelledby="gsdw-direction-title">
            <div className="gsdw-section-heading">
              <span className="gsdw-eyebrow"><i /> DIRECTION <b>اتجاه أولي</b></span>
              <h2 id="gsdw-direction-title" data-step-focus="qualify" tabIndex={-1}>اختر المجال الأقرب،<br />ثم اختبر حدوده.</h2>
              <p>الاختيار هنا نقطة بداية وليس توصيفًا نهائيًا للنطاق.</p>
            </div>
            <FamilyField
              selectedIds={manualFamilyId ? [manualFamilyId] : []}
              onSelect={(id) => setManualFamilyId(id)}
              label="اختر عائلة الحل الأقرب"
            />
            {manualFamilyId ? (
              <>
                <FamilyQuickContext family={familyById[manualFamilyId]} />
                <div className="gsdw-inline-action">
                  <span>سيراجع الاتجاه التالي الملاءمة والحدود والمعلومات الناقصة دون تحويل اختيارك إلى توصية نظام.</span>
                  <button
                    type="button"
                    className="gsdw-button gsdw-button--primary"
                    onClick={() => buildUserSelection(
                      manualFamilyId,
                      'USER_DIRECT',
                      undefined,
                      [`اخترت مباشرة: ${familyById[manualFamilyId].title}`],
                    )}
                  >
                    مراجعة هذا الاتجاه <span aria-hidden="true">←</span>
                  </button>
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        {step === 'qualify' && mode === 'compare' ? (
          <section className="gsdw-family-selection" aria-labelledby="gsdw-compare-title">
            <div className="gsdw-section-heading">
              <span className="gsdw-eyebrow"><i /> COMPARE <b>{compareIds.length} / 2</b></span>
              <h2 id="gsdw-compare-title" data-step-focus="qualify" tabIndex={-1}>اختر اتجاهين<br />لمقارنة ما يغيّر القرار.</h2>
              <p>نقارن التشغيل والاعتمادات والحدود، لا عدد المزايا.</p>
            </div>
            <FamilyField
              selectedIds={compareIds}
              onSelect={toggleCompare}
              selectionLimit={2}
              label="اختر عائلتين للمقارنة"
            />
            {compareIds.length === 2 ? (
              <ComparisonField
                families={compareIds.map((id) => familyById[id])}
                onChoose={(id) => {
                  const alternativeId = compareIds.find((item) => item !== id);
                  buildUserSelection(
                    id,
                    'USER_COMPARE',
                    alternativeId,
                    [`اخترت هذا الاتجاه بعد مقارنة ${familyById[id].title} مع ${alternativeId ? familyById[alternativeId].title : 'اتجاه آخر'}`],
                  );
                }}
              />
            ) : (
              <div className="gsdw-waiting-cue"><i /> اختر {2 - compareIds.length} {compareIds.length === 0 ? 'اتجاهين' : 'اتجاه إضافي'} لفتح المقارنة.</div>
            )}
          </section>
        ) : null}

        {step === 'recommend' && recommendation && !recommendation.recommendedId ? (
          <section className="gsdw-recommendation gsdw-recommendation--open" aria-labelledby="gsdw-open-directions-title">
            <div className="gsdw-recommendation-lead">
              <span className="gsdw-eyebrow"><i /> OPEN DIRECTIONS <b>{recommendation.resolution === 'tied' ? 'تعادل يحتاج فرقًا حقيقيًا' : 'الدليل غير كافٍ للحسم'}</b></span>
              <div className="gsdw-open-direction-title">
                <h2 id="gsdw-open-directions-title" data-step-focus="recommend" tabIndex={-1}>لا يوجد اتجاه منفرد يمكن تبريره بعد.</h2>
                <p>
                  {recommendation.resolution === 'tied'
                    ? 'أكثر من عائلة تتصدر بالقدر نفسه وفق المعلومات الحالية. لن نكسر التعادل بترتيب خفي.'
                    : 'المعلومات المحسومة قليلة جدًا لإظهار عائلة واحدة كتوصية فريدة. تبقى الاتجاهات التالية مفتوحة للمراجعة.'}
                </p>
              </div>
              <div className="gsdw-fit-reasons">
                <span className="gsdw-mini-label">ما الذي نعرفه الآن؟</span>
                {recommendation.reasons.length ? (
                  <ul>{recommendation.reasons.map((reason) => <li key={reason}><i />{reason}</li>)}</ul>
                ) : <p>لم تُجمع بعد معلومة تفاضل بين عائلات الحل.</p>}
              </div>
            </div>

            <div className="gsdw-recommendation-grid gsdw-open-directions" aria-label="الاتجاهات التي ما زالت مفتوحة">
              {recommendation.candidateIds.map((familyId) => {
                const family = familyById[familyId];
                return (
                  <article className="gsdw-alternative-panel" key={family.id} data-open-family={family.id}>
                    <span className="gsdw-panel-code" dir="ltr">OPEN DIRECTION</span>
                    <span className="gsdw-mini-label">اتجاه يحتاج معلومة مميِّزة</span>
                    <h3>{family.title}</h3>
                    <p>{family.problem}</p>
                    <button
                      type="button"
                      className="gsdw-button gsdw-button--quiet"
                      onClick={() => chooseOpenDirection(family.id)}
                    >
                      اختيار {family.title}
                    </button>
                  </article>
                );
              })}
              <article className="gsdw-unknown-panel gsdw-open-unknowns">
                <span className="gsdw-panel-code" dir="ltr">NEEDS DIFFERENTIATION</span>
                <span className="gsdw-mini-label">ما الذي يمكن أن يغيّر القرار؟</span>
                <ul>{recommendation.missing.map((item) => <li key={item}><i />{item}</li>)}</ul>
              </article>
            </div>

            <div className="gsdw-decision-bar">
              <div><span>الخطوة التالية</span><p>يمكنك مراجعة إجابة غير محسومة، أو اختيار اتجاه مفتوح مع إبقاء عدم الحسم صريحًا.</p></div>
              <button
                type="button"
                className="gsdw-button gsdw-button--primary"
                onClick={() => { setQuestionIndex(0); moveToStep('qualify'); }}
              >
                مراجعة الإجابات <span aria-hidden="true">←</span>
              </button>
            </div>
          </section>
        ) : null}

        {step === 'recommend' && selectedFamily && recommendation ? (
          <section className="gsdw-recommendation" aria-labelledby="gsdw-recommendation-title">
            <div className="gsdw-recommendation-lead">
              <span className="gsdw-eyebrow"><i /> {directionPresentation.code} <b>{directionPresentation.badge}</b></span>
              <div className="gsdw-recommendation-title">
                <FamilyMark family={selectedFamily} />
                <div><small>{directionPresentation.label}</small><h2 id="gsdw-recommendation-title" data-step-focus="recommend" tabIndex={-1}>{selectedFamily.title}</h2><p>{selectedFamily.problem}</p></div>
              </div>
              <div className="gsdw-fit-reasons">
                <span className="gsdw-mini-label">{directionPresentation.reasonLabel}</span>
                {recommendation.reasons.length > 0 ? (
                  <ul>{recommendation.reasons.map((reason) => <li key={reason}><i />{reason}</li>)}</ul>
                ) : <p>لم تُضف معلومات تتجاوز اختيارك الحالي.</p>}
              </div>
            </div>

            <div className="gsdw-recommendation-grid">
              <article className="gsdw-fit-panel">
                <span className="gsdw-panel-code" dir="ltr">FIT / LIMITS</span>
                <div><span className="gsdw-mini-label">يناسب عندما</span><ul>{selectedFamily.fits.map((fit) => <li key={fit}>{fit}</li>)}</ul></div>
                <div className="is-warning"><span className="gsdw-mini-label">قد لا يناسب عندما</span><p>{selectedFamily.doesNotFit}</p></div>
              </article>

              <article className="gsdw-unknown-panel">
                <span className="gsdw-panel-code" dir="ltr">KNOWN / UNKNOWN</span>
                <span className="gsdw-mini-label">معلومات ما زالت ناقصة</span>
                <ul>{recommendation.missing.map((item) => <li key={item}><i />{item}</li>)}</ul>
                <p>المعلومات الناقصة لا تخفض «نسبة تطابق»؛ هي حدود صريحة لما يمكن قوله الآن.</p>
              </article>

              {alternativeFamily ? (
                <article className="gsdw-alternative-panel">
                  <span className="gsdw-panel-code" dir="ltr">ALTERNATIVE</span>
                  <span className="gsdw-mini-label">اتجاه بديل يستحق النظر</span>
                  <h3>{alternativeFamily.title}</h3>
                  <p>{alternativeFamily.problem}</p>
                  <button
                    type="button"
                    onClick={() => buildUserSelection(
                      alternativeFamily.id,
                      'USER_ALTERNATIVE',
                      selectedFamily.id,
                      [`اخترت الاتجاه البديل بعد المراجعة: ${alternativeFamily.title}`],
                      recommendationResolution,
                    )}
                  >
                    اجعله الاتجاه الأساسي
                  </button>
                </article>
              ) : null}
            </div>

            <div className="gsdw-family-context">
              <details>
                <summary><span>نموذج التشغيل والقدرات</span><small>افتح السياق عند الحاجة</small></summary>
                <div className="gsdw-details-grid">
                  <div><span className="gsdw-mini-label">حلقة التشغيل</span><ol>{selectedFamily.operatingLoop.map((item, index) => <li key={item}><b dir="ltr">0{index + 1}</b>{item}</li>)}</ol></div>
                  <div><span className="gsdw-mini-label">مجموعات القدرات</span><ul>{selectedFamily.capabilities.map((capability) => <li key={capability.name}><span>{capability.name}</span><em>{classificationLabels[capability.classification]}</em></li>)}</ul></div>
                </div>
              </details>
              <details>
                <summary><span>الاعتمادات والحدود</span><small>ما قد يغيّر النطاق</small></summary>
                <div className="gsdw-details-grid">
                  <div><span className="gsdw-mini-label">اعتمادات</span><ul>{selectedFamily.dependencies.map((item) => <li key={item}>{item}</li>)}</ul></div>
                  <div><span className="gsdw-mini-label">حدود</span><ul>{selectedFamily.boundaries.map((item) => <li key={item}>{item}</li>)}</ul></div>
                </div>
              </details>
              <details>
                <summary><span>السياق المرجعي وحالة الدليل</span><small>{evidenceLabels[selectedFamily.reference.evidenceState]}</small></summary>
                <div className="gsdw-reference-context">
                  <EvidenceBadge state={selectedFamily.reference.evidenceState} />
                  {selectedFamily.reference.code ? <b dir="ltr">{selectedFamily.reference.code}</b> : null}
                  <div><h3>{selectedFamily.reference.title}</h3><p>{selectedFamily.reference.note}</p></div>
                </div>
              </details>
            </div>

            <div className="gsdw-decision-bar">
              <div><span>القرار التالي</span><p>{selectedFamily.nextDecision}</p></div>
              <button type="button" className="gsdw-button gsdw-button--primary" onClick={goToConfiguration}>
                تكوين الاتجاه <span aria-hidden="true">←</span>
              </button>
            </div>
          </section>
        ) : null}

        {step === 'configure' && selectedFamily ? (
          <section className="gsdw-configure" aria-labelledby="gsdw-configure-title" data-phase={configurationPhase}>
            <div className="gsdw-section-heading gsdw-section-heading--compact">
              <span className="gsdw-eyebrow"><i /> CONFIGURATION <b>ليس عرض سعر</b></span>
              <h2 id="gsdw-configure-title" data-step-focus="configure" tabIndex={-1}>كوّن ما يخدم القرار،<br />واترك الباقي خارج المشهد.</h2>
              <p>{selectedFamily.title} — كل اختيار هنا تفضيل قابل للمراجعة.</p>
            </div>
            <nav className="gsdw-config-phases" aria-label="مراحل التكوين">
              {([
                ['capabilities', '01', 'القدرات ذات الصلة'],
                ['options', '02', 'اتجاه التكوين'],
                ['constraints', '03', 'الميزانية والاعتمادات'],
              ] as Array<[ConfigurationPhase, string, string]>).map(([phase, number, label]) => (
                <button
                  key={phase}
                  type="button"
                  className={configurationPhase === phase ? 'is-current' : ''}
                  aria-current={configurationPhase === phase ? 'step' : undefined}
                  onClick={() => setConfigurationPhase(phase)}
                >
                  <b dir="ltr">{number}</b><span>{label}</span>
                </button>
              ))}
            </nav>

            {configurationPhase === 'capabilities' ? (
              <div className="gsdw-capability-stage">
                <div className="gsdw-stage-note">
                  <span className="gsdw-mini-label">تغطية مرتبطة بـ {selectedFamily.title}</span>
                  <p>يبدأ نموذج GS بالقدرات الأساسية والموصى بها لهذا الاتجاه. الأساسية ثابتة، وبقية الحالات قابلة للتعديل؛ الإدراج المبدئي لا يعني أنك اخترت كل قدرة على حدة. لا توجد قائمة شاملة أو معرّفات قدرات مفترضة.</p>
                </div>
                <div className="gsdw-capabilities">
                  {selectedFamily.capabilities.map((capability) => (
                    <CapabilityRow
                      key={capability.name}
                      capability={capability}
                      selected={selectedCapabilities.includes(capability.name)}
                      onToggle={() => toggleCapability(capability)}
                    />
                  ))}
                </div>
                <div className="gsdw-inline-action">
                  <span>{selectedCapabilities.length} مجموعات قدرات مدرجة في التكوين الحالي.</span>
                  <button type="button" className="gsdw-button gsdw-button--primary" onClick={() => setConfigurationPhase('options')}>
                    مقارنة اتجاه التكوين <span aria-hidden="true">←</span>
                  </button>
                </div>
              </div>
            ) : null}

            {configurationPhase === 'options' ? (
              <div className="gsdw-option-stage">
                <div className="gsdw-stage-note">
                  <span className="gsdw-mini-label">مقارنة اختلافات القرار</span>
                  <p>هذه اتجاهات تكوين وليست باقات أو عروضًا تجارية. لا تتضمن سعرًا أو مدة تسليم.</p>
                </div>
                <div className="gsdw-option-matrix" role="radiogroup" aria-label="اختر اتجاه التكوين">
                  <div className="gsdw-matrix-labels" aria-hidden="true">
                    <span>العمق التشغيلي</span><span>تغطية القدرات</span><span>التخصيص</span><span>التكامل</span><span>التقارير والتحكم</span><span>الحاجة إلى جلسة الاكتشاف</span>
                  </div>
                  {configurationDirections.map((direction) => (
                    <button
                      key={direction.id}
                      type="button"
                      role="radio"
                      aria-checked={configuration === direction.id}
                      tabIndex={configuration === direction.id ? 0 : -1}
                      className={configuration === direction.id ? 'is-selected' : ''}
                      onKeyDown={handleRovingRadioKeyDown}
                      onClick={() => setConfiguration(direction.id)}
                    >
                      <span className="gsdw-matrix-head"><i /><small>{direction.shortLabel}</small><strong>{direction.title}</strong><p>{direction.description}</p></span>
                      <span>{direction.dimensions.operationalDepth}</span>
                      <span>{direction.dimensions.capabilityCoverage}</span>
                      <span>{direction.dimensions.customization}</span>
                      <span>{direction.dimensions.integration}</span>
                      <span>{direction.dimensions.reporting}</span>
                      <span>{direction.dimensions.discovery}</span>
                    </button>
                  ))}
                </div>
                <div className="gsdw-inline-action">
                  <span>الاتجاه المختار: {configurationDirections.find((item) => item.id === configuration)?.title}</span>
                  <button type="button" className="gsdw-button gsdw-button--primary" onClick={() => setConfigurationPhase('constraints')}>
                    إضافة القيود والميزانية <span aria-hidden="true">←</span>
                  </button>
                </div>
              </div>
            ) : null}

            {configurationPhase === 'constraints' ? (
              <div className="gsdw-constraint-stage">
                <div className="gsdw-budget-field">
                  <div className="gsdw-stage-note">
                    <span className="gsdw-mini-label">تفضيل الميزانية</span>
                    <p>اختر طريقة التعامل مع القيد، ثم أضف نطاقك إن كان معروفًا. لن يتحول ذلك إلى سعر مشروع.</p>
                  </div>
                  <div className="gsdw-budget-options" role="radiogroup" aria-label="تفضيل الميزانية">
                    {budgetPreferences.map((preference) => (
                      <button
                        key={preference.id}
                        type="button"
                        role="radio"
                        aria-checked={budgetPreference === preference.id}
                        tabIndex={budgetPreference === preference.id ? 0 : -1}
                        onKeyDown={handleRovingRadioKeyDown}
                        onClick={() => setBudgetPreference(preference.id)}
                      >
                        <span className="gsdw-radio" aria-hidden="true"><i /></span>
                        <span><strong>{preference.title}</strong><small>{preference.detail}</small></span>
                      </button>
                    ))}
                  </div>
                  <label className="gsdw-budget-input">
                    <span>نطاق أو ملاحظة الميزانية التي تقدمها أنت <small>اختياري</small></span>
                    <input
                      dir="auto"
                      value={budgetRange}
                      onChange={(event) => setBudgetRange(event.target.value)}
                      placeholder="اكتب النطاق أو القيد بصيغتك"
                    />
                  </label>
                  <div className="gsdw-budget-status"><i /><span><small>قراءة القيد المدخل</small><strong>{budgetStatus}</strong></span></div>
                </div>

                <div className="gsdw-dependency-field">
                  <div className="gsdw-stage-note">
                    <span className="gsdw-mini-label">الاعتمادات</span>
                    <p>علّم فقط ما تعرف أنه متوفر أو محسوم. سيبقى الباقي ظاهرًا كغير معروف.</p>
                  </div>
                  <div className="gsdw-dependencies">
                    {selectedFamily.dependencies.map((dependency) => {
                      const checked = confirmedDependencies.includes(dependency);
                      return (
                        <label key={dependency} className={checked ? 'is-checked' : ''}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setConfirmedDependencies((current) => (
                              checked ? current.filter((item) => item !== dependency) : [...current, dependency]
                            ))}
                          />
                          <span className="gsdw-check" aria-hidden="true"><i /></span>
                          <span><strong>{dependency}</strong><small>{checked ? 'معلوم / متوفر حسب إدخالك' : 'غير محسوم'}</small></span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="gsdw-inline-action gsdw-inline-action--wide">
                  <span>{unknowns.length} عناصر ستبقى ظاهرة كغير محسومة في الملخص.</span>
                  <button type="button" className="gsdw-button gsdw-button--primary" onClick={showSummary}>
                    إنتاج ملخص القرار <span aria-hidden="true">←</span>
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {step === 'summary' && selectedFamily && recommendation ? (
          <section className="gsdw-summary" aria-labelledby="gsdw-summary-title">
            <div className="gsdw-summary-heading">
              <span className="gsdw-eyebrow"><i /> DECISION SUMMARY <b>جاهز للمراجعة</b></span>
              <h2 id="gsdw-summary-title" data-step-focus="summary" tabIndex={-1}>قرار منظم،<br />لا يقين مصطنع.</h2>
              <p>يفصل هذا الملخص بين ما قدّمته، ومصدر الاتجاه الحالي، والتكوين المدرج الآن، وما يحتاج اكتشافًا لاحقًا.</p>
              <div className="gsdw-summary-legend" aria-label="مفتاح أنواع المعلومات">
                <span data-kind="fact"><i /> معلومات قدّمتها</span>
                <span data-kind="recommendation"><i /> {decisionOrigin === 'SYSTEM_FINDER' ? 'توصية النظام' : 'اتجاه اخترته أنت'}</span>
                <span data-kind="configuration"><i /> التكوين الحالي</span>
                <span data-kind="unknown"><i /> يحتاج اكتشافًا</span>
              </div>
            </div>

            <div className="gsdw-summary-sheet">
              <div className="gsdw-sheet-head">
                <div><span dir="ltr">GS / DS-{selectedFamily.number}</span><small>ملخص قرار قابل للمراجعة</small></div>
                <strong>{selectedFamily.title}</strong>
              </div>

              {selectedFactRows.length > 0 ? (
                <SummaryRow kind="fact" label="المشكلة والنتيجة" provenance="إجابات قدّمتها أنت">
                  <ul>{selectedFactRows.map((item) => <li key={item.label}><span>{item.label}</span>{item.value}</li>)}</ul>
                  {facts.constraints ? <p><span>قيد ذكرته:</span> {facts.constraints}</p> : null}
                </SummaryRow>
              ) : (
                <SummaryRow kind="unknown" label="المشكلة والنتيجة">لم تُجمع عبر Finder؛ بدأ القرار من عائلة حل.</SummaryRow>
              )}

              <SummaryRow kind="recommendation" label={directionPresentation.summaryLabel} provenance={directionPresentation.provenance}>
                <strong>{selectedFamily.title}</strong><p>{selectedFamily.problem}</p>
              </SummaryRow>

              {alternativeFamily ? (
                <SummaryRow kind="recommendation" label="الاتجاه البديل" provenance={alternativeProvenance}>
                  <strong>{alternativeFamily.title}</strong><p>{alternativeFamily.problem}</p>
                </SummaryRow>
              ) : null}

              <SummaryRow kind="configuration" label="القدرات المدرجة حاليًا">
                <p className="gsdw-capability-provenance">تُعرض كل قدرة مع مصدر إدراجها؛ القدرات الأساسية والموصى بها قد يبدأ بها النظام، ولا تتحول إلى اختيار منك إلا إذا أضفتها بعد إزالتها أو اخترت قدرة أخرى بنفسك.</p>
                <div className="gsdw-summary-capabilities">
                  {capabilitySelections.map((selection) => (
                    <span
                      key={selection.name}
                      data-classification={selection.classification}
                      data-provenance={selection.provenance}
                    >
                      <strong>{selection.name}</strong>
                      <small>
                        {classificationLabels[selection.classification]} · {selection.provenance === 'USER_SELECTED' ? 'اخترتها أنت' : 'مدرجة مبدئيًا من النظام'}
                      </small>
                    </span>
                  ))}
                </div>
              </SummaryRow>

              <SummaryRow kind="configuration" label="اتجاه التكوين المدرج">
                <strong>{configurationDirections.find((item) => item.id === configuration)?.title}</strong>
                <p>{budgetStatus}</p>
              </SummaryRow>

              <SummaryRow
                kind={budgetPreference === 'unknown' && !budgetRange.trim() ? 'unknown' : 'fact'}
                label="قيد أو تفضيل الميزانية"
                provenance={budgetPreference === 'unknown' && !budgetRange.trim() ? undefined : 'معلومة قدّمتها أنت'}
              >
                <strong>{budgetLabels[budgetPreference]}</strong>
                <p>{budgetRange ? `النطاق أو الملاحظة التي قدمتها: ${budgetRange}` : 'لم يُدخل نطاق مالي.'}</p>
              </SummaryRow>

              {confirmedDependencies.length > 0 ? (
                <SummaryRow kind="fact" label="الاعتمادات المؤكدة" provenance="توفرها حسب إدخالك">
                  <ul>{confirmedDependencies.map((dependency) => <li key={dependency}>{dependency}</li>)}</ul>
                </SummaryRow>
              ) : null}

              <SummaryRow kind="unknown" label="الاعتمادات والمعلومات الناقصة">
                {unknowns.length > 0 ? <ul>{unknowns.map((item) => <li key={item}>{item}</li>)}</ul> : <p>لا توجد عناصر غير محسومة ضمن مدخلات هذا النموذج الحالي.</p>}
              </SummaryRow>

              <SummaryRow kind="evidence" label="السياق المرجعي وحالة الدليل">
                <div className="gsdw-summary-reference">
                  <EvidenceBadge state={selectedFamily.reference.evidenceState} />
                  {selectedFamily.reference.code ? <b dir="ltr">{selectedFamily.reference.code}</b> : null}
                  <strong>{selectedFamily.reference.title}</strong>
                  <p>{selectedFamily.reference.note}</p>
                </div>
              </SummaryRow>
            </div>

            <aside className="gsdw-summary-actions">
              <span className="gsdw-mini-label">راجع قبل الانتقال</span>
              <button type="button" onClick={() => moveToStep('recommend')}><span>01</span> راجع الاتجاه</button>
              <button type="button" onClick={() => { setConfigurationPhase('capabilities'); moveToStep('configure'); }}><span>02</span> عدّل القدرات</button>
              <button type="button" onClick={() => { setConfigurationPhase('constraints'); moveToStep('configure'); }}><span>03</span> عدّل الميزانية والاعتمادات</button>
              <div className="gsdw-next-action">
                <small>الخطوة المقترحة</small>
                <strong>بدء جلسة <bdi dir="ltr">Discovery</bdi> بهذه الخلاصة</strong>
                <p>لا يتم إرسال شيء تلقائيًا. نقطة الربط متاحة للتكامل مع مسار <bdi dir="ltr">Start / Discovery</bdi>.</p>
                <button type="button" className="gsdw-button gsdw-button--primary" onClick={prepareDiscovery}>
                  تجهيز الانتقال إلى <bdi dir="ltr">Discovery</bdi> <span aria-hidden="true">←</span>
                </button>
                {transitionPrepared ? <div className="gsdw-prepared" role="status"><i /> تم تجهيز الملخص للانتقال. لم يُرسل شيء بعد.</div> : null}
              </div>
            </aside>
          </section>
        ) : null}
      </div>

      <div className="gsdw-footer">
        <span dir="ltr">GS / SOLUTIONS / DECISION WORKSPACE</span>
        <span>قرار مبني على معلوماتك — بلا أسعار أو وعود أو أدلة مفترضة.</span>
      </div>
    </section>
  );
}
