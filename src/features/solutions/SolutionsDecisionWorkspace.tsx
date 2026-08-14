import { useEffect, useMemo, useState } from 'react';
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
  ConfigurationDirectionId,
  ConfigurationPhase,
  DecisionFacts,
  DecisionSnapshot,
  EntryMode,
  EvidenceState,
  Recommendation,
  SolutionFamily,
  SolutionFamilyId,
  SolutionsDecisionWorkspaceProps,
  WorkspaceStep,
} from '../../types/solutions';
import './solutionsDecisionWorkspace.css';

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
  CORE: 'أساسي / مطلوب',
  RECOMMENDED: 'موصى به',
  OPTIONAL: 'اختياري',
  CONDITIONAL: 'مشروط',
  CUSTOM: 'مخصص / يحتاج اكتشاف',
};

const evidenceLabels: Record<EvidenceState, string> = {
  VERIFIED_IMPLEMENTATION: 'تنفيذ متحقق',
  REVIEWED_VISUAL_EVIDENCE: 'دليل بصري مراجع',
  BOUNDED_DEMO: 'عرض تجريبي محدود',
  REFERENCE_ONLY: 'سياق مرجعي فقط',
  PLANNED: 'مخطط',
  NOT_AVAILABLE: 'غير متاح',
  REJECTED: 'مرفوض',
};

