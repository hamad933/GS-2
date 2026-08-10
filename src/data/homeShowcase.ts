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
  visual: 'service' | 'commerce' | 'portal' | 'assets';
};

export const referenceProjects: ReferenceProject[] = [
  { id: 'rp01', index: 'RP01', family: 'Bayt & Style', title: 'تجربة تجارة وهوية بصرية متصلة', statement: 'واجهة عرض مرنة تجمع حضور العلامة واستكشاف المنتجات في تجربة واحدة.', focus: ['هوية واضحة', 'استكشاف المنتج', 'رحلة متصلة'], visual: 'commerce' },
  { id: 'rp02', index: 'RP02', family: 'Enterprise Operations', title: 'نظام تشغيل يوضّح العمل', statement: 'سطح تشغيلي يجمع المهام والحالات والخطوة التالية دون ازدحام.', focus: ['سياق العمل', 'وضوح الحالة', 'خطوة تالية'], visual: 'portal' },
  { id: 'rp03', index: 'RP03', family: 'Booking & Services', title: 'حجز يبدأ من احتياج واضح', statement: 'رحلة خدمة تنظّم الاختيار والموعد والتأكيد في مسار مفهوم.', focus: ['اختيار الخدمة', 'تنظيم الموعد', 'تأكيد واضح'], visual: 'service' },
  { id: 'rp04', index: 'RP04', family: 'Real Estate & Assets', title: 'الأصول في مساحة قرار واحدة', statement: 'تجربة استكشاف توازن بين الصورة والمعلومة وتقود إلى الاستفسار المناسب.', focus: ['استكشاف بصري', 'تفاصيل مرتبة', 'قرار أوضح'], visual: 'assets' },
];
