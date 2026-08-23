import type { LocalizedText, ReferenceLocale } from '../reference-projects';

export type MethodStageId =
  | 'discovery'
  | 'fit'
  | 'scope'
  | 'risk'
  | 'build'
  | 'quality'
  | 'transition';

export type MethodStage = {
  id: MethodStageId;
  index: string;
  title: LocalizedText;
  summary: LocalizedText;
  question: LocalizedText;
  control: LocalizedText;
  output: LocalizedText;
  decision: LocalizedText;
};

export type ScopeBand = {
  code: 'required' | 'included' | 'optional' | 'conditional' | 'custom' | 'unknown';
  label: LocalizedText;
  meaning: LocalizedText;
};

export const methodStages: MethodStage[] = [
  {
    id: 'discovery',
    index: '01',
    title: { ar: 'الاكتشاف', en: 'Discovery' },
    summary: {
      ar: 'نفهم المشكلة التشغيلية والنتيجة المقصودة قبل اقتراح شكل الحل.',
      en: 'Understand the operational problem and intended outcome before proposing a solution shape.',
    },
    question: { ar: 'ما الذي يجب أن يتغير في العمل، ولمن؟', en: 'What must change in the work, and for whom?' },
    control: { ar: 'فصل المشكلة عن الحل المفترض وتسجيل القيود والافتراضات.', en: 'Separate the problem from the assumed solution; record constraints and assumptions.' },
    output: { ar: 'موجز مشكلة + فرضية نتيجة', en: 'Problem brief + outcome hypothesis' },
    decision: { ar: 'هل المشكلة والنتيجة واضحتان بما يكفي للانتقال؟', en: 'Are the problem and intended outcome clear enough to proceed?' },
  },
  {
    id: 'fit',
    index: '02',
    title: { ar: 'محرك الملاءمة والمرجع', en: 'Fit / Reference Engine' },
    summary: {
      ar: 'نختار أقوى نقطة مرجعية ونوضح ما يمكن نقله منها وما لا يمكن افتراضه.',
      en: 'Select the strongest reference starting point and state what can transfer—and what cannot be assumed.',
    },
    question: { ar: 'أي نمط مرجعي يشبه جوهر الحاجة؟', en: 'Which reference pattern best resembles the core need?' },
    control: { ar: 'تقييم الملاءمة دون تحويل المرجع إلى قالب جاهز أو وعد.', en: 'Assess fit without turning a reference into a ready-made template or promise.' },
    output: { ar: 'مذكرة ملاءمة + فجوات معلنة', en: 'Fit note + declared gaps' },
    decision: { ar: 'ما الذي سنعيد استخدامه كمبدأ، وما الذي يحتاج اكتشافاً جديداً؟', en: 'What can be reused as a principle, and what needs fresh discovery?' },
  },
  {
    id: 'scope',
    index: '03',
    title: { ar: 'معمار النطاق', en: 'Scope Architecture' },
    summary: {
      ar: 'نحوّل الرغبة العامة إلى طبقات نطاق ذات معانٍ وحدود وقرارات صريحة.',
      en: 'Turn a broad need into scope layers with explicit meaning, boundaries, and decisions.',
    },
    question: { ar: 'ما اللازم الآن، وما الذي يمكن تأجيله أو لم يُحسم؟', en: 'What is necessary now, what can wait, and what remains undecided?' },
    control: { ar: 'تصنيف كل عنصر بلغة نطاق ثابتة ومنع البنود الضمنية.', en: 'Classify every item using a stable scope grammar; prevent implicit inclusions.' },
    output: { ar: 'خريطة نطاق + قائمة قرارات', en: 'Scope map + decision list' },
    decision: { ar: 'هل لكل بند حالة ومالك وسبب مفهوم؟', en: 'Does every item have an intelligible state, owner, and rationale?' },
  },
  {
    id: 'risk',
    index: '04',
    title: { ar: 'الاعتماديات والمخاطر', en: 'Dependencies & Risk' },
    summary: {
      ar: 'نكشف ما يعتمد عليه المشروع قبل أن تتحول المجهولات إلى مفاجآت تنفيذية.',
      en: 'Expose what the project depends on before unknowns become delivery surprises.',
    },
    question: { ar: 'ما الذي لا نملكه أو لا نتحكم فيه بالكامل؟', en: 'What do we not own or fully control?' },
    control: { ar: 'ربط كل اعتماد بقرار أو تحقق أو مسار تخفيف، دون افتراض الجاهزية.', en: 'Tie every dependency to a decision, verification, or mitigation path without assuming readiness.' },
    output: { ar: 'سجل اعتماديات ومخاطر ومجهولات', en: 'Dependency, risk, and unknowns register' },
    decision: { ar: 'ما الذي يمنع البناء، وما الذي يمكن عزله أو اختباره مبكراً؟', en: 'What blocks build, and what can be isolated or tested early?' },
  },
  {
    id: 'build',
    index: '05',
    title: { ar: 'البناء والمراجعة', en: 'Build & Review' },
    summary: {
      ar: 'يتقدم التنفيذ في أجزاء قابلة للمراجعة مرتبطة بالنطاق والقرارات، بلا وعود زمنية مصطنعة.',
      en: 'Implementation progresses in reviewable increments tied to scope and decisions, without invented delivery promises.',
    },
    question: { ar: 'ما أصغر تقدم متماسك يمكن فحصه واتخاذ قرار حوله؟', en: 'What is the smallest coherent progress unit that can be inspected and decided on?' },
    control: { ar: 'مراجعات مرحلية، أثر قرار واضح، ومنع التوسع الصامت.', en: 'Staged reviews, explicit decision trace, and prevention of silent scope growth.' },
    output: { ar: 'تقدم قابل للمراجعة + سجل قرار', en: 'Reviewable increment + decision record' },
    decision: { ar: 'هل يطابق الجزء المنفذ النطاق المقبول قبل مواصلة البناء؟', en: 'Does the implemented increment match accepted scope before build continues?' },
  },
  {
    id: 'quality',
    index: '06',
    title: { ar: 'الدليل والجودة', en: 'Evidence & Quality' },
    summary: {
      ar: 'لا تتحول المطالبة إلى حقيقة إلا بوسيلة تحقق مرتبطة بالحالة التي راجعناها.',
      en: 'A claim becomes usable only through verification tied to the exact state reviewed.',
    },
    question: { ar: 'ما الدليل المناسب لكل ادعاء وظيفي أو بصري أو تشغيلي؟', en: 'What evidence is appropriate for each functional, visual, or operational claim?' },
    control: { ar: 'اختبارات، مراجعة متطلبات، فحص بصري، وتسجيل القيود والفشل بصدق.', en: 'Tests, requirement review, visual inspection, and honest recording of limits and failures.' },
    output: { ar: 'سجل تحقق + قيود معروفة', en: 'Verification record + known limitations' },
    decision: { ar: 'ما الذي ثبت، وما الذي ما زال غير متحقق أو خارج النطاق؟', en: 'What is proven, and what remains unverified or out of scope?' },
  },
  {
    id: 'transition',
    index: '07',
    title: { ar: 'من القرار إلى المشروع', en: 'Decision-to-Project Transition' },
    summary: {
      ar: 'نحوّل قرار GS الموجّه إلى مدخلات تأسيس مشروع ونطاق يمكن مراجعته قبل البدء.',
      en: 'Turn the guided GS decision into project-bootstrap and scope inputs that can be reviewed before work starts.',
    },
    question: { ar: 'هل القرار قابل للتسليم كمدخل منظم لفريق المشروع؟', en: 'Can the decision be handed over as structured project input?' },
    control: { ar: 'تثبيت السياق والنطاق والقرارات والاعتماديات والدليل المطلوب دون اعتبارها عقداً تلقائياً.', en: 'Package context, scope, decisions, dependencies, and required evidence without treating it as an automatic contract.' },
    output: { ar: 'حزمة تأسيس + خط أساس نطاق للمراجعة', en: 'Bootstrap pack + reviewable scope baseline' },
    decision: { ar: 'هل يملك الطرفان مدخلاً واحداً واضحاً لقرار بدء منفصل؟', en: 'Do both sides share one clear input for a separate start decision?' },
  },
];

