import React from 'react';
import { 
  SearchIcon, 
  CompassIcon, 
  Code2Icon, 
  RocketIcon,
  ArrowLeftIcon
} from 'lucide-react';

interface Step {
  num: string;
  title: string;
  desc: string;
  details: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  {
    num: '01',
    title: 'نفهم',
    desc: 'احتياج المشروع وسياقه الحقيقي',
    details: 'ندرُس أهداف العمل، الجمهور المستهدف، وتفاصيل العمليات الحالية لتحديد النطاق بدقة.',
    icon: SearchIcon
  },
  {
    num: '02',
    title: 'نحدد',
    desc: 'الاتجاه والبنية الرقمية المناسبة',
    details: 'نختار عائلات الحلول، نصمم الهيكل المعلوماتي (IA)، ونحدد خريطة طريق واضحة للبناء.',
    icon: CompassIcon
  },
  {
    num: '03',
    title: 'نبني',
    desc: 'التجربة والمنتج الفعلي القابل للاستخدام',
    details: 'نطوّر الواجهات والأنظمة التشغيلية بأعلى معايير الأداء والسرعة وتكامل البيانات.',
    icon: Code2Icon
  },
  {
    num: '04',
    title: 'نطلق',
    desc: 'ونتابع التحسين والربط التشغيلي',
    details: 'نطلق المنظومة، نربطها بالتشغيل المباشر، ونضمن المتابعة والتطوير المستمر.',
    icon: RocketIcon
  }
];

export function HowWeWorkSection() {
  return (
    <section className="relative border-t border-mineral-300/60 bg-mineral-50 py-16 lg:py-24" id="process">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-bronze-300 bg-bronze-50 px-3 py-1 text-xs font-semibold text-bronze-700">
            <span className="h-1.5 w-1.5 rounded-full bg-bronze-500" />
            06 — كيف نعمل
          </div>
          <h2 className="mt-4 font-kufi text-2xl font-bold leading-tight text-navy-900 sm:text-3xl lg:text-4xl">
            من فكرة واضحة، <br />
            إلى منتج جاهز للاستخدام
          </h2>
          <p className="mt-3 text-sm text-navy-900/70 sm:text-base leading-relaxed">
            نعمل بخطوات واضحة ونبني على مراحل، حتى يصبح الحل قابلاً للاستخدام والتطوير.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, idx) => {
            const IconComp = step.icon;
            return (
              <div
                key={step.num}
                className="group relative rounded-2xl border border-mineral-300 bg-white p-6 shadow-xs transition-all duration-300 hover:border-bronze-500 hover:shadow-md flex flex-col justify-between">
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xl font-bold text-bronze-600">
                      {step.num}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mineral-100 text-navy-900 group-hover:bg-navy-900 group-hover:text-bronze-300 transition-colors">
                      <IconComp className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="font-kufi text-xl font-bold text-navy-900">{step.title}</h3>
                  <p className="mt-1 text-xs font-bold text-bronze-700">{step.desc}</p>
                  <p className="mt-3 text-xs leading-relaxed text-navy-900/70">{step.details}</p>
                </div>

                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute -left-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowLeftIcon className="h-5 w-5 text-bronze-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
