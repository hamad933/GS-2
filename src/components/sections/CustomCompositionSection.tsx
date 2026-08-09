import React, { useState } from 'react';
import { 
  ArrowLeftIcon, 
  PuzzleIcon
} from 'lucide-react';

interface Archetype {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  components: string[];
  outputs: string[];
  details: string;
  diagramTitle: string;
}

const ARCHETYPES: Archetype[] = [
  {
    id: 'arch1',
    num: '01',
    title: 'منصة خدمات ونمو',
    subtitle: 'عرض الخدمات + استقبال الطلبات + متابعة التشغيل',
    components: ['موقع أعمال وخدمات', 'نظام طلبات', 'بوابة تشغيلية'],
    outputs: ['عرض الخدمات', 'استقبال الطلب', 'متابعة الطلب', 'تشغيل داخلي'],
    details: 'تركيبة مثالية للشركات والمؤسسات التي تقدم خدمات متخصصة وتريد تحويل الاستفسارات إلى طلبات تنفيذ مع تتبع كامل للحالات.',
    diagramTitle: 'بنية متماسكة تجمع العرض، الاستقبال، والتشغيل'
  },
  {
    id: 'arch2',
    num: '02',
    title: 'تجربة تجارة وعلامة متكاملة',
    subtitle: 'تجارة رقمية + محتوى وتجربة علامة + إدارة طلبات',
    components: ['متجر رقمي فاخر', 'محتوى العلامة', 'إدارة المخزون والشحن'],
    outputs: ['تصفح الكتالوج', 'السداد الإلكتروني', 'تأكيد الطلب', 'التجهيز والشحن'],
    details: 'تركيبة مخصصة للعلامات التجارية الراغبة في تقديم تجربة تسوق استثنائية تعكس قيمة المنتجات وترتبط مباشرة بالتشغيل.',
    diagramTitle: 'تكامل بين تجربة التسوق وإدارة الطلبات المخزنية'
  },
  {
    id: 'arch3',
    num: '03',
    title: 'منصة عقارية مترابطة',
    subtitle: 'عقارات وأصول + بحث واستفسارات + بوابة تشغيلية',
    components: ['دليل عقاري تفاعلي', 'تصفية ومحرك بحث', 'إدارة المبيعات والعملاء'],
    outputs: ['اكتشاف العقار', 'طلب معاينة', 'متابعة الاستفسار', 'إغلاق الصفقة'],
    details: 'تركيبة مخصصة لشركات العقار والمطورين لعرض المشاريع وإدارة استفسارات المشترين بفاعلية ووضوح.',
    diagramTitle: 'ربط المحفظة العقارية بغرفة مبيعات واستفسارات آلية'
  },
  {
    id: 'arch4',
    num: '04',
    title: 'تجربة خدمة وحجز',
    subtitle: 'موقع أعمال + حجوزات وخدمات + متابعة تشغيلية',
    components: ['واجهة التعريف بالخدمة', 'محرك المواعيد الآلي', 'لوحة تحكم الفريق'],
    outputs: ['اختيار الخدمة', 'تحديد الوقت', 'التأكيد المباشر', 'تنفيذ الخدمة'],
    details: 'تركيبة للشركات والجهات المهنية التي تعتمد على المواعيد وجدول الأعمال وترغب في أتمتة العملية.',
    diagramTitle: 'جدولة آليّة للمواعيد مع ربط مباشر بالفريق والمتابعة'
  }
];