const budgetLabels = Object.fromEntries(
  budgetPreferences.map((preference) => [preference.id, preference.title]),
) as Record<BudgetPreferenceId, string>;

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
  children,
}: {
  kind: 'fact' | 'preference' | 'unknown';
  label: string;
  children: React.ReactNode;
}) {
  const kindLabel = kind === 'fact' ? 'حقيقة مدخلة' : kind === 'preference' ? 'تفضيل' : 'غير محسوم';
  return (
    <div className="gsdw-summary-row" data-kind={kind}>
      <div><span>{label}</span><em>{kindLabel}</em></div>
      <div>{children}</div>
    </div>
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
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [configuration, setConfiguration] = useState<ConfigurationDirectionId>('focused');
  const [configurationPhase, setConfigurationPhase] = useState<ConfigurationPhase>('capabilities');
  const [budgetPreference, setBudgetPreference] = useState<BudgetPreferenceId>('unknown');
  const [budgetRange, setBudgetRange] = useState('');
  const [confirmedDependencies, setConfirmedDependencies] = useState<string[]>([]);
  const [transitionPrepared, setTransitionPrepared] = useState(false);

  const selectedFamily = recommendation ? familyById[recommendation.recommendedId] : undefined;
  const alternativeFamily = recommendation?.alternativeId ? familyById[recommendation.alternativeId] : undefined;
  const activeQuestion = finderQuestions[questionIndex];
  const activeOptionId = activeQuestion ? facts[activeQuestion.key] : undefined;

  const unknowns = useMemo(() => {
    if (!recommendation || !selectedFamily) return [];
    const items = [...recommendation.missing];
    selectedFamily.dependencies.forEach((dependency) => {
      if (!confirmedDependencies.includes(dependency)) items.push(`اعتماد غير محسوم: ${dependency}`);
    });
    if (budgetPreference === 'unknown') items.push('تفضيل الميزانية غير محدد');
    if (configuration === 'custom') items.push('تفاصيل التخصيص تحتاج Discovery');
    selectedFamily.capabilities.forEach((capability) => {
      if (selectedCapabilities.includes(capability.name) && capability.classification === 'CUSTOM') {
        items.push(`نطاق «${capability.name}» يحتاج Discovery`);
      }
    });
    return Array.from(new Set(items));
  }, [budgetPreference, configuration, confirmedDependencies, recommendation, selectedCapabilities, selectedFamily]);

  const snapshot = useMemo<DecisionSnapshot | undefined>(() => {
    if (!mode || !recommendation || !selectedFamily) return undefined;
    return {
      entryMode: mode,
      facts,
      recommendedFamily: recommendation.recommendedId,
      alternativeFamily: recommendation.alternativeId,
      selectedCapabilities,
      configuration,
      budgetPreference,
      budgetRange,
      confirmedDependencies,
      unknowns,
      evidenceState: selectedFamily.reference.evidenceState,
    };
  }, [budgetPreference, budgetRange, configuration, confirmedDependencies, facts, mode, recommendation, selectedCapabilities, selectedFamily, unknowns]);

  useEffect(() => {
    if (snapshot) onDecisionChange?.(snapshot);
  }, [onDecisionChange, snapshot]);

  const resetDecision = (nextMode?: EntryMode) => {
    setMode(nextMode);
    setStep(nextMode ? 'qualify' : 'entry');
    setQuestionIndex(0);
    setFacts({ constraints: '' });
    setManualFamilyId(undefined);
    setCompareIds([]);
    setRecommendation(undefined);
    setSelectedCapabilities([]);
    setConfiguration('focused');
    setConfigurationPhase('capabilities');
    setBudgetPreference('unknown');
    setBudgetRange('');
    setConfirmedDependencies([]);
    setTransitionPrepared(false);
  };

  const buildRecommendation = (recommendedId: SolutionFamilyId, alternativeId?: SolutionFamilyId, reasons: string[] = []) => {
    const nextRecommendation: Recommendation = {
      recommendedId,
      alternativeId,
      reasons,
      missing: ['النتيجة التفصيلية لم تُجمع عبر Finder', 'القيود الخاصة غير مذكورة'],
    };
    setRecommendation(nextRecommendation);
    setSelectedCapabilities(initialCapabilities(familyById[recommendedId]));
    setConfirmedDependencies([]);
    setStep('recommend');
  };

  const finishFinder = () => {
    const nextRecommendation = recommendFromFacts(facts);
    setRecommendation(nextRecommendation);
    setSelectedCapabilities(initialCapabilities(familyById[nextRecommendation.recommendedId]));
    setConfirmedDependencies([]);
    setStep('recommend');
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
    setSelectedCapabilities((current) => (
      current.includes(capability.name)
        ? current.filter((item) => item !== capability.name)
        : [...current, capability.name]
    ));
  };

  const budgetStatus = (() => {
    if (budgetPreference === 'unknown') return 'معلومات غير كافية — تفضيل الميزانية غير محدد.';
    if (configuration === 'custom') return 'يحتاج Discovery — لا يمكن تقييم اتجاه مخصص قبل فهم الاعتمادات.';
    if (budgetPreference === 'control' && configuration !== 'focused') return 'اتجاه أعلى تعقيدًا من تفضيل ضبط النطاق الحالي.';
    if (configuration === 'connected') return 'اتجاه محتمل، ويحتاج Discovery لحسم الاعتمادات.';
    return 'متوافق مبدئيًا مع اتجاه التكوين الحالي، وليس سعرًا نهائيًا.';
  })();

  const goToConfiguration = () => {
    setConfigurationPhase('capabilities');
    setStep('configure');
  };

  const showSummary = () => {
    setTransitionPrepared(false);
    setStep('summary');
  };

  const prepareDiscovery = () => {
    if (!snapshot) return;
    setTransitionPrepared(true);
    onStartDiscovery?.(snapshot);
  };

  const selectedFactRows = finderQuestions
    .map((question) => ({ label: question.eyebrow, value: getFactLabel(question.key, facts[question.key]) }))
    .filter((item) => item.value);

  return (
    <main
      id="solutions-decision-workspace"
      className="gsdw"
      dir="rtl"
      data-step={step}
      data-mode={mode ?? 'unset'}
      data-family={selectedFamily?.id ?? 'unset'}
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
              <h1 id="gsdw-entry-title">لا تحتاج أن تعرف<br />اسم الحل قبل أن تبدأ.</h1>
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
              <h2 id="gsdw-question-title">{activeQuestion.title}</h2>
              <p>{activeQuestion.help}</p>
              <div className="gsdw-options" role="radiogroup" aria-label={activeQuestion.title}>
                {activeQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={activeOptionId === option.id}
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
              <h2 id="gsdw-direction-title">اختر المجال الأقرب،<br />ثم اختبر حدوده.</h2>
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
                  <span>سيتحقق الاتجاه التالي من الملاءمة والحدود والمعلومات الناقصة.</span>
                  <button
                    type="button"
                    className="gsdw-button gsdw-button--primary"
                    onClick={() => buildRecommendation(manualFamilyId, undefined, [`اتجاهك الأولي: ${familyById[manualFamilyId].title}`])}
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
              <h2 id="gsdw-compare-title">اختر اتجاهين<br />لمقارنة ما يغيّر القرار.</h2>
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
                  buildRecommendation(id, alternativeId, [`اخترت هذا الاتجاه بعد مقارنة ${familyById[id].title} مع ${alternativeId ? familyById[alternativeId].title : 'اتجاه آخر'}`]);
                }}
              />
            ) : (
              <div className="gsdw-waiting-cue"><i /> اختر {2 - compareIds.length} {compareIds.length === 0 ? 'اتجاهين' : 'اتجاه إضافي'} لفتح المقارنة.</div>
            )}
          </section>
        ) : null}

        {step === 'recommend' && selectedFamily && recommendation ? (
          <section className="gsdw-recommendation" aria-labelledby="gsdw-recommendation-title">
            <div className="gsdw-recommendation-lead">
              <span className="gsdw-eyebrow"><i /> RECOMMENDED DIRECTION <b>اتجاه أولي قابل للمراجعة</b></span>
              <div className="gsdw-recommendation-title">
                <FamilyMark family={selectedFamily} />
                <div><small>الاتجاه الموصى به الآن</small><h2 id="gsdw-recommendation-title">{selectedFamily.title}</h2><p>{selectedFamily.problem}</p></div>
              </div>
              <div className="gsdw-fit-reasons">
                <span className="gsdw-mini-label">لماذا ظهر هذا الاتجاه؟</span>
                {recommendation.reasons.length > 0 ? (
                  <ul>{recommendation.reasons.map((reason) => <li key={reason}><i />{reason}</li>)}</ul>
                ) : <p>بناءً على الاتجاه الذي اخترته مباشرة، دون استنتاج معلومات إضافية.</p>}
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
                    onClick={() => buildRecommendation(alternativeFamily.id, selectedFamily.id, [`راجعت الاتجاه البديل: ${alternativeFamily.title}`])}
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
                  <span className="gsdw-evidence" data-state={selectedFamily.reference.evidenceState} dir="ltr">
                    {selectedFamily.reference.evidenceState}
                  </span>
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
              <h2 id="gsdw-configure-title">كوّن ما يخدم القرار،<br />واترك الباقي خارج المشهد.</h2>
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
                  <p>الأساسي مثبت. يمكنك إضافة أو إزالة الموصى به والاختياري والمشروط. لا توجد قائمة شاملة أو معرّفات قدرات مفترضة.</p>
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
                  <span>{selectedCapabilities.length} مجموعات قدرات في القرار الحالي.</span>
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
                    <span>العمق التشغيلي</span><span>تغطية القدرات</span><span>التخصيص</span><span>التكامل</span><span>التقارير والتحكم</span><span>الحاجة إلى Discovery</span>
                  </div>
                  {configurationDirections.map((direction) => (
                    <button
                      key={direction.id}
                      type="button"
                      role="radio"
                      aria-checked={configuration === direction.id}
                      className={configuration === direction.id ? 'is-selected' : ''}
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
                  <div className="gsdw-budget-status"><i /><span><small>حالة التوافق الحالية</small><strong>{budgetStatus}</strong></span></div>
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
              <h2 id="gsdw-summary-title">قرار منظم،<br />لا يقين مصطنع.</h2>
              <p>هذا الملخص يجمع الحقائق التي أدخلتها والتفضيلات التي اخترتها وما يحتاج اكتشافًا لاحقًا.</p>
              <div className="gsdw-summary-legend" aria-label="مفتاح أنواع المعلومات">
                <span data-kind="fact"><i /> حقيقة مدخلة</span>
                <span data-kind="preference"><i /> تفضيل حالي</span>
                <span data-kind="unknown"><i /> غير محسوم</span>
              </div>
            </div>

            <div className="gsdw-summary-sheet">
              <div className="gsdw-sheet-head">
                <div><span dir="ltr">GS / DS-{selectedFamily.number}</span><small>ملخص قرار قابل للمراجعة</small></div>
                <strong>{selectedFamily.title}</strong>
              </div>

              {selectedFactRows.length > 0 ? (
                <SummaryRow kind="fact" label="المشكلة والنتيجة">
                  <ul>{selectedFactRows.map((item) => <li key={item.label}><span>{item.label}</span>{item.value}</li>)}</ul>
                  {facts.constraints ? <p><span>قيد ذكرته:</span> {facts.constraints}</p> : null}
                </SummaryRow>
              ) : (
                <SummaryRow kind="unknown" label="المشكلة والنتيجة">لم تُجمع عبر Finder؛ بدأ القرار من عائلة حل.</SummaryRow>
              )}

              <SummaryRow kind="preference" label="الاتجاه الموصى به">
                <strong>{selectedFamily.title}</strong><p>{selectedFamily.problem}</p>
              </SummaryRow>

              {alternativeFamily ? (
                <SummaryRow kind="preference" label="الاتجاه البديل">
                  <strong>{alternativeFamily.title}</strong><p>{alternativeFamily.problem}</p>
                </SummaryRow>
              ) : null}

              <SummaryRow kind="preference" label="القدرات المختارة">
                <div className="gsdw-summary-capabilities">
                  {selectedCapabilities.map((capability) => <span key={capability}>{capability}</span>)}
                </div>
              </SummaryRow>

              <SummaryRow kind="preference" label="اتجاه التكوين">
                <strong>{configurationDirections.find((item) => item.id === configuration)?.title}</strong>
                <p>{budgetStatus}</p>
              </SummaryRow>

              <SummaryRow kind="preference" label="تفضيل الميزانية">
                <strong>{budgetLabels[budgetPreference]}</strong>
                <p>{budgetRange ? `النطاق أو الملاحظة التي قدمتها: ${budgetRange}` : 'لم يُدخل نطاق مالي.'}</p>
              </SummaryRow>

              <SummaryRow kind={unknowns.length > 0 ? 'unknown' : 'fact'} label="الاعتمادات والمعلومات الناقصة">
                {unknowns.length > 0 ? <ul>{unknowns.map((item) => <li key={item}>{item}</li>)}</ul> : <p>لا توجد عناصر غير محسومة في المدخلات الحالية.</p>}
              </SummaryRow>

              <SummaryRow kind="fact" label="السياق المرجعي وحالة الدليل">
                <div className="gsdw-summary-reference">
                  <span className="gsdw-evidence" data-state={selectedFamily.reference.evidenceState} dir="ltr">{selectedFamily.reference.evidenceState}</span>
                  {selectedFamily.reference.code ? <b dir="ltr">{selectedFamily.reference.code}</b> : null}
                  <strong>{selectedFamily.reference.title}</strong>
                  <p>{selectedFamily.reference.note}</p>
                </div>
              </SummaryRow>
            </div>

            <aside className="gsdw-summary-actions">
              <span className="gsdw-mini-label">راجع قبل الانتقال</span>
              <button type="button" onClick={() => setStep('recommend')}><span>01</span> راجع الاتجاه</button>
              <button type="button" onClick={() => { setConfigurationPhase('capabilities'); setStep('configure'); }}><span>02</span> عدّل القدرات</button>
              <button type="button" onClick={() => { setConfigurationPhase('constraints'); setStep('configure'); }}><span>03</span> عدّل الميزانية والاعتمادات</button>
              <div className="gsdw-next-action">
                <small>الخطوة المقترحة</small>
                <strong>بدء Discovery بهذه الخلاصة</strong>
                <p>لا يتم إرسال شيء تلقائيًا. نقطة الربط متاحة للتكامل مع مسار Start / Discovery.</p>
                <button type="button" className="gsdw-button gsdw-button--primary" onClick={prepareDiscovery}>
                  تجهيز الانتقال إلى Discovery <span aria-hidden="true">←</span>
                </button>
                {transitionPrepared ? <div className="gsdw-prepared" role="status"><i /> تم تجهيز الملخص للانتقال. لم يُرسل شيء بعد.</div> : null}
              </div>
            </aside>
          </section>
        ) : null}
      </div>

      <footer className="gsdw-footer">
        <span dir="ltr">GS / SOLUTIONS / DECISION WORKSPACE</span>
        <span>قرار مبني على معلوماتك — بلا أسعار أو وعود أو أدلة مفترضة.</span>
      </footer>
    </main>
  );
}
