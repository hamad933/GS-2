import { useEffect, useId, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { PRIMARY_NAV_ITEMS } from '../../routes/publicRoutes';
import './HeroNav.css';

export function HeroNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const isStartRoute = location.pathname === '/start';

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  return (
    <nav className="hero-nav" aria-label="التنقل الرئيسي">
      <Link className="hero-nav__brand" to="/" aria-label="الحلول العامة — الانتقال إلى الرئيسية">
        <LogoMark />
        <span>
          <b dir="ltr">General Solutions</b>
          <small>حلول رقمية تُبنى بإتقان</small>
        </span>
      </Link>

      <div className="hero-nav__links">
        {PRIMARY_NAV_ITEMS.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}>
            {item.label}
          </NavLink>
        ))}
      </div>

      {isStartRoute ? (
        <span className="hero-nav__contact" aria-current="page">
          ابدأ اختيارك
        </span>
      ) : (
        <NavLink
          to="/start"
          className="hero-nav__contact">
          ابدأ اختيارك
        </NavLink>
      )}

      <button
        ref={menuButtonRef}
        type="button"
        className="hero-nav__menu-toggle"
        aria-label={isMenuOpen ? 'إغلاق قائمة التنقل' : 'فتح قائمة التنقل'}
        aria-controls={menuId}
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}>
        {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>

      {isMenuOpen && (
        <div className="hero-nav__mobile-panel" id={menuId}>
          {PRIMARY_NAV_ITEMS.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'}>
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
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
