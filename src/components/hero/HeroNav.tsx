const NAV_LINK_ITEMS = [
  { label: 'حلولنا', href: '#families' },
  { label: 'منهجنا', href: '#process' },
  { label: 'أعمالنا', href: '#models' },
  { label: 'الموارد', href: '#goals' },
  { label: 'عن الشركة', href: '#quality' },
];

export function HeroNav() {
  return (
    <nav className="hero-nav relative z-30 flex items-center justify-between gap-4 px-6 py-6 sm:px-8 lg:px-12">
      <div className="flex items-center gap-3">
        <LogoMark />
        <div className="text-right leading-none">
          <p className="font-kufi text-[15px] font-semibold text-navy-900">General Solutions</p>
          <p className="mt-1 text-[11px] text-navy-900/45">حلول رقمية تُبنى بإتقان</p>
        </div>
      </div>

      <div className="hidden items-center gap-7 md:flex">
        <a href="#hero" className="relative text-[13px] font-semibold text-navy-900">
          الرئيسية
          <span className="absolute inset-x-0 -bottom-2 h-[2px] rounded-full bg-bronze-500" />
        </a>
        {NAV_LINK_ITEMS.map((item) => (
          <a key={item.label} href={item.href} className="text-[13px] text-navy-900/60 transition-colors hover:text-navy-900">
            {item.label}
          </a>
        ))}
      </div>

      <a
        href="#cta"
        className="rounded-full border border-navy-900/15 px-5 py-2 text-[13px] font-medium text-navy-900 transition-colors hover:bg-navy-900 hover:text-mineral-50">
        تواصل معنا
      </a>
    </nav>
  );
}

function LogoMark() {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
      <svg viewBox="0 0 40 40" className="h-10 w-10">
        <polygon points="20,2 35,11 35,29 20,38 5,29 5,11" fill="none" stroke="#12203D" strokeWidth="1.5" />
        <polygon points="20,9 29,14 29,26 20,31 11,26 11,14" fill="#AD7C46" opacity="0.14" />
      </svg>
      <span className="absolute font-kufi text-sm font-bold text-navy-900">S</span>
    </div>);

}
