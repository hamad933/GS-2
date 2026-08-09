import React, { useState } from 'react';
import { 
  GlobeIcon, 
  ShoppingBagIcon, 
  CalendarIcon, 
  Building2Icon, 
  LayoutGridIcon, 
  BookOpenIcon,
  CheckIcon,
  ArrowLeftIcon,
  PlusIcon
} from 'lucide-react';

interface Family {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  whatWeBuild: string[];
  whenItFits: string[];
  integratesWith: string[];
  previewTitle: string;
  previewDesc: string;
}

const FAMILIES: Family[] = [
  {
    id: '01',
    num: '01',
    title: 'مواقع الأعمال والخدمات',
    subtitle: 'حضور رقمي، تعريف واضح، وطلبات مباشرة',
    icon: GlobeIcon,
    whatWeBuild: [
      'موقع أعمال احترافي',
      'عرض الخدمات بوضوح',
      'نماذج طلب وتواصل',
      'تجربة متجاوبة وسريعة'
    ],
    whenItFits: [
      'إطلاق مشروع أو خدمة جديدة',
      'تطوير حضور رقمي قائم',
      'توسيع نطاق العملاء',
      'رفع وضوح الخدمات والفيئة'
    ],
    integratesWith: [
      'حجوزات وخدمات',
      'بوابة تشغيلية',
      'تجارة رقمية',
      'محتوى ومعرفة'
    ],
    previewTitle: 'منصة أعمال تعكس قيمة خدماتك وتسهّل تجربة عملائك',
    previewDesc: 'موقع احترافي، سريع، ومتجاوب للنمو بثقة ووضوح.'
  },
  {
    id: '02',
    num: '02',
    title: 'التجارة الرقمية وتجارب العلامات',
    subtitle: 'عرض المنتجات، السرد، والشراء',
    icon: ShoppingBagIcon,
    whatWeBuild: [
      'متاجر رقمية فاخرة',
      'عرض الكتالوج والمجموعات',
      'سلة وسداد متكامل',
      'تجربة تخصيص المنتج'
    ],
    whenItFits: [
      'بيع منتجات مباشرة للعميل',
      'إطلاق تجربة علامة مميزة',
      'التوسع المباشر للمبيعات',
      'ربط المتجر بالمنظومة'
    ],
    integratesWith: [
      'أنظمة المبيعات والمخزون',
      'بوابات الدفع والمالية',
      'محتوى وتجارب العلامة'
    ],
    previewTitle: 'متجر فاخر يعرض علامتك ويمنح عملاءك تجربة تسوق سهلة',
    previewDesc: 'تصميم يعزز القيمة ويزيد معدلات التحويل للعلامات التجارية.'
  },
  {
    id: '03',
    num: '03',
    title: 'الحجوزات والخدمات',
    subtitle: 'اختيار الخدمة، المواعيد، والتأكيد',
    icon: CalendarIcon,
    whatWeBuild: [
      'جدولة المواعيد الذكية',
      'اختيار الخدمات والموظف',
      'تأكيد واستلام فوري',
      'لوحة متابعة المواعيد'
    ],
    whenItFits: [
      'الشركات الاستشارية والمهنية',
      'المراكز الطبية والمتخصصة',
      'خدمات الضيافة والفعاليات',
      'تنظيم مواعيد العملاء'
    ],
    integratesWith: [
      'التقويمات والأنظمة الداخلية',
      'إشعارات الواتساب والإيميل',
      'بوابات الدفع الإلكتروني'
    ],
    previewTitle: 'منصة حجوزات دقيقة تنظم المواعيد وتوفر وقت فريقك',
    previewDesc: 'سهولة الحجز للعملاء وإدارة آليّة كاملة للمواعيد.'
  },
  {
    id: '04',
    num: '04',
    title: 'العقارات والأصول',
    subtitle: 'اكتشاف الأصول، التصفية، والتفاصيل',
    icon: Building2Icon,
    whatWeBuild: [
      'دليل عقارات وأصول متطور',
      'بحث وتصفية متقدمة',
      'جولات وتفاصيل تفاعلية',
      'استقبال طلبات المعاينة'
    ],
    whenItFits: [
      'شركات التطوير العقاري',
      'إدارة الأصول والمحفظة',
      'منصات البيع والتأجير',
      'عرض المشاريع النوعية'
    ],
    integratesWith: [
      'بوابات الاستفسار والـ CRM',
      'خرائط وحساب المساحات',
      'إدارة عقود واستفسارات'
    ],
    previewTitle: 'منصة عقارية استثنائية تعرض المشاريع وتجذب المستثمرين',
    previewDesc: 'تصفة فائقة الدقة وتجربة استكشاف بصرية غنية.'
  },
  {
    id: '05',
    num: '05',
    title: 'الأنظمة التشغيلية والبوابات',
    subtitle: 'الطلبات، الأدوار، وسير العمل',
    icon: LayoutGridIcon,
    whatWeBuild: [
      'بوابات العملاء والموردين',
      'لوحات التحكم والعمليات',
      'إدارة الصلاحيات وسير العمل',
      'متابعة حالة الطلبات'
    ],
    whenItFits: [
      'إدارة العمليات المعقدة',
      'أتمتة الطلبات الداخلية',
      'تتبع الأداء والمؤشرات',
      'ربط الفروع والفرق'
    ],
    integratesWith: [
      'أنظمة ERP و Cloud SQL',
      'خدمات API الخارجية',
      'منصات الدفع والتقارير'
    ],
    previewTitle: 'غرفة عمليات رقمية تضمن سلاسة العمل وسرعة الإنجاز',
    previewDesc: 'تحكم كامل بالأدوار، الصلاحيات، ومراحل الطلبات.'
  },
  {
    id: '06',
    num: '06',
    title: 'التعليم والمعرفة والمحتوى',
    subtitle: 'الدروس، المسارات، وتنظيم المحتوى',
    icon: BookOpenIcon,
    whatWeBuild: [
      'أكاديميات ومراكز معرفة',
      'مسارات تعليمية وتفاعلية',
      'مكتبة موارد ومستندات',
      'لوحات متابعة التقدم'
    ],
    whenItFits: [
      'التدريب المؤسسي الداخلي',
      'بيع الدورات والمعرفة',
      'بناء المجتمعات الرقمية',
      'توثيق أدلة العمل'
    ],
    integratesWith: [
      'منصات الفيديو والملفات',
      'الشهادات والاختبارات',
      'اشتراكات وتراخيص'
    ],
    previewTitle: 'بيئة تعليمية ممتعة تنظم المعرفة وتحفز التعلم المستمر',
    previewDesc: 'تجربة سلسة لتنظيم المسارات ومتابعة إنجاز المتدربين.'
  }
];

