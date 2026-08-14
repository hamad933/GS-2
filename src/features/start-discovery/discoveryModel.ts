import {
  START_DISCOVERY_PREFILL_VERSION,
  type DiscoveryCertainty,
  type DiscoveryStepId,
  type DiscoverySummary,
  type DiscoverySummaryGroup,
  type StartDiscoveryDraft,
  type StartDiscoveryPrefill,
} from '../../types/start-discovery';
import {
  certaintyOptions,
  summaryStatusContent,
} from '../../data/start-discovery/discoveryContent';

const emptyDraft: StartDiscoveryDraft = {
  objective: '',
  currentProblem: '',
  intendedUsers: '',
  domain: '',
  expectedOutcomes: '',
  importantWorkflows: '',
  recommendedFamily: '',
  selectedCapabilities: [],
  optionalCapabilities: [],
  uncertainCapabilities: [],
  configurationPreference: '',
  existingSystems: '',
  integrations: '',
  dependencies: [],
  dataConsiderations: '',
  contentConsiderations: '',
  budgetPreference: '',
  timingPreference: '',
  constraints: '',
  unknowns: [],
  additionalNotes: '',
  referenceContext: '',
};

const branchSteps: Record<DiscoveryCertainty, readonly DiscoveryStepId[]> = {
  exploring: [
    'certainty',
    'foundation',
    'people-outcomes',
    'preferences',
    'summary',
  ],
  direction: [
    'certainty',
    'foundation',
    'people-outcomes',
    'configuration',
    'preferences',
    'summary',
  ],
  configured: [
    'certainty',
    'foundation',
    'configuration',
    'dependencies',
    'preferences',
    'summary',
  ],
  detailed: [
    'certainty',
    'foundation',
    'people-outcomes',
    'configuration',
    'dependencies',
    'preferences',
    'summary',
  ],
};

function unique(values: readonly string[] | undefined) {
  return [...new Set((values ?? []).map((value) => value.trim()).filter(Boolean))];
}

export function createStartDiscoveryDraft(
  prefill?: StartDiscoveryPrefill,
  initialCertainty?: DiscoveryCertainty,
): StartDiscoveryDraft {
  if (!prefill) {
    return { ...emptyDraft, certainty: initialCertainty };
  }

  if (prefill.version !== START_DISCOVERY_PREFILL_VERSION) {
    return { ...emptyDraft, certainty: initialCertainty };
  }

  return {
    ...emptyDraft,
    certainty: initialCertainty,
    objective: prefill.selectedOutcome?.trim() ?? '',
    currentProblem: prefill.selectedProblem?.trim() ?? '',
    expectedOutcomes: prefill.selectedOutcome?.trim() ?? '',
    recommendedFamily: prefill.recommendedFamily?.trim() ?? '',
    selectedCapabilities: unique(prefill.selectedCapabilities),
    optionalCapabilities: unique(prefill.optionalCapabilities),
    configurationPreference: prefill.configurationPreference?.trim() ?? '',
    budgetPreference: prefill.budgetPreference?.trim() ?? '',
    dependencies: unique(prefill.knownDependencies),
    unknowns: unique(prefill.unknowns),
    referenceContext: prefill.relevantReferenceContext?.trim() ?? '',
    prefillSource: prefill.source,
  };
}

export function getDiscoverySteps(
  certainty?: DiscoveryCertainty,
): readonly DiscoveryStepId[] {
  return certainty ? branchSteps[certainty] : ['certainty'];
}

export function parseListInput(value: string): string[] {
  return unique(value.split(/[\n,،]+/));
}

export function formatListInput(values: readonly string[]): string {
  return values.join('\n');
}

function values(...entries: Array<string | undefined>) {
  return entries.map((entry) => entry?.trim() ?? '').filter(Boolean);
}

function item(label: string, itemValues: readonly string[]) {
  return itemValues.length ? { label, values: [...itemValues] } : undefined;
}

