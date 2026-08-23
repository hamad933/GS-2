export interface PublicNavItem {
  path: string;
  label: string;
}

export interface PublicPageContent extends PublicNavItem {
  eyebrow: string;
  intro: string;
  signal: string;
}

export const PRIMARY_NAV_ITEMS: PublicNavItem[] = [
  { path: '/', label: 'الرئيسية' },
  { path: '/solutions', label: 'الحلول' },
  { path: '/reference-projects', label: 'المشاريع المرجعية' },
  { path: '/how-we-work', label: 'كيف نعمل' },
];

export const FOOTER_NAV_ITEMS: PublicNavItem[] = [
  ...PRIMARY_NAV_ITEMS,
  { path: '/start', label: 'ابدأ اختيارك' },
];

export const PUBLIC_PAGE_CONTENT: PublicPageContent[] = [
  {
    path: '/solutions',
    label: 'الحلول',
    eyebrow: 'مسارات رقمية مصممة بوضوح',
    intro: 'مساحة الحلول التي تتشكّل حول طبيعة الاحتياج، لا حول قالب جاهز.',
    signal: 'SOLUTIONS / 01',
  },
  {
    path: '/reference-projects',
    label: 'المشاريع المرجعية',
    eyebrow: 'مرجع واضح لكل اتجاه',
    intro: 'مساحة مخصصة لقراءة المشاريع المرجعية ضمن سياقها الصحيح.',
    signal: 'REFERENCE / 02',
  },
  {
    path: '/how-we-work',
    label: 'كيف نعمل',
    eyebrow: 'من الاحتياج إلى نظام متماسك',
    intro: 'مساحة توضح مسار العمل من فهم الاحتياج إلى بناء الاتجاه المناسب.',
    signal: 'METHOD / 03',
  },
  {
    path: '/start',
    label: 'ابدأ اختيارك',
    eyebrow: 'بداية محددة، واختيار أوضح',
    intro: 'نقطة البداية لاختيار المسار الأقرب إلى احتياجك.',
    signal: 'START / 04',
  },
];

export const ROUTE_TITLES = new Map<string, string>([
  ['/', 'الرئيسية'],
  ...PUBLIC_PAGE_CONTENT.map((page) => [page.path, page.label] as const),
]);
