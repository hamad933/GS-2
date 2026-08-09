import React from 'react';
import { 
  MousePointerClickIcon, 
  Code2Icon, 
  GaugeIcon, 
  ShieldCheckIcon, 
  NetworkIcon 
} from 'lucide-react';

interface QualityPillar {
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

const PILLARS: QualityPillar[] = [
  {
    title: 'تجربة واضحة',
    subtitle: 'تصميم سهل الاستخدام ويقود للإجراء',
    icon: MousePointerClickIcon
  },
  {
    title: 'تطوير متين',
    subtitle: 'بنية قابلة للصيانة والتوسع المستقبلي',
    icon: Code2Icon
  },
  {
    title: 'أداء سريع',
    subtitle: 'تجربة خفيفة وسريعة الاستجابة عبر جميع الأجهزة',
    icon: GaugeIcon
  },
  {
    title: 'أمان واعٍ',
    subtitle: 'ممارسات مناسبة لحماية بيانات المنتج والعملاء',
    icon: ShieldCheckIcon
  },
  {
    title: 'تكامل مرن',
    subtitle: 'ربط الخدمات والأنظمة والأنظمة الخلفية عند الحاجة',
    icon: NetworkIcon
  }
];

export function QualitySection() {
  return (
    <section className="relative border-t border-mineral-300/60 bg-mineral-100/40 py-16 lg:py-24" id="quality">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-bronze-300 bg-bronze-50 px-3 py-1 text-xs font-semibold text-bronze-700">
            <span className="h-1.5 w-1.5 rounded-full bg-bronze-500" />
            07 — نبني للجودة
          </div>
          <h2 className="mt-4 font-kufi text-2xl font-bold leading-tight text-navy-900 sm:text-3xl lg:text-4xl">
            جودة المنتج ليست مرحلة أخيرة، <br />
            بل جزء من طريقة البناء
          </h2>
          <p className="mt-3 text-sm text-navy-900/70 sm:text-base leading-relaxed">
            نوازن بين التجربة والتنفيذ والأداء والأمان والتكامل، حتى يكون المنتج واضحاً اليوم وقابلاً للتطور لاحقاً.
          </p>
        </div>

        {/* 5 Pillars Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PILLARS.map((pillar) => {
            const IconComp = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-2xl border border-mineral-300 bg-white p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:border-bronze-500 hover:shadow-sm flex flex-col items-center">
                
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mineral-100 text-navy-900 mb-4">
                  <IconComp className="h-6 w-6 text-bronze-600" />
                </div>

                <h3 className="font-kufi text-base font-bold text-navy-900">{pillar.title}</h3>
                <p className="mt-1.5 text-xs text-navy-900/70 leading-relaxed">{pillar.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
