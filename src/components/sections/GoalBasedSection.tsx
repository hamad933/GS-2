import React, { useState } from 'react';
import { 
  TargetIcon, 
  CheckCircle2Icon, 
  SparklesIcon, 
  MonitorIcon
} from 'lucide-react';

interface Goal {
  id: string;
  num: string;
  title: string;
  shortDesc: string;
  goalTarget: string;
  needs: string[];
  directions: string[];
  sampleAppTitle: string;
  sampleAppTag: string;
  flowSteps: string[];
}

const GOALS: Goal[] = [
  {
    id: 'g1',
    num: '01',
    title: 'أريد إطلاق حضور رقمي جديد',
    shortDesc: 'حضور رسمي، تعريف بالشركة والخدمات، ووسائل تواصل مباشرة',
    goalTarget: 'إطلاق واجهة رقمية تعكس هوية المنشأة وتبني الثقة مع الزوار',
    needs: [
      'هيكل معلوماتي واضح ومباشر',
      'تصميم يعكس قيمة وشخصية العلامة',
      'نماذج تواصل واستفسارات سريعة',
      'توافق تام مع مختلف الأجهزة'
    ],
    directions: ['موقع أعمال وخدمات احترافي', 'صفحة هبوط تسويقية مخصصة'],
    sampleAppTitle: 'منصة مسارات للحلول والخدمات',
    sampleAppTag: 'حضور رقمي متكامل',
    flowSteps: ['زيارة الموقع', 'استكشاف الخدمات', 'تواصل مباشر']
  },
  {
    id: 'g2',
    num: '02',
    title: 'أريد عرض خدمتي وتحويل الزوار إلى طلبات',
    shortDesc: 'بناء مسار واضح يستقبل الطلبات ويربطها مباشرة بالتشغيل',
    goalTarget: 'عرض الخدمات وتحويل الزوار إلى طلبات مؤكدة',
    needs: [
      'عرض خدمات واضح ومفصل',
      'مسار طلب مباشر وسلس',
      'نموذج طلب تفاعلي وفعال',
      'تأكيد استلام فوري للعميل',
      'متابعة حالة الطلب برقم مرجعي',
      'ربط تشغيلي عند الحاجة'
    ],
    directions: ['موقع أعمال وخدمات + نظام طلبات + بوابة تشغيلية خفيفة'],
    sampleAppTitle: 'منصة نما للتطوير والخدمات الرقمية',
    sampleAppTag: 'مسار تحويل الزوار',
    flowSteps: ['عرض الخدمات', 'استقبال الطلب (#GS-241)', 'متابعة الطلب', 'تشغيل داخلي']
  },
  {
    id: 'g3',
    num: '03',
    title: 'أريد بيع منتجات أو خدمات رقمياً',
    shortDesc: 'تجربة شراء متكاملة تشمل الكتالوج والدفع وإدارة الطلبات',
    goalTarget: 'تمكين العملاء من الشراء الرقمي وتوسيع المبيعات',
    needs: [
      'كتالوج منتجات تفاعلي مع تصفية',
      'سلة تسوق وبوابة دفع آمنة',
      'إدارة مخزون وحالات الطلب',
      'إشعارات وتتبع الشحنات'
    ],
    directions: ['تجارة رقمية + محتوى وتجربة علامة + إدارة طلبات'],
    sampleAppTitle: 'متجر بيت وستايل للمستلزمات الفاخرة',
    sampleAppTag: 'تجارة وتجربة شراء',
    flowSteps: ['تصفح الكتالوج', 'إضافة للسلة', 'سداد إلكتروني', 'تتبع الشحنة']
  },
  {
    id: 'g4',
    num: '04',
    title: 'أريد تنظيم الحجوزات والمواعيد',
    shortDesc: 'جدولة آليّة تنظم مواعيد العملاء وتوفر وقت فريق العمل',
    goalTarget: 'تنظيم المواعيد وتسهيل حجز الخدمات للعملاء',
    needs: [
      'جدول أوقات تفاعلي ومحدث',
      'تأكيد الحجز الفوري والدفع',
      'تذكير آلي عبر الواتساب/الإيميل',
      'لوحة تحكم لإدارة المواعيد'
    ],
    directions: ['منصة حجوزات وخدمات + لوحة إدارة المواعيد'],
    sampleAppTitle: 'بوابة الحجوزات والمواعيد المتخصصة',
    sampleAppTag: 'جدولة مواعيد آليّة',
    flowSteps: ['اختيار الخدمة', 'تحديد الموعد', 'تأكيد الحجز', 'تذكير آلي']
  },
  {
    id: 'g5',
    num: '05',
    title: 'أريد عرض عقارات أو أصول وإدارة الاستفسارات',
    shortDesc: 'منصة لعرض الأصول مع تصفية دقيقة وجولات واستقبال المهتمين',
    goalTarget: 'عرض المحفظة العقارية وتسهيل التواصل مع المستثمرين',
    needs: [
      'دليل عقاري تفاعلي عالي الدقة',
      'بحث وتصفية حسب المساحة والسعر',
      'نماذج طلب معاينة واستفسار',
      'ربط الاستفسارات بفريق المبيعات'
    ],
    directions: ['منصة عقارات وأصول + بوابة استفسارات وتواصل'],
    sampleAppTitle: 'منصة الأصول والفرص العقارية',
    sampleAppTag: 'عرض العقارات والأصول',
    flowSteps: ['استكشاف العقارات', 'تصفية النتائج', 'طلب معاينة', 'متابعة المبيعات']
  },
  {
    id: 'g6',
    num: '06',
    title: 'أريد تنظيم الطلبات والعمليات الداخلية',
    shortDesc: 'بوابة تشغيلية لربط الفرق، متابعة المهمات، وإصدار التقارير',
    goalTarget: 'أتمتة العمليات الداخلية ورفع كفاءة الفريق',
    needs: [
      'لوحة قيادة ومؤشرات أداء',
      'إدارة الصلاحيات والأدوار',
      'تتبع حالات الطلبات والمراحل',
      'تقارير تفصيلية لحظية'
    ],
    directions: ['بوابة تشغيلية + نظام إدارة المهام والربط الداخلي'],
    sampleAppTitle: 'مركز التحكم والعمليات الداخلية',
    sampleAppTag: 'بوابة تشغيلية',
    flowSteps: ['استلام المهام', 'تعيين المسئول', 'تنفيذ المرحلة', 'إغلاق الطلب']
  },
  {
    id: 'g7',
    num: '07',
    title: 'أريد بناء بيئة معرفة أو تعليم',
    shortDesc: 'أكاديمية أو منصة توثيق تنظم الدروس والمسارات للمستفيدين',
    goalTarget: 'نشر وتنظيم المحتوى التعليمي والموثق بسهولة',
    needs: [
      'مسارات تعليمية مقسمة',
      'دعم الفيديوهات والملفات',
      'اختبارات وشهادات إنجاز',
      'متابعة تقدم المتعلم'
    ],
    directions: ['منصة تعليم ومعرفة + إدارة المسارات والمحتوى'],
    sampleAppTitle: 'أكاديمية المهارات والمعرفة الرقمية',
    sampleAppTag: 'بيئة تعليمية',
    flowSteps: ['تسجيل المتدرب', 'متابعة المسار', 'إجراء الاختبار', 'إصدار الشهادة']
  },
  {
    id: 'g8',
    num: '08',
    title: 'لدي احتياج مركب',
    shortDesc: 'دمج متطور بين عدة قدرات لتوفير حل فريد مخصص لعملك',
    goalTarget: 'بناء حل مخصص يجمع عدة أنظمة ليعمل كمنظومة واحدة',
    needs: [
      'دراسة وتحليل سياق العمل',
      'هندسة متكاملة للبنية والبيانات',
      'تكامل مرن بين العائلات',
      'تطوير وتوسيع مستمر'
    ],
    directions: ['منظومة رقمية مخصصة ذات قدرات متعددة متكاملة'],
    sampleAppTitle: 'منظومة الأعمال الشاملة والمتحولة',
    sampleAppTag: 'حل مركب مخصص',
    flowSteps: ['تحليل الاحتياج', 'تركيب القدرات', 'بناء المنظومة', 'تكامل تشغيلي']
  }
];

