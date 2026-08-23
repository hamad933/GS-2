import type {
  DiscoveryCertainty,
  DiscoveryStepId,
  DiscoverySummaryStatus,
} from '../../types/start-discovery';

export interface DiscoveryOption<T extends string> {
  value: T;
  label: string;
  description: string;
  marker: string;
}

export const certaintyOptions: readonly DiscoveryOption<DiscoveryCertainty>[] = [
  {
    value: 'exploring',
    marker: '01',
    label: 'لا أعرف ماذا أحتاج',
    description: 'نبدأ من المشكلة والنتيجة، ثم نحدد ما يستحق الاستكشاف.',
  },
  {
    value: 'direction',
    marker: '02',
    label: 'لدي اتجاه عام',
    description: 'نحوّل الاتجاه إلى استخدامات ونتائج وحدود أوضح.',
  },
  {
    value: 'configured',
    marker: '03',
    label: 'اخترت حلًا أو إعدادًا مبدئيًا',
    description: 'نراجع الاختيارات ونكشف التبعيات والنقاط غير المحسومة.',
  },
  {
    value: 'detailed',
    marker: '04',
    label: 'أعرف معظم متطلباتي',
    description: 'ننظم المتطلبات في ملخص قابل للمراجعة قبل أي تقدير أو التزام.',
  },
] as const;

export const objectiveOptions = [
  'تحسين عملية تشغيلية',
  'إطلاق خدمة أو تجربة رقمية',
  'تنظيم رحلة عميل',
  'توحيد معلومات أو إجراءات',
  'تطوير قناة بيع أو حجز',
] as const;

export const domainOptions = [
  'تشغيل داخلي',
  'تجارة وتجربة علامة',
  'حجوزات وخدمات',
  'عقارات وأصول',
  'بوابات وخدمات ذاتية',
  'معرفة ومحتوى',
] as const;

export const configurationOptions = [
  'أفضل نقطة بداية محدودة',
  'أفضل مسارًا متكاملًا من البداية',
  'أحتاج مقارنة أكثر من إعداد',
  'لم أحسم طريقة التكوين بعد',
] as const;

export const budgetOptions = [
  'أحتاج تصورًا للنطاق قبل مناقشة الميزانية',
  'لدي نطاق ميزانية مرن',
  'لدي سقف مبدئي سأشاركه أثناء الاكتشاف',
  'أفضل تأجيل هذه المحادثة الآن',
] as const;

export const timingOptions = [
  'أولوية قريبة تحتاج مناقشة',
  'مرتبط بموعد داخلي',
  'هدف زمني مرن',
  'غير محدد بعد',
] as const;

export const stepLabels: Record<DiscoveryStepId, string> = {
  certainty: 'نقطة البداية',
  foundation: 'بوصلة المشروع',
  'people-outcomes': 'الاستخدام والنتيجة',
  configuration: 'شكل الحل',
  dependencies: 'الواقع المحيط',
  preferences: 'تفضيلات وحدود',
  summary: 'ملخص الاكتشاف',
  complete: 'نسخة المراجعة',
};

export const summaryStatusContent: Record<
  DiscoverySummaryStatus,
  { label: string; description: string; code: string }
> = {
  known: {
    code: 'KNOWN',
    label: 'معلوم',
    description: 'سياق صرّحت به ويمكن البناء عليه في جلسة الاكتشاف.',
  },
  selected: {
    code: 'SELECTED',
    label: 'محدد',
    description: 'اختيارات حالية قابلة للمراجعة وليست اعتمادًا نهائيًا.',
  },
  preferred: {
    code: 'PREFERRED',
    label: 'مفضّل',
    description: 'تفضيلات توجه النقاش ولا تمثل سعرًا أو موعدًا ملزمًا.',
  },
  dependent: {
    code: 'DEPENDENT',
    label: 'مرتبط بتبعيات',
    description: 'نقاط تتطلب تحققًا من الأنظمة أو البيانات أو أطراف أخرى.',
  },
  unknown: {
    code: 'UNKNOWN / NEEDS DISCOVERY',
    label: 'غير محسوم',
    description: 'أسئلة يجب إبقاؤها ظاهرة حتى تُفحص في الاكتشاف.',
  },
};