export const scopeBands: ScopeBand[] = [
  { code: 'required', label: { ar: 'مطلوب', en: 'Required' }, meaning: { ar: 'لا تتحقق النتيجة الأساسية بدونه.', en: 'The core outcome cannot be achieved without it.' } },
  { code: 'included', label: { ar: 'مشمول', en: 'Included' }, meaning: { ar: 'داخل خط الأساس المتفق عليه.', en: 'Inside the accepted baseline.' } },
  { code: 'optional', label: { ar: 'اختياري', en: 'Optional' }, meaning: { ar: 'قيمة إضافية لا تمنع الأساس.', en: 'Additional value that does not block the baseline.' } },
  { code: 'conditional', label: { ar: 'مشروط', en: 'Conditional' }, meaning: { ar: 'يدخل فقط إذا تحقق شرط معلن.', en: 'Enters only if a stated condition is met.' } },
  { code: 'custom', label: { ar: 'مخصص', en: 'Custom' }, meaning: { ar: 'يحتاج تصميماً أو قراراً خاصاً بالسياق.', en: 'Needs context-specific design or decision.' } },
  { code: 'unknown', label: { ar: 'غير محسوم / يحتاج قراراً', en: 'Unknown / Requires Decision' }, meaning: { ar: 'لا يُفترض؛ يبقى ظاهراً حتى يُحسم.', en: 'Never assumed; remains visible until decided.' } },
];

export const dependencyDimensions: LocalizedText[] = [
  { ar: 'التكاملات', en: 'Integrations' },
  { ar: 'المزودون', en: 'Providers' },
  { ar: 'البيانات', en: 'Data' },
  { ar: 'الترحيل', en: 'Migration' },
  { ar: 'الأنظمة الخارجية', en: 'External systems' },
  { ar: 'القيود والمجهولات', en: 'Constraints & unknowns' },
];

export const gsPrinciples: LocalizedText[] = [
  { ar: 'نبدأ من المشكلة التشغيلية، لا من شاشة مفترضة.', en: 'Start from the operating problem, not an assumed screen.' },
  { ar: 'نستخدم المراجع لتسريع الفهم، لا لنسخ حقيقة مشروع آخر.', en: 'Use references to accelerate understanding, not copy another project’s truth.' },
  { ar: 'نُظهر الحدود والمجهولات قبل أن تتحول إلى وعود.', en: 'Expose boundaries and unknowns before they become promises.' },
  { ar: 'نربط القرار بالنطاق، والنطاق بالمراجعة، والمطالبة بالدليل.', en: 'Connect decision to scope, scope to review, and claims to evidence.' },
];

export function methodText(value: LocalizedText, locale: ReferenceLocale): string {
  return value[locale];
}
