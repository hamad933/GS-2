import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clipboard,
  CornerDownLeft,
  Pencil,
  Printer,
  Sparkles,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  budgetOptions,
  certaintyOptions,
  configurationOptions,
  domainOptions,
  objectiveOptions,
  stepLabels,
  summaryStatusContent,
  timingOptions,
} from '../../data/start-discovery/discoveryContent';
import type {
  DiscoveryCertainty,
  DiscoveryStepId,
  DiscoverySummaryStatus,
  StartDiscoveryBodyProps,
  StartDiscoveryDraft,
} from '../../types/start-discovery';
import {
  buildDiscoverySummary,
  createStartDiscoveryDraft,
  formatDiscoverySummary,
  formatListInput,
  getDiscoverySteps,
  parseListInput,
} from './discoveryModel';
import './start-discovery.css';

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  optional?: boolean;
  error?: string;
  errorId?: string;
  children: ReactNode;
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  optional?: boolean;
  error?: string;
  multiline?: boolean;
}

interface ListFieldProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  value: string[];
  onChange: (value: string[]) => void;
}

const statusEditStep: Record<DiscoverySummaryStatus, DiscoveryStepId> = {
  known: 'foundation',
  selected: 'configuration',
  preferred: 'preferences',
  dependent: 'dependencies',
  unknown: 'preferences',
};

const stageIntros: Partial<Record<DiscoveryStepId, string>> = {
  foundation: 'ابدأ بما تريد تغييره، لا باسم المنتج الذي تتوقعه.',
  'people-outcomes': 'أضف ما يقرّبنا من الاستخدام الحقيقي والنتيجة المرغوبة.',
  configuration: 'سجّل ما حُسم وما يزال مجرد احتمال؛ سنبقي الفرق واضحًا.',
  dependencies: 'هذه ليست وعود تكامل. إنها قائمة تحقق لما يجب فحصه لاحقًا.',
  preferences: 'التفضيلات هنا تساعد على تشكيل النقاش ولا تنشئ سعرًا أو موعدًا.',
};