export function SolutionFamiliesSection() {
  const [activeId, setActiveId] = useState<string>('01');
  const activeFamily = FAMILIES.find((f) => f.id === activeId) || FAMILIES[0];

  return (
    <section className="relative border-t border-mineral-300/60 bg-mineral-50 py-16 lg:py-24" id="families">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-8 lg:px-12">
        {/* Section Tag & Title Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-bronze-300 bg-bronze-50/80 px-3 py-1 text-xs font-semibold text-bronze-700">
            <span className="h-1.5 w-1.5 rounded-full bg-bronze-500" />
            02 — عائلات الحلول
          </div>
          <h2 className="mt-4 font-kufi text-2xl font-bold leading-tight text-navy-900 sm:text-3xl lg:text-4xl">
            ست عائلات من القدرات، <br className="hidden sm:inline" />
            وحلول تتشكل حسب احتياجك
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-900/70 sm:text-base">
            من مواقع الأعمال والتجارة الرقمية إلى البوابات التشغيلية وبيئات المعرفة، نختار ونرّكب القدرات المناسبة لبناء حلول متوافقة مع طبيعة مشاريعك.
          </p>
        </div>

        {/* Main Grid: Preview Card Left, Accordion List Right */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          {/* Left Column: Interactive Family Card / Browser Preview */}
          <div className="sticky top-8 rounded-2xl border border-mineral-300 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between border-b border-mineral-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-bronze-300">
                  <activeFamily.icon className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-bronze-600">عائلة #{activeFamily.num}</span>
                  <h3 className="font-kufi text-lg font-bold text-navy-900">{activeFamily.title}</h3>
                </div>
              </div>
              <span className="rounded-full bg-bronze-50 border border-bronze-300 px-3 py-1 text-xs font-semibold text-bronze-800">
                حلول رقمية
              </span>
            </div>

            {/* Inner Mockup Card */}
            <div className="mt-6 rounded-xl border border-mineral-200 bg-mineral-50 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <span className="font-mono text-[10px] text-navy-900/40">generalsolutions.sa/{activeFamily.id}</span>
              </div>
              
              <h4 className="font-kufi text-base font-bold text-navy-900">{activeFamily.previewTitle}</h4>
              <p className="mt-1 text-xs text-navy-900/70">{activeFamily.previewDesc}</p>

              <div className="mt-4 grid grid-cols-2 gap-2 pt-2 border-t border-mineral-200/80">
                <div className="rounded-lg bg-white p-2.5 border border-mineral-200">
                  <p className="text-[10px] font-bold text-bronze-600">سهولة الاستخدام</p>
                  <p className="text-[11px] font-semibold text-navy-900">تجربة مستخدم فائقة</p>
                </div>
                <div className="rounded-lg bg-white p-2.5 border border-mineral-200">
                  <p className="text-[10px] font-bold text-bronze-600">التكامل الرقمي</p>
                  <p className="text-[11px] font-semibold text-navy-900">جاهز للربط الفوري</p>
                </div>
              </div>
            </div>

            {/* Three Pillar Cards: What We Build / When Fits / Integrations */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {/* What We Build */}
              <div className="rounded-xl border border-mineral-200 bg-mineral-50/50 p-4">
                <p className="font-kufi text-xs font-bold text-navy-900 mb-2.5">ما الذي نبنيه</p>
                <ul className="space-y-1.5">
                  {activeFamily.whatWeBuild.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-xs text-navy-900/80">
                      <CheckIcon className="h-3.5 w-3.5 text-bronze-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* When Fits */}
              <div className="rounded-xl border border-mineral-200 bg-mineral-50/50 p-4">
                <p className="font-kufi text-xs font-bold text-navy-900 mb-2.5">متى يناسبك</p>
                <ul className="space-y-1.5">
                  {activeFamily.whenItFits.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-xs text-navy-900/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-navy-900 shrink-0 mt-1.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Integrations */}
              <div className="rounded-xl border border-mineral-200 bg-mineral-50/50 p-4">
                <p className="font-kufi text-xs font-bold text-navy-900 mb-2.5">يمكن دمجه مع</p>
                <ul className="space-y-1.5">
                  {activeFamily.integratesWith.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-xs text-navy-900/80">
                      <PlusIcon className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Solution Families List (01 - 06) */}
          <div className="space-y-3">
            {FAMILIES.map((family) => {
              const isSelected = family.id === activeId;
              const IconComp = family.icon;

              return (
                <button
                  key={family.id}
                  type="button"
                  onClick={() => setActiveId(family.id)}
                  className={`w-full text-right transition-all duration-200 rounded-2xl p-5 border text-right cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-bronze-500 bg-white shadow-md ring-1 ring-bronze-500/30'
                      : 'border-mineral-300 bg-white/60 hover:bg-white hover:border-mineral-400'
                  }`}>
                  <div className="flex items-center gap-4">
                    <span className={`font-mono text-lg font-bold ${isSelected ? 'text-bronze-600' : 'text-navy-900/30'}`}>
                      {family.num}
                    </span>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      isSelected ? 'bg-navy-900 text-bronze-300' : 'bg-mineral-100 text-navy-900/60'
                    }`}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className={`font-kufi text-base font-bold ${isSelected ? 'text-navy-900' : 'text-navy-900/80'}`}>
                        {family.title}
                      </h3>
                      <p className="text-xs text-navy-900/60 mt-0.5">{family.subtitle}</p>
                    </div>
                  </div>

                  <ArrowLeftIcon className={`h-5 w-5 transition-transform ${isSelected ? 'text-bronze-600 translate-x-1' : 'text-mineral-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Banner: Combination Power */}
        <div className="mt-12 rounded-2xl border border-bronze-300/80 bg-gradient-to-r from-bronze-50/90 via-mineral-50 to-bronze-50/90 p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="font-kufi text-xs font-bold text-bronze-700">الحل الواحد قد يجمع أكثر من عائلة</span>
              <p className="mt-1 text-sm font-medium text-navy-900">
                نصمم التركيبة المناسبة لمشروعك لتعمل كمنظومة متماسكة بدلاً من أدوات متفرقة.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white border border-bronze-300 px-3.5 py-1.5 text-xs font-semibold text-navy-900 shadow-xs">
                موقع أعمال + حجوزات
              </span>
              <span className="text-bronze-500 font-bold">+</span>
              <span className="rounded-full bg-white border border-bronze-300 px-3.5 py-1.5 text-xs font-semibold text-navy-900 shadow-xs">
                عقارات + بوابة تشغيلية
              </span>
              <span className="text-bronze-500 font-bold">+</span>
              <span className="rounded-full bg-white border border-bronze-300 px-3.5 py-1.5 text-xs font-semibold text-navy-900 shadow-xs">
                تجارة رقمية + محتوى
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
