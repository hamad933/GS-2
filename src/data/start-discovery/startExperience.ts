import { configurationDirections, solutionFamilies } from '../solutions/families';

export const START_MAJOR_STAGES = [
  { id: 'discover', number: '01', label: 'اكتشف ما يناسبك' },
  { id: 'build', number: '02', label: 'كوّن حلّك' },
  { id: 'review', number: '03', label: 'راجع وابدأ' },
] as const;

export type StartStageId = (typeof START_MAJOR_STAGES)[number]['id'];
export type StartFamilyId = (typeof solutionFamilies)[number]['id'];
export type StartEntryIntent = 'discover' | 'direction' | 'example';
export type StartDecisionAnswer = 'yes' | 'no' | 'unknown';
export type StartExperienceId = (typeof configurationDirections)[number]['id'];

export const START_ENTRY_INTENTS: ReadonlyArray<{
  id: StartEntryIntent;
  label: string;
  description: string;
}> = [
  {
    id: 'discover',
    label: 'ساعدني على اكتشاف ما أحتاج',
    description: 'لا أعرف ماذا أحتاج بعد؛ ابدأ من المشكلة والنتيجة التي تريد الوصول إليها.',
  },
  {
    id: 'direction',
    label: 'أعرف تقريبًا نوع الحل',
    description: 'أثبت ما تعرفه، ثم راجع الاتجاه قبل اعتماده.',
  },
  {
    id: 'example',
    label: 'أريد أن أبدأ من مثال',
    description: 'استخدم مثالًا لفهم الاتجاه، لا كقالب جاهز للمشروع.',
  },
];

export const PROVISIONAL_START_PRICING = {
  currency: 'USD',
  discover: { min: 10_000, max: 25_000 },
  configuredMaterial: { min: 12_000, max: 25_000 },
  label: 'تقدير أولي للميزانية',
  disclaimer: 'تقدير تقريبي للتوجيه، وليس عرض سعر نهائيًا.',
} as const;

const BOOKING_JOURNEY = [
  'قبل الحجز',
  'الحجز',
  'قبل الموعد',
  'تقديم الخدمة',
  'بعد الخدمة',
] as const;

const FAMILY_DISCOVERY_KEYWORDS: Record<StartFamilyId, readonly string[]> = {
  business: ['موقع', 'خدمة', 'حضور', 'تعريف', 'تواصل', 'website', 'service'],
  commerce: ['متجر', 'تجارة', 'منتج', 'شراء', 'بيع', 'علامة', 'shop', 'commerce', 'product'],
  booking: ['حجز', 'موعد', 'مواعيد', 'جدولة', 'appointment', 'booking', 'schedule'],
  assets: ['عقار', 'عقارات', 'أصل', 'أصول', 'وحدات', 'property', 'asset', 'real estate'],
  portals: ['تشغيل', 'فريق', 'طلبات', 'بوابة', 'موافقات', 'حالات', 'workflow', 'portal', 'operations'],
  knowledge: ['تعليم', 'معرفة', 'محتوى', 'تعلم', 'دروس', 'course', 'learning', 'knowledge'],
};

export const startFamilies = solutionFamilies;
export const startConfigurationDirections = configurationDirections;

export function isStartFamilyId(value: string | undefined): value is StartFamilyId {
  return Boolean(value && solutionFamilies.some((family) => family.id === value));
}

export function getStartFamily(familyId: StartFamilyId) {
  const family = solutionFamilies.find((item) => item.id === familyId);
  if (!family) throw new Error(`Unknown START family: ${familyId}`);
  return family;
}

export interface StartRecommendationAssessment {
  resolution: 'decisive' | 'insufficient';
  recommendedId?: StartFamilyId;
  candidateIds: readonly StartFamilyId[];
  reasons: readonly string[];
}

interface RankedDiscoverySignal {
  id: StartFamilyId;
  score: number;
  matches: string[];
}

