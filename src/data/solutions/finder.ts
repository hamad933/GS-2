import type {
  DecisionFacts,
  FactKey,
  FinderOption,
  FinderQuestion,
  Recommendation,
  SolutionFamilyId,
} from '../../types/solutions';
import { solutionFamilies } from './families';

export const finderQuestions: FinderQuestion[] = [
  {
    key: 'outcome',
    eyebrow: 'النتيجة المطلوبة',
    title: 'ما التغيير الذي تريد أن يراه المستخدم أولًا؟',
    help: 'اختر الأقرب الآن. لا يلزم أن يكون تعريفك نهائيًا.',
    options: [
      { id: 'presence', label: 'فهم عملي وخدماتي', detail: 'حضور أوضح ومسار طلب مباشر.', weights: { business: 5, commerce: 1 } },
      { id: 'sell', label: 'اكتشاف منتجات واختيارها', detail: 'رحلة تجمع العلامة والمنتج والقرار.', weights: { commerce: 5, business: 1 } },
      { id: 'book', label: 'حجز خدمة أو موعد', detail: 'تنظيم الاختيار والإتاحة والتأكيد.', weights: { booking: 5, portals: 1 } },
      { id: 'explore-assets', label: 'استكشاف أصول ومقارنتها', detail: 'تفاصيل وتصفية تقرّب الاستفسار.', weights: { assets: 5, business: 1 } },
      { id: 'operate', label: 'تنظيم عمل وطلبات داخلية', detail: 'أدوار وحالات وخطوة تالية واضحة.', weights: { portals: 5, booking: 1 } },
      { id: 'learn', label: 'الوصول إلى معرفة أو تعلم', detail: 'محتوى ومسارات واستكمال منظم.', weights: { knowledge: 5, business: 1 } },
      { id: 'unknown', label: 'لست متأكدًا بعد', detail: 'سنستخدم السؤال التالي لتضييق الاتجاه.', weights: {} },
    ],
  },
  {
    key: 'activity',
    eyebrow: 'طبيعة النشاط',
    title: 'أي وصف أقرب إلى النشاط الذي سيحمله الحل؟',
    help: 'هذا الوصف يغيّر معنى المسار، حتى لو تشابهت الشاشات.',
    options: [
      { id: 'services', label: 'خدمات وعلاقات عملاء', detail: 'شرح خدمة ثم طلب أو موعد.', weights: { business: 3, booking: 3 } },
      { id: 'brand-retail', label: 'علامة ومنتجات', detail: 'استكشاف مجموعة أو منتج واختياره.', weights: { commerce: 4 } },
      { id: 'property', label: 'عقارات أو أصول', detail: 'بيانات أصول وصور وسمات واستفسارات.', weights: { assets: 4 } },
      { id: 'operations', label: 'عمليات وفرق', detail: 'طلبات وحالات وأدوار داخل التشغيل.', weights: { portals: 4 } },
      { id: 'education', label: 'تعليم أو محتوى', detail: 'محتوى مترابط أو مسارات تقدم.', weights: { knowledge: 4 } },
      { id: 'mixed', label: 'نشاط مختلط أو غير محسوم', detail: 'سنبقي أكثر من اتجاه مفتوحًا.', weights: { business: 1, portals: 1 } },
    ],
  },
  {
    key: 'audience',
    eyebrow: 'المستخدمون',
    title: 'من سيعتمد على المسار بشكل رئيسي؟',
    help: 'نستخدم الإجابة لتمييز الواجهة العامة عن مساحة التشغيل.',
    options: [
      { id: 'customers', label: 'عملاء أو زوار', detail: 'رحلة خارجية للاكتشاف والاختيار.', weights: { business: 2, commerce: 2, booking: 2, assets: 2 } },
      { id: 'team', label: 'فريق داخلي', detail: 'عمل متكرر وحالات ومسؤوليات.', weights: { portals: 4, knowledge: 1 } },
      { id: 'learners', label: 'متعلمون أو قرّاء', detail: 'اكتشاف محتوى واستكمال مسار.', weights: { knowledge: 4 } },
      { id: 'mixed', label: 'عملاء وفريق معًا', detail: 'واجهة خارجية مرتبطة بتشغيل داخلي.', weights: { portals: 2, booking: 1, commerce: 1, assets: 1 } },
      { id: 'unknown', label: 'غير معروف بعد', detail: 'نسجل المستخدمين كمعلومة ناقصة.', weights: {} },
    ],
  },
  {
    key: 'complexity',
    eyebrow: 'عمق التشغيل',
    title: 'ما مقدار الترابط المعروف اليوم؟',
    help: 'لا نفترض تكاملًا أو تخصيصًا لم تذكره.',
    options: [
      { id: 'focused', label: 'مسار واحد واضح', detail: 'هدف أساسي وعدد محدود من الأدوار.', weights: { business: 1, booking: 1, commerce: 1 } },
      { id: 'connected', label: 'عدة مراحل أو أدوار', detail: 'الحالة تنتقل بين مستخدمين أو خطوات.', weights: { portals: 3, booking: 1, assets: 1, knowledge: 1 } },
      { id: 'integrations', label: 'أنظمة أو تكاملات مهمة', detail: 'هناك اعتمادات تقنية يجب اكتشافها.', weights: { portals: 3, commerce: 1, booking: 1 } },
      { id: 'unknown', label: 'غير معروف بعد', detail: 'يبقى العمق مجهولًا في القرار الحالي.', weights: {} },
    ],
  },
];

