import React, { useState } from 'react';
import { 
  ArrowLeftIcon, 
  ExternalLinkIcon, 
  XIcon, 
  CheckCircle2Icon, 
  ShoppingBagIcon,
  LayoutDashboardIcon,
  CalendarIcon,
  Building2Icon
} from 'lucide-react';

interface ModelItem {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  type: string;
  icon: React.ElementType;
  bgGradient: string;
  previewHeading: string;
  previewDesc: string;
  features: string[];
}

const MODELS: ModelItem[] = [
  {
    id: 'rp01',
    code: 'RP01',
    title: 'Bayt & Style',
    subtitle: 'تجارة رقمية وتجربة منزلية',
    type: 'تجارة رقمية فاخرة',
    icon: ShoppingBagIcon,
    bgGradient: 'from-amber-100/80 via-mineral-50 to-amber-50',
    previewHeading: 'تصميم يبيض براحتك البيت',
    previewDesc: 'تجربة تسوق منزلية راقية تعرض المفروشات والديكور والقطع الفاخرة بسهولة وشراء سريع.',
    features: ['كتالوج فاخر متجاوب', 'تصفية المنتجات حسب الغرفة', 'تجربة سداد سريعة', 'تخصيص الخامات والمقاسات']
  },
  {
    id: 'rp02',
    code: 'RP02',
    title: 'Enterprise Operations',
    subtitle: 'تشغيل مؤسسي وإدارة العمل',
    type: 'لوحة تشغيل بوابات',
    icon: LayoutDashboardIcon,
    bgGradient: 'from-blue-100/80 via-mineral-50 to-blue-50',
    previewHeading: 'لوحة قيادة وإدارة العمليات الفعالة',
    previewDesc: 'نظام تشغيل مؤسسي يتابع مؤشرات الأداء، المهام، سير العمليات وتدفق البيانات اللحظي.',
    features: ['مؤشرات أداء تفاعلية', 'إدارة الأدوار والصلاحيات', 'تتبع حالة الطلبات والموافقة', 'تصدير التقارير الإحصائية']
  },
  {
    id: 'rp03',
    code: 'RP03',
    title: 'Booking & Services',
    subtitle: 'خدمات وحجوزات ومواعيد',
    type: 'منصة حجوزات موعد',
    icon: CalendarIcon,
    bgGradient: 'from-emerald-100/80 via-mineral-50 to-emerald-50',
    previewHeading: 'احجز الخدمة التي تناسبك بأقل من دقيقة',
    previewDesc: 'منصة ذكية لحجز الخدمات والجدولة الآلية للمواعيد مع التذكير والتأكيد السريع.',
    features: ['جدولة زمنية دقيقة', 'اختيار الخدمة والمقدم', 'تأكيد حجز فوري', 'إشعارات وتذكير آلي']
  },
  {
    id: 'rp04',
    code: 'RP04',
    title: 'Real Estate & Assets',
    subtitle: 'عقارات وأصول واكتشاف',
    type: 'دليل عقاري تفاعلي',
    icon: Building2Icon,
    bgGradient: 'from-bronze-100/80 via-mineral-50 to-bronze-50',
    previewHeading: 'اكتشف عقارك القادم في أرقص المواقع',
    previewDesc: 'منصة متخصصة لعرض المحافظ العقارية والأصول مع تصفية خريطة دقيقة وتواصل مباشر.',
    features: ['بحث وتصفية بالخريطة', 'معاينة تفاعلية بالصور', 'تقديم طلب معينة', 'ربط فوري بالمبيعات']
  }
];