export function GoalBasedSection() {
  const [activeGoalId, setActiveGoalId] = useState<string>('g2');
  const activeGoal = GOALS.find((g) => g.id === activeGoalId) || GOALS[1];

  return (
    <section className="relative border-t border-mineral-300/60 bg-mineral-100/40 py-16 lg:py-24" id="goals">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-bronze-300 bg-bronze-50 px-3 py-1 text-xs font-semibold text-bronze-700">
            <span className="h-1.5 w-1.5 rounded-full bg-bronze-500" />
            03 — ابدأ من هدفك
          </div>
          <h2 className="mt-4 font-kufi text-2xl font-bold text-navy-900 sm:text-3xl lg:text-4xl leading-snug">
            لا تحتاج إلى معرفة اسم الحل، <br />
            ابدأ بالهدف الذي تريد الوصول إليه
          </h2>
          <p className="mt-3 text-sm text-navy-900/70 sm:text-base leading-relaxed">
            اختر ما تريد تحقيقه، وسنظهر كيف يمكن أن تتحول الحاجة إلى قدرات واتجاه وصيغة مناسبة.
          </p>
        </div>

        {/* Goal Selector Grid / Tabs 01 - 08 */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8 mb-10">
          {GOALS.map((goal) => {
            const isActive = goal.id === activeGoalId;
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => setActiveGoalId(goal.id)}
                className={`flex flex-col items-center justify-between rounded-xl p-3 text-center transition-all cursor-pointer border ${
                  isActive
                    ? 'border-navy-900 bg-navy-900 text-white shadow-md'
                    : 'border-mineral-300 bg-white text-navy-900 hover:border-mineral-400 hover:bg-mineral-50'
                }`}>
                <span className={`font-mono text-xs font-bold ${isActive ? 'text-bronze-300' : 'text-navy-900/40'}`}>
                  {goal.num}
                </span>
                <span className="mt-1.5 font-kufi text-[11px] font-bold leading-tight line-clamp-2">
                  {goal.title}
                </span>
                <span className={`mt-2 h-1 w-6 rounded-full ${isActive ? 'bg-bronze-400' : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>

        {/* Dynamic Interactive Visualizer Card for Active Goal */}
        <div className="rounded-2xl border border-mineral-300 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            
            {/* Goal Breakdown: Target, Needs, Directions (Left / Right depending on RTL) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Header Badge */}
              <div className="inline-flex items-center gap-2 rounded-lg bg-bronze-50 border border-bronze-300 px-3 py-1 text-xs font-bold text-bronze-800">
                <TargetIcon className="h-4 w-4 text-bronze-600" />
                الهدف المختار #{activeGoal.num}
              </div>

              <div>
                <h3 className="font-kufi text-xl font-bold text-navy-900">{activeGoal.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-navy-900/70">{activeGoal.shortDesc}</p>
              </div>

              {/* Goal Target Highlight */}
              <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-4">
                <p className="text-[11px] font-bold text-emerald-800">النتيجة المستهدفة:</p>
                <p className="mt-0.5 text-xs font-semibold text-navy-900">{activeGoal.goalTarget}</p>
              </div>

              {/* What the Solution Needs */}
              <div>
                <p className="font-kufi text-xs font-bold text-navy-900 mb-2">ما يحتاجه الحل لتكمله:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeGoal.needs.map((need) => (
                    <li key={need} className="flex items-start gap-2 rounded-lg bg-mineral-50 border border-mineral-200 p-2 text-xs text-navy-900/80">
                      <CheckCircle2Icon className="h-3.5 w-3.5 text-bronze-600 shrink-0 mt-0.5" />
                      <span>{need}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Direction */}
              <div>
                <p className="font-kufi text-xs font-bold text-navy-900 mb-1.5">الاتجاه الرقمي المحتمل:</p>
                <div className="flex flex-wrap gap-2">
                  {activeGoal.directions.map((dir) => (
                    <span key={dir} className="rounded-full bg-navy-900 px-3 py-1 text-xs font-bold text-white shadow-xs">
                      {dir}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Live Flow & Mockup Preview (Col Span 7) */}
            <div className="lg:col-span-7 rounded-xl border border-mineral-300 bg-mineral-50 p-6">
              <div className="flex items-center justify-between border-b border-mineral-200 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4 text-bronze-600" />
                  <span className="font-kufi text-xs font-bold text-navy-900">معاينة الرحلة والتطبيق</span>
                </div>
                <span className="rounded bg-navy-900 px-2 py-0.5 text-[10px] font-mono text-white">
                  {activeGoal.sampleAppTag}
                </span>
              </div>

              {/* Mockup Container */}
              <div className="rounded-xl border border-mineral-300 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MonitorIcon className="h-4 w-4 text-navy-900" />
                    <span className="font-kufi text-xs font-bold text-navy-900">{activeGoal.sampleAppTitle}</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold">● جاهز للإطلاق</span>
                </div>

                {/* Journey Flow Steps */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                  {activeGoal.flowSteps.map((step, idx) => (
                    <div key={step} className="rounded-lg border border-bronze-300/80 bg-bronze-50/60 p-2.5 text-center">
                      <span className="font-mono text-[9px] font-bold text-bronze-700">خطوة 0{idx + 1}</span>
                      <p className="mt-0.5 text-[11px] font-bold text-navy-900">{step}</p>
                    </div>
                  ))}
                </div>

                {/* Live Request Simulation Component */}
                <div className="rounded-lg border border-navy-900/20 bg-navy-900 text-white p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-bronze-300">الطلب النشط #GS-241</span>
                    <span className="rounded bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[9px] font-semibold text-emerald-300">
                      قيد التنفيذ والربط
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-mineral-200">
                    تم تحويل الهدف إلى مسار عمل فعلي بانتظار الاعتماد.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
