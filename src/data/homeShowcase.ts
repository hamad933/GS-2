export type SolutionFamily = {
  id: string;
  title: string;
  cue: string;
  description: string;
  outcomes: string[];
};

export const solutionFamilies: SolutionFamily[] = [
  { id: 'business', title: 'مواقع الأعمال والخدمات', cue: 'وضوح الحضور والطلب', description: 'مساحة توضّح قيمة العمل، ترتّب الخدمات، وتقود الزائر إلى الخطوة المناسبة دون تشتيت.', outcomes: ['تعريف واضح', 'رحلة طلب مباشرة', 'محتوى منظم'] },
  { id: 'commerce', title: 'التجارة الرقمية وتجارب العلامات', cue: 'من الاكتشاف إلى الاختيار', description: 'تجربة تجمع قصة العلامة والمنتج والقرار في مسار شراء مفهوم ومتّسق.', outcomes: ['عرض المنتجات', 'تجربة العلامة', 'اختيار أكثر سلاسة'] },
  { id: 'booking', title: 'الحجوزات والخدمات', cue: 'موعد واضح بخطوات أقل', description: 'رحلة تساعد العميل على اختيار الخدمة والوقت وتأكيد طلبه بوضوح.', outcomes: ['اختيار الخدمة', 'تنظيم المواعيد', 'تأكيد مفهوم'] },
  { id: 'assets', title: 'العقارات والأصول', cue: 'اكتشاف يقرّب القرار', description: 'عرض منظّم للأصول يوازن بين الصورة والمعلومة ويجعل المقارنة والاستفسار أسهل.', outcomes: ['استكشاف بصري', 'تفاصيل مرتبة', 'طلب استفسار'] },
  { id: 'portals', title: 'الأنظمة التشغيلية والبوابات', cue: 'العمل في مسار واحد', description: 'مساحات تجمع الطلبات والأدوار والمتابعة لتصبح الخطوة التالية ظاهرة لكل مستخدم.', outcomes: ['طلبات منظمة', 'أدوار واضحة', 'متابعة الحالة'] },
  { id: 'knowledge', title: 'التعليم والمعرفة والمحتوى', cue: 'المعرفة كرحلة قابلة للمتابعة', description: 'بيئة ترتّب المحتوى والمسارات بحيث يسهل الوصول إلى المعرفة ومواصلة التعلّم.', outcomes: ['مسارات معرفة', 'محتوى مترابط', 'تقدّم واضح'] },
];

export type ReferenceProject = {
  id: string;
  index: string;
  family: string;
  title: string;
  statement: string;
  focus: string[];
  visual: 'service' | 'commerce' | 'portal';
};

// REFERENCE_ONLY: temporary illustrative entries, intentionally isolated for later replacement.
export const referenceProjects: ReferenceProject[] = [
  { id: 'service-journey', index: '01', family: 'مواقع الأعمال والخدمات', title: 'رحلة خدمة تبدأ من السؤال الصحيح', statement: 'تصوّر توضيحي لسطح يختصر تعريف الخدمة والاختيار والطلب في إيقاع واحد.', focus: ['وضوح الخدمة', 'توجيه القرار', 'طلب مباشر'], visual: 'service' },
  { id: 'brand-commerce', index: '02', family: 'التجارة الرقمية وتجارب العلامات', title: 'منتج يتقدّم، والواجهة تتراجع', statement: 'تصوّر توضيحي لتجربة تحافظ على حضور العلامة وتمنح الاختيار المساحة الأكبر.', focus: ['سرد بصري', 'اكتشاف المنتج', 'اختيار هادئ'], visual: 'commerce' },
  { id: 'operations-portal', index: '03', family: 'الأنظمة التشغيلية والبوابات', title: 'مسار عمل يمكن قراءته من نظرة', statement: 'تصوّر توضيحي لبوابة ترتّب الطلبات والحالة والخطوة التالية دون ازدحام.', focus: ['حالة واضحة', 'أولوية العمل', 'خطوة تالية'], visual: 'portal' },
];