function rankDiscoveryText(text: string): RankedDiscoverySignal[] {
  const normalized = text.toLocaleLowerCase('ar');
  return (Object.entries(FAMILY_DISCOVERY_KEYWORDS) as Array<[StartFamilyId, readonly string[]]>)
    .map(([id, keywords]) => {
      const matches = keywords.filter((keyword) => normalized.includes(keyword.toLocaleLowerCase('ar')));
      return { id, score: matches.length, matches: [...matches] };
    })
    .sort((left, right) => right.score - left.score || startFamilies.findIndex((family) => family.id === left.id) - startFamilies.findIndex((family) => family.id === right.id));
}

function uniquePositiveLeader(ranked: readonly RankedDiscoverySignal[]) {
  const top = ranked[0];
  if (!top || top.score === 0) return undefined;
  return ranked.filter((item) => item.score === top.score).length === 1 ? top : undefined;
}

export function assessStartRecommendation(input: {
  currentProblem: string;
  objective: string;
  intendedUsers: string;
  domain: string;
}): StartRecommendationAssessment {
  const primaryFields = [input.currentProblem, input.objective, input.intendedUsers];
  const operationalContext = input.domain.trim();
  const fields = [...primaryFields, operationalContext];
  const substantiveFields = fields.filter((value) => value.trim().length >= 4).length;
  const primaryRanked = rankDiscoveryText(primaryFields.join(' '));
  const operationalRanked = rankDiscoveryText(operationalContext);
  const combinedRanked = rankDiscoveryText(fields.join(' '));
  const primaryLeader = uniquePositiveLeader(primaryRanked);
  const operationalLeader = uniquePositiveLeader(operationalRanked);

  if (primaryLeader && operationalLeader && primaryLeader.id !== operationalLeader.id) {
    const candidates = [
      primaryLeader.id,
      operationalLeader.id,
      ...combinedRanked.filter((item) => item.score > 0).map((item) => item.id),
    ];
    return {
      resolution: 'insufficient',
      candidateIds: [...new Set(candidates)].slice(0, 3),
      reasons: [
        `وصف الحاجة يشير إلى «${getStartFamily(primaryLeader.id).title}»، بينما السياق التشغيلي يشير إلى «${getStartFamily(operationalLeader.id).title}». نحتاج منك تمييز الأولوية قبل أن ننسب توصية إلى GS.`,
      ],
    };
  }

  const top = combinedRanked[0];
  const tied = combinedRanked.filter((item) => item.score === top.score);
  if (top.score > 0 && tied.length === 1 && substantiveFields >= 2) {
    const family = getStartFamily(top.id);
    const operationalMatch = operationalRanked.find((item) => item.id === top.id && item.score > 0);
    const reasons = [
      `يرتبط وصفك مباشرةً بـ ${top.matches.slice(0, 3).map((term) => `«${term}»`).join(' و')}.`,
      operationalMatch
        ? `السياق التشغيلي الذي ذكرته يعزز هذا الاتجاه عبر ${operationalMatch.matches.slice(0, 2).map((term) => `«${term}»`).join(' و')}.`
        : `هذا الاتجاه ينظم رحلة تبدأ من ${family.operatingLoop[0]} وتصل إلى ${family.operatingLoop[family.operatingLoop.length - 1]}.`,
    ];
    return {
      resolution: 'decisive',
      recommendedId: top.id,
      candidateIds: [top.id],
      reasons,
    };
  }

  const positive = combinedRanked.filter((item) => item.score > 0).map((item) => item.id);
  const fallback: StartFamilyId[] = ['business', 'booking', 'portals'];
  return {
    resolution: 'insufficient',
    candidateIds: [...new Set([...positive, ...fallback])].slice(0, 3),
    reasons: [operationalContext
      ? 'الحاجة والسياق التشغيلي لا يقدمان دليلًا واحدًا كافيًا بعد، لذلك نحتاج منك تمييز نوع التغيير قبل أن ننسب توصية إلى GS.'
      : 'الوصف الحالي يحتمل أكثر من اتجاه، لذلك نحتاج منك تمييز نوع التغيير قبل أن ننسب توصية إلى GS.'],
  };
}