function group(
  status: DiscoverySummaryGroup['status'],
  items: Array<ReturnType<typeof item>>,
): DiscoverySummaryGroup {
  const content = summaryStatusContent[status];
  return {
    status,
    label: content.label,
    description: content.description,
    items: items.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
  };
}

function defaultUnknown(certainty?: DiscoveryCertainty) {
  if (certainty === 'exploring') return ['شكل الحل والقدرات المناسبة'];
  if (certainty === 'direction') return ['القدرات والتكوين الأنسب'];
  if (certainty === 'configured') return ['ملاءمة الاختيارات الأولية والتبعيات'];
  return [];
}

export function buildDiscoverySummary(
  draft: StartDiscoveryDraft,
): DiscoverySummary {
  const certaintyLabel =
    certaintyOptions.find((option) => option.value === draft.certainty)?.label ??
    'لم تُحدد نقطة البداية';
  const unresolved = unique([
    ...draft.unknowns,
    ...draft.uncertainCapabilities,
    ...(draft.unknowns.length || draft.uncertainCapabilities.length
      ? []
      : defaultUnknown(draft.certainty)),
  ]);

  return {
    title: draft.objective || 'ملخص تعريف المشروع',
    certaintyLabel,
    groups: [
      group('known', [
        item('الهدف التشغيلي أو التجاري', values(draft.objective)),
        item('المشكلة الحالية', values(draft.currentProblem)),
        item('المستخدمون المقصودون', values(draft.intendedUsers)),
        item('النشاط أو المجال', values(draft.domain)),
        item('النتائج المتوقعة', values(draft.expectedOutcomes)),
        item('سير العمل المهم', values(draft.importantWorkflows)),
        item('أنظمة قائمة', values(draft.existingSystems)),
        item('سياق مرجعي', values(draft.referenceContext)),
        item('ملاحظات إضافية', values(draft.additionalNotes)),
      ]),
      group('selected', [
        item('قدرات محددة', draft.selectedCapabilities),
      ]),
      group('preferred', [
        item('عائلة موصى بها من السياق', values(draft.recommendedFamily)),
        item('قدرات اختيارية', draft.optionalCapabilities),
        item('تفضيل التكوين', values(draft.configurationPreference)),
        item('تفضيل الميزانية', values(draft.budgetPreference)),
        item('تفضيل التوقيت', values(draft.timingPreference)),
        item('قيود مفضلة للمراعاة', values(draft.constraints)),
      ]),
      group('dependent', [
        item('تكاملات تحتاج تحققًا', values(draft.integrations)),
        item('تبعيات معروفة', draft.dependencies),
        item('البيانات أو الانتقال', values(draft.dataConsiderations)),
        item('المحتوى', values(draft.contentConsiderations)),
      ]),
      group('unknown', [item('يحتاج إلى اكتشاف', unresolved)]),
    ],
  };
}

export function formatDiscoverySummary(summary: DiscoverySummary): string {
  const lines = [
    'ملخص الاكتشاف — General Solutions',
    summary.title,
    `نقطة البداية: ${summary.certaintyLabel}`,
    '',
  ];

  summary.groups.forEach((summaryGroup) => {
    const content = summaryStatusContent[summaryGroup.status];
    lines.push(`${content.code} — ${summaryGroup.label}`);
    if (!summaryGroup.items.length) {
      lines.push('• لم تُسجّل معلومات في هذا التصنيف.');
    } else {
      summaryGroup.items.forEach((summaryItem) => {
        lines.push(`• ${summaryItem.label}: ${summaryItem.values.join('، ')}`);
      });
    }
    lines.push('');
  });

  lines.push(
    'هذه نسخة إعداد للاكتشاف والنطاق، وليست عرض سعر أو وعدًا بموعد أو تأكيدًا للتكامل أو الجاهزية.',
  );
  return lines.join('\n');
}