export function SelectedModelsSection() {
  const [activeModalModel, setActiveModalModel] = useState<ModelItem | null>(null);

  return (
    <section className="relative border-t border-mineral-300/60 bg-mineral-100/50 py-16 lg:py-24" id="models">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-bronze-300 bg-bronze-50 px-3 py-1 text-xs font-semibold text-bronze-700">
              <span className="h-1.5 w-1.5 rounded-full bg-bronze-500" />
              05 — نماذج مختارة
            </div>
            <h2 className="mt-4 font-kufi text-2xl font-bold leading-tight text-navy-900 sm:text-3xl lg:text-4xl">
              منتجات مختلفة، <br className="hidden sm:inline" />
              لكل منها منطقها وتجربتها
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-900/70">
              نماذج مستندة تظهر كيف يتغير التصميم عندما تتغير طبيعة المنتج واستخدامه.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveModalModel(MODELS[0])}
            className="inline-flex items-center gap-2 text-xs font-bold text-navy-900 hover:text-bronze-600 transition-colors group cursor-pointer">
            <span>عرض كل النماذج</span>
            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MODELS.map((model) => {
            const IconComp = model.icon;
            return (
              <div
                key={model.id}
                onClick={() => setActiveModalModel(model)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-mineral-300 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-bronze-500 hover:shadow-md flex flex-col justify-between">
                
                <div>
                  {/* Card Header Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-bronze-600 bg-bronze-50 border border-bronze-200 px-2.5 py-0.5 rounded-md">
                      {model.code}
                    </span>
                    <IconComp className="h-5 w-5 text-navy-900/50 group-hover:text-bronze-600 transition-colors" />
                  </div>

                  <h3 className="font-kufi text-base font-bold text-navy-900 group-hover:text-bronze-700 transition-colors">
                    {model.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-navy-900/60 font-medium">{model.subtitle}</p>

                  {/* Visual Preview Box */}
                  <div className={`mt-5 rounded-xl border border-mineral-200 bg-gradient-to-br ${model.bgGradient} p-4 min-h-[140px] flex flex-col justify-between`}>
                    <p className="font-kufi text-xs font-bold text-navy-900 leading-snug">
                      "{model.previewHeading}"
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="rounded bg-white/80 border border-black/5 px-2 py-0.5 text-[9px] font-semibold text-navy-900">
                        {model.type}
                      </span>
                      <ArrowLeftIcon className="h-3.5 w-3.5 text-navy-900/40 group-hover:text-navy-900 group-hover:-translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-mineral-200 flex items-center justify-between text-xs font-bold text-navy-900/70 group-hover:text-bronze-600">
                  <span>استكشف النموذج</span>
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Model Preview Modal */}
      {activeModalModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-mineral-300 bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setActiveModalModel(null)}
              className="absolute left-4 top-4 rounded-full bg-mineral-100 p-2 text-navy-900 hover:bg-mineral-200 cursor-pointer">
              <XIcon className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-sm font-bold text-bronze-600 bg-bronze-50 border border-bronze-200 px-3 py-1 rounded-md">
                {activeModalModel.code}
              </span>
              <span className="rounded-full bg-navy-900 text-white px-3 py-1 text-xs font-semibold">
                {activeModalModel.type}
              </span>
            </div>

            <h3 className="font-kufi text-xl font-bold text-navy-900">{activeModalModel.title}</h3>
            <p className="text-xs text-navy-900/60 font-medium">{activeModalModel.subtitle}</p>

            <div className="mt-5 rounded-xl border border-mineral-200 bg-mineral-50 p-5">
              <h4 className="font-kufi text-base font-bold text-navy-900">{activeModalModel.previewHeading}</h4>
              <p className="mt-1 text-xs text-navy-900/80 leading-relaxed">{activeModalModel.previewDesc}</p>
            </div>

            <div className="mt-6">
              <p className="font-kufi text-xs font-bold text-navy-900 mb-3">مميزات هذا النموذج البرمجي:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeModalModel.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 rounded-lg bg-mineral-50 border border-mineral-200 p-2.5 text-xs text-navy-900">
                    <CheckCircle2Icon className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-mineral-200">
              <button
                type="button"
                onClick={() => setActiveModalModel(null)}
                className="rounded-full bg-navy-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-navy-700 transition-colors cursor-pointer">
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