export function formatBudgetBand(materialEffect: boolean) {
  const range = materialEffect
    ? PROVISIONAL_START_PRICING.configuredMaterial
    : PROVISIONAL_START_PRICING.discover;
  const format = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  return `${format.format(range.min)}–${format.format(range.max)}`;
}

export interface StartDecisionDefinition {
  id: string;
  momentId: string;
  capabilityName: string;
  question: string;
  answers: ReadonlyArray<{
    id: StartDecisionAnswer;
    label: string;
    detail: string;
  }>;
}

function genericQuestion(capabilityName: string, momentId: string): StartDecisionDefinition {
  return {
    id: `capability:${capabilityName}`,
    momentId,
    capabilityName,
    question: `هل تريد تضمين «${capabilityName}» ضمن الحل الآن؟`,
    answers: [
      { id: 'yes', label: 'نعم، أضفها.', detail: 'اعتبرها جزءًا من التكوين المبدئي.' },
      { id: 'no', label: 'لا، ليس الآن.', detail: 'أبقِ النطاق مركزًا دونها في هذه المرحلة.' },
      { id: 'unknown', label: 'لم أحدد بعد.', detail: 'سنسجلها كنقطة مراجعة مهمة.' },
    ],
  };
}

export interface StartJourneyMoment {
  id: string;
  label: string;
  description: string;
}

export interface StartBuildStep {
  id: string;
  momentId: string;
  kind: 'information' | 'decision';
  title: string;
  body: string;
  evidenceRole: 'CTX-01' | 'CTX-02';
  decision?: StartDecisionDefinition;
}

const BOOKING_MOMENT_DESCRIPTIONS = [
  'يفهم العميل الخدمة وما يحتاجه قبل أن يبدأ الحجز.',
  'يختار العميل الوقت ويؤكد الحجز ضمن قواعد واضحة.',
  'يتلقى العميل ما يحتاجه للاستعداد أو تعديل الموعد.',
  'يصل الفريق إلى الحجز وسياقه أثناء تقديم الخدمة.',
  'تظل حالة الحجز والمتابعة مفهومة بعد انتهاء الخدمة.',
] as const;

export function getFamilyJourneyModel(familyId: StartFamilyId): readonly StartJourneyMoment[] {
  const family = getStartFamily(familyId);
  const labels = familyId === 'booking' ? BOOKING_JOURNEY : family.operatingLoop;
  return labels.map((label, index) => ({
    id: `${familyId}-moment-${index + 1}`,
    label,
    description: familyId === 'booking'
      ? BOOKING_MOMENT_DESCRIPTIONS[index]
      : `تتقدم رحلة ${family.title} عبر ${family.operatingLoop[index]}.`,
  }));
}

function decisionMomentIndexes(familyId: StartFamilyId, capabilityName: string, configurableIndex: number, momentCount: number) {
  if (familyId === 'booking') {
    if (capabilityName === 'ربط التقويم أو الدفع') return 1;
    if (capabilityName === 'إشعارات الحالة' || capabilityName === 'إعادة الجدولة والإلغاء') return 2;
  }
  return Math.min(configurableIndex + 1, momentCount - 1);
}

export function getFamilyDecisions(familyId: StartFamilyId): readonly StartDecisionDefinition[] {
  const family = getStartFamily(familyId);
  const configurable = family.capabilities.filter(
    (capability) => capability.classification !== 'CORE',
  );
  const moments = getFamilyJourneyModel(familyId);

  return configurable.map((capability, index) => {
    const moment = moments[decisionMomentIndexes(familyId, capability.name, index, moments.length)];
    if (familyId === 'booking' && capability.name === 'ربط التقويم أو الدفع') {
      return {
        id: 'booking-payment',
        momentId: moment.id,
        capabilityName: capability.name,
        question: 'هل تريد تحصيل مبلغ عند الحجز؟',
        answers: [
          { id: 'yes', label: 'نعم، دفع أو عربون.', detail: 'أضف احتياج الدفع إلى ما يجب مراجعته تقنيًا وتشغيليًا.' },
          { id: 'no', label: 'لا، بدون دفع الآن.', detail: 'يبقى مسار الحجز دون تحصيل مبلغ في هذه المرحلة.' },
          { id: 'unknown', label: 'لم أحدد بعد.', detail: 'سنسجل قرار الدفع كبند مراجعة قبل تثبيت النطاق.' },
        ],
      } satisfies StartDecisionDefinition;
    }
    return genericQuestion(capability.name, moment.id);
  });
}

