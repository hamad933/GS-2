import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { ROUTE_TITLES } from '../../routes/publicRoutes';

const scrollPositions = new Map<string, number>();

export function RouteEffects() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const routeTitle = ROUTE_TITLES.get(location.pathname) ?? 'الصفحة غير موجودة';

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    document.title = `${routeTitle} | General Solutions`;

    const frame = window.requestAnimationFrame(() => {
      const focusTarget = document.querySelector<HTMLElement>('[data-route-focus]')
        ?? document.getElementById('main-content');
      focusTarget?.focus({ preventScroll: true });

      if (location.hash) {
        const hashTarget = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        hashTarget?.scrollIntoView({ block: 'start', behavior: 'auto' });
        return;
      }

      const restoredPosition = navigationType === 'POP'
        ? scrollPositions.get(location.key)
        : undefined;
      window.scrollTo({ top: restoredPosition ?? 0, left: 0, behavior: 'auto' });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      scrollPositions.set(location.key, window.scrollY);
    };
  }, [location.hash, location.key, navigationType, routeTitle]);

  return (
    <span className="route-announcement" role="status" aria-live="polite" aria-atomic="true">
      {routeTitle}
    </span>
  );
}
