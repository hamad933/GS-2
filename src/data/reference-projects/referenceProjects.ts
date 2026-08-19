export type ReferenceLocale = 'ar' | 'en';

export type LocalizedText = {
  ar: string;
  en: string;
};

export type ReferenceProjectId = 'rp01' | 'rp02' | 'rp03' | 'rp04';

export type EvidenceState = 'REFERENCE_ONLY' | 'UNAVAILABLE';

export type ReferenceEvidence = {
  label: LocalizedText;
  state: EvidenceState;
  note: LocalizedText;
};

export type ReferenceProject = {
  id: ReferenceProjectId;
  code: Uppercase<ReferenceProjectId>;
  name: string;
  domain: LocalizedText;
  context: LocalizedText;
  problem: LocalizedText;
  capabilityClass: LocalizedText;
  usefulWhen: LocalizedText;
  doesNotProve: LocalizedText;
  capabilities: LocalizedText[];
  evidence: ReferenceEvidence[];
  outboundRoute: null;
};

const sharedEvidence: ReferenceEvidence[] = [
  {
    label: { ar: 'ملخص القدرة', en: 'Capability framing' },
    state: 'REFERENCE_ONLY',
    note: {
      ar: 'ملخص محدود من GS لتوضيح الملاءمة؛ الحقيقة التفصيلية يملكها المشروع المستقل.',
      en: 'A bounded GS fit summary; detailed product truth remains with the independent project.',
    },
  },
  {
    label: { ar: 'واجهات المنتج', en: 'Product surfaces' },
    state: 'UNAVAILABLE',
    note: {
      ar: 'لا تتوفر حاليًا لقطات موثقة يمكن عرضها كدليل.',
      en: 'No verified product captures are currently available to present as proof.',
    },
  },
  {
    label: { ar: 'الدليل التشغيلي', en: 'Operational proof' },
    state: 'UNAVAILABLE',
    note: {
      ar: 'لا توجد هنا بيانات عميل أو نشر أو نتائج تشغيلية موثقة.',
      en: 'No verified client, deployment, or operating-result evidence is held here.',
    },
  },
];

function evidenceCopy(): ReferenceEvidence[] {
  return sharedEvidence.map((item) => ({
    ...item,
    label: { ...item.label },
    note: { ...item.note },
  }));
}