const missingLabels: Record<FactKey, string> = {
  outcome: 'النتيجة المطلوبة غير محسومة',
  activity: 'طبيعة النشاط غير محسومة',
  audience: 'المستخدمون الرئيسيون غير محسومين',
  complexity: 'عمق التشغيل والتكاملات غير محسوم',
};

function optionFor(key: FactKey, optionId?: string): FinderOption | undefined {
  return finderQuestions.find((question) => question.key === key)?.options.find((option) => option.id === optionId);
}

export function getFactLabel(key: FactKey, optionId?: string) {
  return optionFor(key, optionId)?.label;
}

export function recommendFromFacts(facts: DecisionFacts): Recommendation {
  const scores = Object.fromEntries(
    solutionFamilies.map((family) => [family.id, 0]),
  ) as Record<SolutionFamilyId, number>;

  const reasons: string[] = [];
  const missing: string[] = [];
  let substantiveFactCount = 0;

  finderQuestions.forEach((question) => {
    const selected = optionFor(question.key, facts[question.key]);
    const unresolved = !selected || selected.id === 'unknown' || selected.id === 'mixed';
    if (unresolved) {
      missing.push(missingLabels[question.key]);
    } else {
      substantiveFactCount += 1;
    }
    if (!selected) return;

    Object.entries(selected.weights).forEach(([familyId, weight]) => {
      scores[familyId as SolutionFamilyId] += weight ?? 0;
    });
    if (selected.id !== 'unknown' && reasons.length < finderQuestions.length) {
      reasons.push(`${question.eyebrow}: ${selected.label}`);
    }
  });

  const ranked = solutionFamilies
    .map((family) => ({ id: family.id, score: scores[family.id] }))
    .sort((left, right) => right.score - left.score);
  const topScore = ranked[0]?.score ?? 0;
  const topIds = ranked.filter((item) => item.score === topScore).map((item) => item.id);

  if (facts.constraints.trim().length === 0) {
    missing.push('القيود الخاصة غير مذكورة');
  }

  if (topScore <= 0 || substantiveFactCount < 2) {
    const positiveDirections = ranked.filter((item) => item.score > 0).map((item) => item.id);
    return {
      resolution: 'insufficient',
      candidateIds: positiveDirections.length > 1
        ? positiveDirections
        : solutionFamilies.map((family) => family.id),
      reasons,
      missing,
    };
  }

  if (topIds.length > 1) {
    return {
      resolution: 'tied',
      candidateIds: topIds,
      reasons,
      missing,
    };
  }

  const recommendedId = topIds[0];
  const alternativeId = ranked.find((item) => item.id !== recommendedId && item.score > 0)?.id;

  return {
    resolution: 'decisive',
    recommendedId,
    candidateIds: [recommendedId],
    alternativeId,
    reasons,
    missing,
  };
}
