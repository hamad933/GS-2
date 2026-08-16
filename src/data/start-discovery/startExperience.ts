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

export const START_ENTRY_INTENTS: ReadonlyArray<{
  id: StartEntryIntent;
  label: string;
  description: string;
}> = [
  {
    id: 'discover',
    label: 'ساعدني على اكتشاف ما أحتاج',
    description: 'ابدأ من المشكلة والنتيجة التي تريد الوصول إليها.',
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
  return solutionFamilies.find((family) => family.id === familyId)!;
}

export function getFamilyJourney(familyId: StartFamilyId): readonly string[] {
  if (familyId === 'booking') return BOOKING_JOURNEY;
  return getStartFamily(familyId).operatingLoop;
}

export function recommendStartFamily(text: string): StartFamilyId {
  const normalized = text.toLocaleLowerCase('ar');
  let best: { id: StartFamilyId; score: number } | undefined;

  (Object.entries(FAMILY_DISCOVERY_KEYWORDS) as Array<[StartFamilyId, readonly string[]]>).forEach(
    ([id, keywords]) => {
      const score = keywords.reduce(
        (total, keyword) => total + (normalized.includes(keyword.toLocaleLowerCase('ar')) ? 1 : 0),
        0,
      );
      if (!best || score > best.score) best = { id, score };
    },
  );

  return best?.score ? best.id : 'business';
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
  capabilityName: string;
  question: string;
  answers: ReadonlyArray<{
    id: StartDecisionAnswer;
    label: string;
    detail: string;
  }>;
}

function genericQuestion(capabilityName: string): StartDecisionDefinition {
  return {
    id: `capability:${capabilityName}`,
    capabilityName,
    question: `هل تريد تضمين «${capabilityName}» ضمن الحل الآن؟`,
    answers: [
      { id: 'yes', label: 'نعم، أضفها.', detail: 'اعتبرها جزءًا من التكوين المبدئي.' },
      { id: 'no', label: 'لا، ليس الآن.', detail: 'أبقِ النطاق مركزًا دونها في هذه المرحلة.' },
      { id: 'unknown', label: 'لم أحدد بعد.', detail: 'سنسجلها كنقطة مراجعة مهمة.' },
    ],
  };
}

export function getFamilyDecisions(familyId: StartFamilyId): readonly StartDecisionDefinition[] {
  const family = getStartFamily(familyId);
  const configurable = family.capabilities.filter(
    (capability) => capability.classification !== 'CORE',
  );

  if (familyId === 'booking') {
    const paymentCapability = configurable.find((item) => item.name === 'ربط التقويم أو الدفع');
    const reminderCapability = configurable.find((item) => item.name === 'إشعارات الحالة');
    const decisions: StartDecisionDefinition[] = [];
    if (paymentCapability) {
      decisions.push({
        id: 'booking-payment',
        capabilityName: paymentCapability.name,
        question: 'هل تريد تحصيل مبلغ عند الحجز؟',
        answers: [
          { id: 'yes', label: 'نعم، دفع أو عربون.', detail: 'أضف احتياج الدفع إلى ما يجب مراجعته تقنيًا وتشغيليًا.' },
          { id: 'no', label: 'لا، بدون دفع الآن.', detail: 'يبقى مسار الحجز دون تحصيل مبلغ في هذه المرحلة.' },
          { id: 'unknown', label: 'لم أحدد بعد.', detail: 'سنسجل قرار الدفع كبند مراجعة قبل تثبيت النطاق.' },
        ],
      });
    }
    if (reminderCapability) decisions.push(genericQuestion(reminderCapability.name));
    return decisions;
  }

  return configurable.slice(0, 2).map((capability) => genericQuestion(capability.name));
}

export function getDecisionConsequence(
  familyId: StartFamilyId,
  decision: StartDecisionDefinition,
  answer: StartDecisionAnswer,
) {
  const family = getStartFamily(familyId);
  const capability = family.capabilities.find((item) => item.name === decision.capabilityName);
  const material = Boolean(
    answer === 'yes'
      && capability
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

  return {
    customer: capability?.description ?? 'يظهر هذا الجزء في تجربة الاستخدام عند اعتماده.',
    solution: `يصبح «${decision.capabilityName}» جزءًا من التكوين المبدئي.`,
    project: material
      ? 'يضيف اعتمادًا أو تحققًا ماديًا يجب مراجعته قبل تثبيت النطاق والسعر.'
      : 'يُضاف إلى النطاق المبدئي دون تحويل التقدير إلى سعر نهائي.',
    material,
  };
}