export const referenceProjects: ReferenceProject[] = [
  {
    id: 'rp01',
    code: 'RP01',
    name: 'Bayt & Style',
    domain: { ar: 'التجارة والتنفيذ', en: 'Commerce & Fulfillment' },
    context: {
      ar: 'مرجع مستقل يضع تجربة العلامة والتجارة في سياق تشغيلي واحد.',
      en: 'An independent reference that places branded commerce in an operating context.',
    },
    problem: {
      ar: 'يمثل الحاجة إلى ربط اكتشاف المنتج، قرار الطلب، وسياق التنفيذ دون فصل التجربة عن التشغيل.',
      en: 'Represents the need to connect product discovery, order decisions, and fulfillment context without separating experience from operations.',
    },
    capabilityClass: {
      ar: 'هندسة تجربة تجارة مترابطة مع وضوح دورة الطلب.',
      en: 'Connected commerce experience architecture with order-lifecycle clarity.',
    },
    usefulWhen: {
      ar: 'عندما يجمع المشروع بين حضور العلامة، كتالوج منظم، ومسار طلب يحتاج إلى حدود تشغيلية واضحة.',
      en: 'Useful when brand presence, a structured catalog, and an order path need explicit operational boundaries.',
    },
    doesNotProve: {
      ar: 'لا يثبت تكامل مزود دفع أو مخزون أو شحن بعينه، ولا يثبت حجم تشغيل أو نتائج تجارية.',
      en: 'It does not prove any specific payment, inventory, or shipping integration, operating scale, or commercial result.',
    },
    capabilities: [
      { ar: 'اكتشاف المنتج', en: 'Product discovery' },
      { ar: 'سياق الطلب', en: 'Order context' },
      { ar: 'حدود التنفيذ', en: 'Fulfillment boundaries' },
      { ar: 'اتساق العلامة', en: 'Brand continuity' },
    ],
    evidence: evidenceCopy(),
    outboundRoute: null,
  },
  {
    id: 'rp02',
    code: 'RP02',
    name: 'Enterprise Operations & Control',
    domain: { ar: 'العمليات والتحكم المؤسسي', en: 'Enterprise Operations & Control' },
    context: {
      ar: 'مرجع مستقل لمساحات العمل التي تحتاج حالة مشتركة وقرارات مضبوطة.',
      en: 'An independent reference for workspaces that need shared state and controlled decisions.',
    },
    problem: {
      ar: 'يمثل تشتت الطلبات والأدوار والحالات عندما تعبر العملية أكثر من فريق أو نقطة قرار.',
      en: 'Represents fragmented requests, roles, and statuses when work crosses teams and decision points.',
    },
    capabilityClass: {
      ar: 'هندسة سطح تشغيل يربط الحالة، المسؤولية، والخطوة التالية.',
      en: 'Operational workspace architecture connecting status, ownership, and next action.',
    },
    usefulWhen: {
      ar: 'عندما يحتاج العمل إلى سجل حالة مفهوم، انتقالات واضحة، ونقاط تحكم قابلة للمراجعة.',
      en: 'Useful when work needs an intelligible state record, explicit transitions, and reviewable control points.',
    },
    doesNotProve: {
      ar: 'لا يثبت تكاملاً مؤسسياً بعينه، صلاحيات إنتاجية، امتثالاً، أو أداءً على نطاق محدد.',
      en: 'It does not prove any specific enterprise integration, production authorization model, compliance posture, or scale performance.',
    },
    capabilities: [
      { ar: 'وضوح الحالة', en: 'State clarity' },
      { ar: 'ملكية العمل', en: 'Work ownership' },
      { ar: 'نقاط القرار', en: 'Decision controls' },
      { ar: 'تتابع العملية', en: 'Process continuity' },
    ],
    evidence: evidenceCopy(),
    outboundRoute: null,
  },
  {
    id: 'rp03',
    code: 'RP03',
    name: 'Booking & Service Operations',
    domain: { ar: 'الحجز وعمليات الخدمة', en: 'Booking & Service Operations' },
    context: {
      ar: 'مرجع مستقل لرحلة تبدأ باختيار خدمة وتنتهي بحالة تشغيل مفهومة.',
      en: 'An independent reference for a journey from service choice to an intelligible operating state.',
    },
    problem: {
      ar: 'يمثل تعقيد المواءمة بين اختيار الخدمة، التوافر، التأكيد، وما يحتاجه فريق التشغيل بعد الحجز.',
      en: 'Represents the complexity of aligning service choice, availability, confirmation, and the post-booking operator handoff.',
    },
    capabilityClass: {
      ar: 'هندسة رحلة حجز متصلة بسياق تنفيذ الخدمة.',
      en: 'Booking-journey architecture connected to service-delivery context.',
    },
    usefulWhen: {
      ar: 'عندما تحتاج تجربة العميل وجدولة الخدمة وحالة الطلب إلى لغة واحدة وحدود واضحة.',
      en: 'Useful when customer experience, service scheduling, and request state need one language and clear boundaries.',
    },
    doesNotProve: {
      ar: 'لا يثبت مزود تقويم أو دفع أو رسائل بعينه، ولا يثبت السعة أو معدلات الإتمام.',
      en: 'It does not prove any specific calendar, payment, or messaging provider, capacity, or completion rate.',
    },
    capabilities: [
      { ar: 'اختيار الخدمة', en: 'Service selection' },
      { ar: 'منطق التوافر', en: 'Availability logic' },
      { ar: 'حالة الحجز', en: 'Booking state' },
      { ar: 'تسليم تشغيلي', en: 'Operator handoff' },
    ],
    evidence: evidenceCopy(),
    outboundRoute: null,
  },
  {
    id: 'rp04',
    code: 'RP04',
    name: 'Real Estate & Asset Lifecycle',
    domain: { ar: 'العقار ودورة حياة الأصل', en: 'Real Estate & Asset Lifecycle' },
    context: {
      ar: 'مرجع مستقل لتنظيم اكتشاف الأصل ومعلوماته ومسار القرار حوله.',
      en: 'An independent reference for structuring asset discovery, information, and its decision path.',
    },
    problem: {
      ar: 'يمثل صعوبة جمع العرض البصري، البيانات المنظمة، المقارنة، والاستفسار ضمن دورة أصل مفهومة.',
      en: 'Represents the difficulty of joining visual presentation, structured data, comparison, and inquiry in a coherent asset lifecycle.',
    },
    capabilityClass: {
      ar: 'هندسة تجربة أصل تربط الاستكشاف بالمعلومة ومسار القرار.',
      en: 'Asset-experience architecture connecting discovery, information, and decision flow.',
    },
    usefulWhen: {
      ar: 'عندما يتطلب القرار موازنة الصورة والبيانات والسياق قبل الانتقال إلى الاستفسار أو الإجراء.',
      en: 'Useful when decisions balance imagery, data, and context before inquiry or action.',
    },
    doesNotProve: {
      ar: 'لا يثبت تغذية قوائم أو خرائط أو سجلات ملكية بعينها، ولا يثبت معاملات أو نتائج أصول.',
      en: 'It does not prove any specific listing feed, mapping service, title record, transaction, or asset outcome.',
    },
    capabilities: [
      { ar: 'اكتشاف الأصل', en: 'Asset discovery' },
      { ar: 'بيانات منظمة', en: 'Structured information' },
      { ar: 'سياق المقارنة', en: 'Comparison context' },
      { ar: 'مسار الاستفسار', en: 'Inquiry path' },
    ],
    evidence: evidenceCopy(),
    outboundRoute: null,
  },
];

export function localized(value: LocalizedText, locale: ReferenceLocale): string {
  return value[locale];
}
