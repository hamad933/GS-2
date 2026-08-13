import { MailIcon } from 'lucide-react';

export function Footer() {
  return (
    <footer className="gs-footer" dir="rtl">
      <div className="gs-footer__inner">
        <div className="gs-footer__brand">
          <span className="gs-footer__mark" aria-hidden="true"><i /><i /></span>
          <div>
            <b dir="ltr">General Solutions</b>
            <small>حلول رقمية تُبنى بإتقان</small>
          </div>
        </div>

        <p className="gs-footer__intro">
          نصمّم ونطوّر حلولًا وتجارب رقمية تتشكّل حول احتياجات الأعمال.
        </p>

        <nav className="gs-footer__links" aria-label="روابط أسفل الصفحة">
          <a href="#hero">الرئيسية</a>
          <a href="#solutions-universe">الحلول</a>
          <a href="#reference-proof">الأعمال</a>
          <a href="#system-anatomy">منهجنا</a>
          <a href="#project-gateway">ابدأ مشروعك</a>
        </nav>

        <a
          href="mailto:hello@generalsolutions.co"
          className="gs-footer__email">
          <MailIcon aria-hidden="true" />
          <span dir="ltr">hello@generalsolutions.co</span>
        </a>

        <div className="gs-footer__base">
          <span>© 2026 General Solutions</span>
          <span>جميع الحقوق محفوظة.</span>
        </div>
      </div>
    </footer>
  );
}
