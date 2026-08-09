import type { StageCopy, StageId } from '../types/hero';

export const STAGE_ORDER: StageId[] = ['need', 'direction', 'build', 'launch'];

export const NAV_LINKS: string[] = ['حلولنا', 'منهجنا', 'أعمالنا', 'الموارد', 'عن الشركة'];

export const STAGE_COPY: Record<StageId, StageCopy> = {
  need: {
    id: 'need',
    eyebrow: 'المرحلة ٠١',
    tabLabel: 'الاحتياج',
    headline: [
    { text: 'نبدأ من ' },
    { text: 'واقع عملك', highlight: true },
    { text: '، لا من افتراضاتنا' }],

    description:
    'نفهم احتياجك الحقيقي قبل أي خط تصميم: أهدافك، جمهورك، وقيود عملك — لنبني على أساس واضح لا على تخمين.'
  },
  direction: {
    id: 'direction',
    eyebrow: 'المرحلة ٠٢',
    tabLabel: 'الاتجاه',
    headline: [
    { text: 'نحوّل الاحتياج إلى ' },
    { text: 'اتجاه واضح', highlight: true },
    { text: ' قبل البناء' }],

    description:
    'نترجم أهدافك إلى قدرات وهيكل معلوماتي ورحلات مستخدم مدروسة — بنية رقمية متماسكة تمهّد لتصميم بلا تخمين.'
  },
  build: {
    id: 'build',
    eyebrow: 'المرحلة ٠٣',
    tabLabel: 'التصميم والتطوير',
    headline: [
    { text: 'الهيكل يتحوّل إلى ' },
    { text: 'منتج رقمي فعلي', highlight: true }],

    description:
    'من الإطار السلكي إلى واجهات مصقولة ومكوّنات جاهزة، نصمم وننفّذ سطوح المنتج على كل مقاس بدقة واتساق.'
  },
  launch: {
    id: 'launch',
    eyebrow: 'المرحلة ٠٤',
    tabLabel: 'الإطلاق',
    headline: [
    { text: 'تجربة ' },
    { text: 'متصلة', highlight: true },
    { text: ' من الموقع إلى التشغيل' }],

    description:
    'طلب واحد يعبر من الموقع إلى التأكيد ثم إلى غرفة العمليات دون انقطاع، ويبقى قابلاً للتتبع في كل خطوة.'
  }
};

export const CTA_PRIMARY = 'ابدأ مشروعك';
export const CTA_SECONDARY = 'استكشف الحلول';