export function CustomCompositionSection() {
  const [selectedArchId, setSelectedArchId] = useState<string>('arch1');
  const activeArch = ARCHETYPES.find((a) => a.id === selectedArchId) || ARCHETYPES[0];

  return (
    <section className="relative border-t border-mineral-300/60 bg-mineral-50 py-16 lg:py-24" id="composition">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="mb-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-bronze-300 bg-bronze-50 px-3 py-1 text-xs font-semibold text-bronze-700">
            <span className="h-1.5 w-1.5 rounded-full bg-bronze-500" />
            04 — ماذا يمكن أن نبني لك؟
          </div>
          <h2 className="mt-4 font-kufi text-2xl font-bold leading-tight text-navy-900 sm:text-3xl lg:text-4xl">
            الحل الحقيقي لا يبدأ من قالب، <br />
            بل من التركيبة التي يحتاجها عملك
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-900/70 sm:text-base">
            قد يجمع المشروع بين موقع أعمال ونظام طلبات، أو بين التجارة والمحتوى، أو بين العقارات والتشغيل. نركّب القدرات المناسبة لتعمل كتجربة واحدة، لا كأدوات منفصلة.
          </p>
        </div>

        {/* Main Composition Layout */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          
          {/* Left Side: Interactive Blueprint Diagram (Col 7) */}
          <div className="lg:col-span-7 rounded-2xl border border-mineral-300 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between border-b border-mineral-200 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <PuzzleIcon className="h-5 w-5 text-bronze-600" />
                <span className="font-kufi text-base font-bold text-navy-900">{activeArch.diagramTitle}</span>
              </div>
              <span className="rounded bg-bronze-50 border border-bronze-300 px-2.5 py-1 text-xs font-bold text-bronze-800">
                تركيبة #{activeArch.num}
              </span>
            </div>

            {/* Modular Components Pills ("يتكون من") */}
            <div className="mb-6">
              <p className="font-kufi text-xs font-bold text-navy-900/70 mb-2">تتكون من القدرات الآتية:</p>
              <div className="flex flex-wrap items-center gap-2">
                {activeArch.components.map((comp, idx) => (
                  <React.Fragment key={comp}>
                    <span className="rounded-xl border border-navy-900/20 bg-mineral-50 px-3.5 py-2 text-xs font-bold text-navy-900 shadow-xs">
                      {comp}
                    </span>
                    {idx < activeArch.components.length - 1 && (
                      <span className="font-bold text-bronze-500 text-sm">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Connected Journey Flow ("ينتج عنه") */}
            <div className="rounded-xl border border-bronze-300/80 bg-bronze-50/50 p-5 mb-6">
              <p className="font-kufi text-xs font-bold text-bronze-800 mb-3">ينتج عنها مسار مترابط:</p>
              <div className="flex flex-wrap items-center gap-2">
                {activeArch.outputs.map((out, idx) => (
                  <React.Fragment key={out}>
                    <span className="rounded-lg bg-white border border-bronze-300 px-3 py-1.5 text-xs font-semibold text-navy-900">
                      {out}
                    </span>
                    {idx < activeArch.outputs.length - 1 && (
                      <ArrowLeftIcon className="h-4 w-4 text-bronze-500 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Architecture Node Visualizer */}
            <div className="rounded-xl border border-navy-900/10 bg-navy-900 p-5 text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <span className="font-kufi text-xs font-bold text-bronze-300">نركّب القدرات حول المشروع، لا المشروع حول قالب جاهز</span>
                <span className="text-[10px] text-emerald-400 font-mono">100% متماسك</span>
              </div>
              <p className="text-xs text-mineral-200/80 leading-relaxed">
                {activeArch.details}
              </p>
            </div>
          </div>

          {/* Right Side: Interactive Archetype Selector List (Col 5) */}
          <div className="lg:col-span-5 space-y-3">
            <p className="font-kufi text-xs font-bold text-navy-900/60 mb-2">اختر صيغة التركيبة لعرض تفاصيلها:</p>
            
            {ARCHETYPES.map((arch) => {
              const isSelected = arch.id === selectedArchId;
              return (
                <button
                  key={arch.id}
                  type="button"
                  onClick={() => setSelectedArchId(arch.id)}
                  className={`w-full text-right p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-bronze-500 bg-white shadow-md ring-1 ring-bronze-500/30'
                      : 'border-mineral-300 bg-white/70 hover:bg-white hover:border-mineral-400'
                  }`}>
                  <div className="flex items-center gap-3.5">
                    <span className={`font-mono text-base font-bold ${isSelected ? 'text-bronze-600' : 'text-navy-900/40'}`}>
                      {arch.num}
                    </span>
                    <div>
                      <h3 className={`font-kufi text-base font-bold ${isSelected ? 'text-navy-900' : 'text-navy-900/80'}`}>
                        {arch.title}
                      </h3>
                      <p className="text-xs text-navy-900/60 mt-0.5">{arch.subtitle}</p>
                    </div>
                  </div>

                  <ArrowLeftIcon className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? 'text-bronze-600 translate-x-1' : 'text-mineral-400'}`} />
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