export function getFamilyBuildSteps(familyId: StartFamilyId): readonly StartBuildStep[] {
  const moments = getFamilyJourneyModel(familyId);
  const decisions = getFamilyDecisions(familyId);
  return moments.flatMap<StartBuildStep>((moment, index) => {
    const momentDecisions = decisions.filter((decision) => decision.momentId === moment.id);
    const evidenceRole = index <= Math.floor((moments.length - 1) / 2) ? 'CTX-01' : 'CTX-02';
    if (!momentDecisions.length) {
      return [{
        id: `${moment.id}-information`,
        momentId: moment.id,
        kind: 'information' as const,
        title: moment.label,
        body: moment.description,
        evidenceRole,
      }];
    }
    return momentDecisions.map((decision) => ({
      id: decision.id,
      momentId: moment.id,
      kind: 'decision' as const,
      title: decision.question,
      body: moment.description,
      evidenceRole,
      decision,
    }));
  });
}

export function getRecommendedExperience(familyId: StartFamilyId): StartExperienceId {
  return familyId === 'portals' ? 'connected' : 'focused';
}

export interface StartDecisionConsequence {
  customer: string;
  solution: string;
  project: string;
  material: boolean;
  externalDependency?: string;
}

export function getDecisionConsequence(
  familyId: StartFamilyId,
  decision: StartDecisionDefinition,
  answer: StartDecisionAnswer,
): StartDecisionConsequence {
  const family = getStartFamily(familyId);
  const capability = family.capabilities.find((item) => item.name === decision.capabilityName);
  const isPaymentDecision = familyId === 'booking' && decision.id === 'booking-payment';
  const material = Boolean(
    answer === 'yes'
      && capability
      && !isPaymentDecision
      && (capability.classification === 'CONDITIONAL' || capability.classification === 'CUSTOM'),
  );

  if (answer === 'no') {
    return {
      customer: 'تبقى الرحلة أبسط، دون إضافة هذا الجزء الآن.',
      solution: `لا يُضاف «${decision.capabilityName}» إلى التكوين الحالي.`,
      project: 'لا يوجد أثر مادي جديد على النطاق التقديري من هذا القرار.',
      material,
    };
  }

  if (answer === 'unknown') {
    return {
      customer: 'لا يتغير المسار الآن قبل حسم هذا القرار.',
      solution: `يبقى «${decision.capabilityName}» مفتوحًا للمراجعة.`,
      project: 'يظهر كبند مراجعة مهم قبل تثبيت النطاق النهائي.',
      material: false,
    };
  }

  if (isPaymentDecision) {
    return {
      customer: capability?.description ?? 'يظهر الدفع كجزء من رحلة الحجز عند اعتماده.',
      solution: `يصبح «${decision.capabilityName}» جزءًا من التكوين المبدئي.`,
      project: 'يتطلب هذا القرار مزود دفع خارجي (Payment Provider) ومراجعة تفاصيل الربط، لكنه وحده لا يغيّر نطاق الميزانية التقريبي الحالي.',
      material: false,
      externalDependency: 'مزود دفع خارجي (Payment Provider)',
    };
  }

  return {
    customer: capability?.description ?? 'يظهر هذا الجزء في تجربة الاستخدام عند اعتماده.',
    solution: `يصبح «${decision.capabilityName}» جزءًا من التكوين المبدئي.`,
    project: material
      ? 'يضيف اعتمادًا أو تحققًا ماديًا يجب مراجعته قبل تثبيت النطاق والسعر.'
      : 'يُضاف إلى النطاق المبدئي دون تحويل التقدير إلى سعر نهائي.',
    material,
  };
}
