const NAV_LINK_ITEMS = [
  { label: 'حلولنا', href: '#solutions-universe' },
  { label: 'منهجنا', href: '#system-anatomy' },
  { label: 'أعمالنا', href: '#reference-proof' },
];

export function HeroNav() {
  return (
    <nav className="hero-nav" aria-label="التنقل الرئيسي">
      <a className="hero-nav__brand" href="#hero" aria-label="الحلول العامة — العودة إلى بداية الصفحة">
        <LogoMark />
        <span>
          <b dir="ltr">General Solutions</b>
          <small>حلول رقمية تُبنى بإتقان</small>
        </span>
      </a>

      <div className="hero-nav__links">
        {NAV_LINK_ITEMS.map((item) => (
          <a key={item.label} href={item.href}>
            {item.label}
          </a>
        ))}
        <a href="#hero" aria-current="page">الرئيسية</a>
      </div>

      <a
        href="#project-gateway"
        className="hero-nav__contact">
        ابدأ مشروعك
      </a>
    </nav>
  );
}

function LogoMark() {
  return (
    <svg className="hero-nav__mark" viewBox="0 0 40 48" aria-hidden="true">
      <path d="M8 43V6h22v37" />
      <path d="M13 39V11h12v28" />
      <path d="M4 43h30M30 6l5 5v27l-5 5" />
    </svg>
  );

}
