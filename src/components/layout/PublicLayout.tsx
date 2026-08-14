import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from '../footer/Footer';
import { HeroNav } from '../hero/HeroNav';
import { RouteEffects } from './RouteEffects';

export function PublicLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="public-site-shell" dir="rtl">
      <RouteEffects />
      <a className="skip-link" href="#main-content">
        انتقل إلى المحتوى الرئيسي
      </a>
      <HeroNav />
      <main
        id="main-content"
        className={isHome ? 'public-site-main public-site-main--home' : 'public-site-main'}
        tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