function Field({
  label,
  htmlFor,
  hint,
  optional,
  error,
  errorId,
  children,
}: FieldProps) {
  return (
    <div className={`sd-field${error ? ' sd-field--error' : ''}`}>
      <div className="sd-field__heading">
        {htmlFor ? <label htmlFor={htmlFor}>{label}</label> : <span>{label}</span>}
        <small>{optional ? 'اختياري' : 'مطلوب'}</small>
      </div>
      {hint ? <p className="sd-field__hint">{hint}</p> : null}
      {children}
      {error ? (
        <p id={errorId} className="sd-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  optional,
  error,
  multiline = true,
}: TextFieldProps) {
  const controlProps = {
    id,
    value,
    placeholder,
    dir: 'auto' as const,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${id}-error` : undefined,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => onChange(event.target.value),
  };

  return (
    <Field
      label={label}
      htmlFor={id}
      hint={hint}
      optional={optional}
      error={error}
      errorId={`${id}-error`}
    >
      {multiline ? (
        <textarea {...controlProps} rows={3} />
      ) : (
        <input {...controlProps} type="text" />
      )}
    </Field>
  );
}

function ListField({ value, onChange, ...props }: ListFieldProps) {
  return (
    <TextField
      {...props}
      value={formatListInput(value)}
      onChange={(nextValue) => onChange(parseListInput(nextValue))}
      hint={props.hint ?? 'افصل بين البنود بسطر جديد أو فاصلة.'}
    />
  );
}

function ChoiceSet({
  label,
  options,
  value,
  onChange,
  optional = true,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
}) {
  return (
    <Field label={label} optional={optional}>
      <div className="sd-choice-set" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={value === option ? 'is-selected' : ''}
            aria-pressed={value === option}
            onClick={() => onChange(value === option ? '' : option)}
          >
            <span>{option}</span>
            <i aria-hidden="true">{value === option ? <Check /> : null}</i>
          </button>
        ))}
      </div>
    </Field>
  );
}

function StageHeader({
  id,
  title,
  eyebrow,
  headingRef,
}: {
  id: string;
  title: string;
  eyebrow: string;
  headingRef: React.RefObject<HTMLHeadingElement>;
}) {
  return (
    <header className="sd-stage-header">
      <p>{eyebrow}</p>
      <h2 id={id} ref={headingRef} tabIndex={-1}>
        {title}
      </h2>
    </header>
  );
}

export function StartDiscoveryBody({
  prefill,
  initialCertainty,
  className = '',
  onDraftChange,
  onLocalComplete,
}: StartDiscoveryBodyProps) {
  const [draft, setDraft] = useState<StartDiscoveryDraft>(() =>
    createStartDiscoveryDraft(prefill, initialCertainty),
  );
  const [currentStep, setCurrentStep] = useState<DiscoveryStepId>(
    initialCertainty ? 'foundation' : 'certainty',
  );
  const [visited, setVisited] = useState<Set<DiscoveryStepId>>(
    () =>
      new Set(
        initialCertainty
          ? (['certainty', 'foundation'] as DiscoveryStepId[])
          : ['certainty'],
      ),
  );
  const [returnToSummary, setReturnToSummary] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copyState, setCopyState] = useState('');
  const stageHeadingRef = useRef<HTMLHeadingElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const steps = useMemo(() => getDiscoverySteps(draft.certainty), [draft.certainty]);
  const summary = useMemo(() => buildDiscoverySummary(draft), [draft]);
  const currentIndex = steps.indexOf(currentStep);
  const visibleIndex = currentStep === 'complete' ? steps.length : Math.max(currentIndex + 1, 1);
  const answeredCount = summary.groups.reduce(
    (total, summaryGroup) =>
      total + summaryGroup.items.reduce((count, entry) => count + entry.values.length, 0),
    0,
  );

  useEffect(() => {
    onDraftChange?.(draft);
  }, [draft, onDraftChange]);

  useEffect(() => {
    setVisited((current) => new Set(current).add(currentStep));
    stageHeadingRef.current?.focus({ preventScroll: true });
    setCopyState('');
  }, [currentStep]);

  function updateDraft<K extends keyof StartDiscoveryDraft>(
    key: K,
    value: StartDiscoveryDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function selectCertainty(certainty: DiscoveryCertainty) {
    updateDraft('certainty', certainty);
  }

  function validateStep(step: DiscoveryStepId) {
    const nextErrors: Record<string, string> = {};
    if (step === 'certainty' && !draft.certainty) {
      nextErrors.certainty = 'اختر العبارة الأقرب إلى وضعك الحالي.';
    }
    if (step === 'foundation') {
      if (!draft.objective.trim()) nextErrors.objective = 'حدد هدفًا رئيسيًا للمشروع.';
      if (!draft.currentProblem.trim()) {
        nextErrors.currentProblem = 'صف المشكلة الحالية بجملة واحدة على الأقل.';
      }
    }
    if (
      step === 'configuration' &&
      (draft.certainty === 'configured' || draft.certainty === 'detailed') &&
      !draft.recommendedFamily.trim() &&
      !draft.selectedCapabilities.length
    ) {
      nextErrors.recommendedFamily =
        'اذكر الحل أو العائلة أو قدرة واحدة سبق أن اخترتها.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      window.requestAnimationFrame(() => {
        const invalid = workspaceRef.current?.querySelector<HTMLElement>(
          '[aria-invalid="true"], .sd-certainty-options',
        );
        invalid?.focus();
      });
      return false;
    }
    return true;
  }

  function goNext() {
    if (!validateStep(currentStep)) return;
    if (currentStep === 'summary') {
      setCurrentStep('complete');
      onLocalComplete?.(summary, draft);
      return;
    }
    if (returnToSummary) {
      setReturnToSummary(false);
      setCurrentStep('summary');
      return;
    }
    const nextStep = steps[currentIndex + 1];
    if (nextStep) setCurrentStep(nextStep);
  }

  function goBack() {
    if (currentStep === 'complete') {
      setCurrentStep('summary');
      return;
    }
    if (returnToSummary) {
      setReturnToSummary(false);
      setCurrentStep('summary');
      return;
    }
    const previousStep = steps[currentIndex - 1];
    if (previousStep) setCurrentStep(previousStep);
  }

  function editSummary(step: DiscoveryStepId) {
    if (!steps.includes(step)) return;
    setReturnToSummary(true);
    setCurrentStep(step);
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(formatDiscoverySummary(summary));
      setCopyState('تم نسخ الملخص إلى جهازك.');
    } catch {
      setCopyState('تعذر النسخ التلقائي. يمكنك استخدام أمر الطباعة بدلًا منه.');
    }
  }

  const stageContent = (() => {
    if (currentStep === 'certainty') {
      return (
        <>
          <StageHeader
            id="sd-stage-title"
            headingRef={stageHeadingRef}
            eyebrow="01 · مستوى الوضوح"
            title="من أين تريد أن نبدأ؟"
          />
          <p className="sd-stage-lead">
            لا توجد إجابة أفضل من أخرى. اختيارك يغيّر طول المسار والأسئلة التالية.
          </p>
          <div
            className="sd-certainty-options"
            role="radiogroup"
            aria-label="مستوى وضوح متطلبات المشروع"
            aria-invalid={Boolean(errors.certainty)}
            tabIndex={errors.certainty ? -1 : undefined}
          >
            {certaintyOptions.map((option) => {
              const selected = draft.certainty === option.value;
              return (
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  key={option.value}
                  className={selected ? 'is-selected' : ''}
                  onClick={() => selectCertainty(option.value)}
                >
                  <bdi>{option.marker}</bdi>
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                  <i aria-hidden="true">{selected ? <Check /> : null}</i>
                </button>
              );
            })}
          </div>
          {errors.certainty ? (
            <p className="sd-field__error" role="alert">
              {errors.certainty}
            </p>
          ) : null}
        </>
      );
    }

    if (currentStep === 'foundation') {
      return (
        <>
          <StageHeader
            id="sd-stage-title"
            headingRef={stageHeadingRef}
            eyebrow="02 · تعريف الحاجة"
            title="ما الذي يستحق أن يتغيّر؟"
          />
          <p className="sd-stage-lead">{stageIntros.foundation}</p>
          <Field label="الهدف الرئيسي" error={errors.objective}>
            <div className="sd-objective-options" role="group" aria-label="أهداف مقترحة">
              {objectiveOptions.map((option) => (
                <button
                  type="button"
                  key={option}
                  aria-pressed={draft.objective === option}
                  className={draft.objective === option ? 'is-selected' : ''}
                  onClick={() => updateDraft('objective', option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <input
              id="sd-objective"
              type="text"
              dir="auto"
              value={draft.objective}
              aria-label="الهدف الرئيسي بصياغتك"
              aria-invalid={Boolean(errors.objective)}
              placeholder="أو اكتب الهدف بصياغتك…"
              onChange={(event) => updateDraft('objective', event.target.value)}
            />
          </Field>
          <TextField
            id="sd-current-problem"
            label="المشكلة الحالية"
            value={draft.currentProblem}
            error={errors.currentProblem}
            placeholder="ما الذي يحدث اليوم وتريد تغييره؟"
            onChange={(value) => updateDraft('currentProblem', value)}
          />
          <ChoiceSet
            label="النشاط أو المجال"
            options={domainOptions}
            value={draft.domain}
            onChange={(value) => updateDraft('domain', value)}
          />
        </>
      );
    }

    if (currentStep === 'people-outcomes') {
      return (
        <>
          <StageHeader
            id="sd-stage-title"
            headingRef={stageHeadingRef}
            eyebrow="03 · سياق الاستخدام"
            title="لمن؟ وماذا يجب أن يتحسن؟"
          />
          <p className="sd-stage-lead">{stageIntros['people-outcomes']}</p>
          <TextField
            id="sd-users"
            label="المستخدمون المقصودون"
            value={draft.intendedUsers}
            optional
            placeholder="مثال: فريق العمليات، عملاء جدد، شركاء…"
            onChange={(value) => updateDraft('intendedUsers', value)}
          />
          <TextField
            id="sd-outcomes"
            label="النتائج المتوقعة"
            value={draft.expectedOutcomes}
            optional
            placeholder="ما النتيجة التي ستجعل المشروع مفيدًا؟ دون أرقام غير مؤكدة."
            onChange={(value) => updateDraft('expectedOutcomes', value)}
          />
          <TextField
            id="sd-workflows"
            label="أهم سير عمل"
            value={draft.importantWorkflows}
            optional
            placeholder="رحلة أو إجراء يجب أن يعمل بوضوح…"
            onChange={(value) => updateDraft('importantWorkflows', value)}
          />
        </>
      );
    }

    if (currentStep === 'configuration') {
      return (
        <>
          <StageHeader
            id="sd-stage-title"
            headingRef={stageHeadingRef}
            eyebrow="04 · قرار الحل"
            title="ما الذي اخترته؟ وما الذي ما زال احتمالًا؟"
          />
          <p className="sd-stage-lead">{stageIntros.configuration}</p>
          <TextField
            id="sd-family"
            label="الحل أو العائلة المقترحة"
            value={draft.recommendedFamily}
            optional={draft.certainty !== 'configured' && draft.certainty !== 'detailed'}
            error={errors.recommendedFamily}
            multiline={false}
            placeholder="اسم العائلة أو الاتجاه إن كان معروفًا"
            onChange={(value) => updateDraft('recommendedFamily', value)}
          />
          <ListField
            id="sd-selected-capabilities"
            label="قدرات حُسمت مبدئيًا"
            value={draft.selectedCapabilities}
            optional
            placeholder={'بوابة خدمة\nإدارة طلبات'}
            onChange={(value) => updateDraft('selectedCapabilities', value)}
          />
          <ListField
            id="sd-optional-capabilities"
            label="قدرات اختيارية"
            value={draft.optionalCapabilities}
            optional
            placeholder={'تقارير إضافية\nتجربة متعددة اللغات'}
            onChange={(value) => updateDraft('optionalCapabilities', value)}
          />
          <ListField
            id="sd-uncertain-capabilities"
            label="قدرات غير محسومة"
            value={draft.uncertainCapabilities}
            optional
            placeholder="أي قدرة تحتاج مقارنة أو تحققًا"
            onChange={(value) => updateDraft('uncertainCapabilities', value)}
          />
          <ChoiceSet
            label="تفضيل التكوين"
            options={configurationOptions}
            value={draft.configurationPreference}
            onChange={(value) => updateDraft('configurationPreference', value)}
          />
        </>
      );
    }

    if (currentStep === 'dependencies') {
      return (
        <>
          <StageHeader
            id="sd-stage-title"
            headingRef={stageHeadingRef}
            eyebrow="05 · محيط المشروع"
            title="ما الذي قد يعتمد عليه النطاق؟"
          />
          <p className="sd-stage-lead">{stageIntros.dependencies}</p>
          <TextField
            id="sd-existing-systems"
            label="أنظمة قائمة"
            value={draft.existingSystems}
            optional
            placeholder="أسماء أو أوصاف الأنظمة ذات الصلة"
            onChange={(value) => updateDraft('existingSystems', value)}
          />
          <TextField
            id="sd-integrations"
            label="تكاملات تحتاج تحققًا"
            value={draft.integrations}
            optional
            hint="ذكر النظام هنا لا يعني تأكيد دعم التكامل معه."
            placeholder="أنظمة أو مزودون أو قنوات ينبغي فحصها"
            onChange={(value) => updateDraft('integrations', value)}
          />
          <ListField
            id="sd-dependencies"
            label="تبعيات معروفة"
            value={draft.dependencies}
            optional
            placeholder={'قرار من فريق آخر\nوصول إلى مصدر بيانات'}
            onChange={(value) => updateDraft('dependencies', value)}
          />
          <div className="sd-field-pair">
            <TextField
              id="sd-data"
              label="البيانات أو الانتقال"
              value={draft.dataConsiderations}
              optional
              placeholder="مصادر، جودة، نقل أو تنظيف مطلوب"
              onChange={(value) => updateDraft('dataConsiderations', value)}
            />
            <TextField
              id="sd-content"
              label="المحتوى"
              value={draft.contentConsiderations}
              optional
              placeholder="محتوى موجود، جديد، متعدد اللغات…"
              onChange={(value) => updateDraft('contentConsiderations', value)}
            />
          </div>
        </>
      );
    }

    if (currentStep === 'preferences') {
      return (
        <>
          <StageHeader
            id="sd-stage-title"
            headingRef={stageHeadingRef}
            eyebrow="06 · حدود النقاش"
            title="ما التفضيلات التي يجب أن تبقى أمامنا؟"
          />
          <p className="sd-stage-lead">{stageIntros.preferences}</p>
          <ChoiceSet
            label="تفضيل الميزانية"
            options={budgetOptions}
            value={draft.budgetPreference}
            onChange={(value) => updateDraft('budgetPreference', value)}
          />
          <ChoiceSet
            label="تفضيل التوقيت"
            options={timingOptions}
            value={draft.timingPreference}
            onChange={(value) => updateDraft('timingPreference', value)}
          />
          <TextField
            id="sd-constraints"
            label="قيود يجب مراعاتها"
            value={draft.constraints}
            optional
            placeholder="سياسات داخلية، وصول، لغة، أجهزة أو حدود أخرى…"
            onChange={(value) => updateDraft('constraints', value)}
          />
          <ListField
            id="sd-unknowns"
            label="أسئلة أو مجهولات نحتاج لاكتشافها"
            value={draft.unknowns}
            optional
            placeholder={'من يملك القرار النهائي؟\nهل البيانات جاهزة؟'}
            onChange={(value) => updateDraft('unknowns', value)}
          />
          <TextField
            id="sd-notes"
            label="ملاحظات إضافية"
            value={draft.additionalNotes}
            optional
            placeholder="أي سياق لا يناسب الحقول السابقة"
            onChange={(value) => updateDraft('additionalNotes', value)}
          />
        </>
      );
    }

    if (currentStep === 'summary' || currentStep === 'complete') {
      const completed = currentStep === 'complete';
      return (
        <>
          <StageHeader
            id="sd-stage-title"
            headingRef={stageHeadingRef}
            eyebrow={completed ? 'نسخة محلية · جاهزة للمراجعة' : 'قبل الإكمال · راجع وعدّل'}
            title={completed ? 'ملخصك منظّم في هذه الجلسة' : 'ملخص الاكتشاف الأولي'}
          />
          <div className={`sd-local-state${completed ? ' is-complete' : ''}`}>
            {completed ? <Check aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
            <p>
              <strong>
                {completed
                  ? 'تم تثبيت نسخة المراجعة محليًا.'
                  : 'هذا الملخص يتغير فور تعديل قراراتك.'}
              </strong>
              <span>
                لم تُرسل البيانات ولم تُحفظ في خادم. النتيجة إعداد للاكتشاف والنطاق فقط.
              </span>
            </p>
          </div>
          <div className="sd-summary-actions">
            <button type="button" onClick={copySummary}>
              <Clipboard aria-hidden="true" />
              نسخ الملخص
            </button>
            <button type="button" onClick={() => window.print()}>
              <Printer aria-hidden="true" />
              طباعة
            </button>
          </div>
          <p className="sd-copy-state" aria-live="polite">
            {copyState}
          </p>
          <div className="sd-summary" aria-label="التصنيف المنظم لملخص الاكتشاف">
            {summary.groups.map((summaryGroup) => {
              const content = summaryStatusContent[summaryGroup.status];
              const editStep = statusEditStep[summaryGroup.status];
              const canEdit = steps.includes(editStep);
              return (
                <section
                  key={summaryGroup.status}
                  className={`sd-summary-group sd-summary-group--${summaryGroup.status}`}
                  data-summary-status={summaryGroup.status}
                >
                  <header>
                    <div>
                      <bdi>{content.code}</bdi>
                      <h3>{summaryGroup.label}</h3>
                    </div>
                    {canEdit ? (
                      <button
                        type="button"
                        aria-label={`تعديل قسم ${summaryGroup.label}`}
                        onClick={() => editSummary(editStep)}
                      >
                        <Pencil aria-hidden="true" />
                        تعديل
                      </button>
                    ) : null}
                  </header>
                  <p>{summaryGroup.description}</p>
                  {summaryGroup.items.length ? (
                    <dl>
                      {summaryGroup.items.map((summaryItem) => (
                        <div key={summaryItem.label}>
                          <dt>{summaryItem.label}</dt>
                          <dd>
                            {summaryItem.values.map((value) => (
                              <span key={value} dir="auto">
                                {value}
                              </span>
                            ))}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="sd-summary-empty">لم تُسجّل معلومات في هذا التصنيف.</p>
                  )}
                </section>
              );
            })}
          </div>
          <aside className="sd-boundary-note">
            <strong>حدود هذه النسخة</strong>
            <span>
              ليست عرض سعر، أو موعد تسليم، أو ضمان تكامل، أو تأكيد جاهزية إنتاج أو استضافة.
            </span>
          </aside>
        </>
      );
    }

    return null;
  })();

  return (
    <section
      className={`start-discovery ${className}`.trim()}
      dir="rtl"
      lang="ar"
      aria-labelledby="start-discovery-title"
      data-step={currentStep}
      data-certainty={draft.certainty ?? 'unselected'}
      data-prefilled={Boolean(prefill)}
    >
      <div className="sd-atmosphere" aria-hidden="true" />
      <div className="sd-shell">
        <header className="sd-intro">
          <div>
            <p className="sd-eyebrow">
              <span aria-hidden="true" />
              GS / START · DISCOVERY
            </p>
            <h1 id="start-discovery-title">حوّل الفكرة غير المكتملة إلى بداية واضحة.</h1>
          </div>
          <div className="sd-intro__copy">
            <p>
              مسار قصير يتكيّف مع مقدار ما تعرفه الآن، ويبني ملخصًا مهنيًا قابلًا للمراجعة.
            </p>
            <small>
              مرحلة إعداد للنطاق — لا إرسال، لا تسعير نهائي، ولا وعد بموعد.
            </small>
          </div>
        </header>

        {prefill ? (
          <div className="sd-prefill-banner" role="status">
            <CornerDownLeft aria-hidden="true" />
            <p>
              <strong>تم حمل سياق سابق إلى هذه الصفحة.</strong>
              <span>
                راجعه وعدّله بحرية
                {draft.prefillSource?.label ? ` · ${draft.prefillSource.label}` : ''}.
              </span>
            </p>
            {draft.prefillSource?.referenceId ? (
              <bdi>{draft.prefillSource.referenceId}</bdi>
            ) : null}
          </div>
        ) : null}

        <div className="sd-mobile-context">
          <details>
            <summary>
              <span>سياق القرار الحالي</span>
              <bdi>{answeredCount.toString().padStart(2, '0')}</bdi>
            </summary>
            <div>
              <strong>{summary.certaintyLabel}</strong>
              <span dir="auto">{draft.objective || 'الهدف لم يُحدد بعد'}</span>
            </div>
          </details>
        </div>

        <div className="sd-layout">
          <aside className="sd-context" aria-label="سياق القرار ومسار الاكتشاف">
            <div className="sd-context__heading">
              <span>سياق القرار</span>
              <bdi>{answeredCount.toString().padStart(2, '0')}</bdi>
            </div>
            <div className="sd-context__signal">
              <small>نقطة البداية</small>
              <strong>{summary.certaintyLabel}</strong>
              <span dir="auto">{draft.objective || 'الهدف لم يُحدد بعد'}</span>
            </div>
            <nav aria-label="مراحل الاكتشاف">
              <ol>
                {steps.map((step, index) => {
                  const active = step === currentStep;
                  const accessible = active || visited.has(step);
                  return (
                    <li key={step} className={active ? 'is-active' : ''}>
                      <button
                        type="button"
                        disabled={!accessible}
                        aria-current={active ? 'step' : undefined}
                        onClick={() => accessible && setCurrentStep(step)}
                      >
                        <bdi>{String(index + 1).padStart(2, '0')}</bdi>
                        <span>{stepLabels[step]}</span>
                        <i aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>
            <p className="sd-context__boundary">
              المجهول هنا جزء من جودة النطاق، لا نقصًا يجب إخفاؤه.
            </p>
          </aside>

          <div className="sd-workspace" ref={workspaceRef}>
            <div className="sd-progress-copy" aria-live="polite">
              <span>{stepLabels[currentStep]}</span>
              <bdi>
                {String(visibleIndex).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
              </bdi>
            </div>
            <div className="sd-stage">{stageContent}</div>

            <footer className="sd-navigation">
              <div>
                {currentStep !== 'certainty' ? (
                  <button type="button" className="sd-back" onClick={goBack}>
                    <ArrowRight aria-hidden="true" />
                    {returnToSummary || currentStep === 'complete'
                      ? 'العودة إلى الملخص'
                      : 'السابق'}
                  </button>
                ) : (
                  <span />
                )}
              </div>
              {currentStep !== 'complete' ? (
                <button type="button" className="sd-next" onClick={goNext}>
                  <span>
                    {returnToSummary
                      ? 'حفظ والعودة إلى الملخص'
                      : currentStep === 'summary'
                        ? 'تثبيت نسخة المراجعة'
                        : steps[currentIndex + 1] === 'summary'
                          ? 'مراجعة الملخص'
                          : 'متابعة'}
                  </span>
                  <ArrowLeft aria-hidden="true" />
                </button>
              ) : null}
            </footer>
          </div>
        </div>
      </div>
    </section>
  );
}
