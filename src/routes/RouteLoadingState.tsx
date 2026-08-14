import { useLocation } from 'react-router-dom';
import { ROUTE_TITLES } from './publicRoutes';
import './routeLoadingState.css';

export function RouteLoadingState() {
  const location = useLocation();
  const routeTitle = ROUTE_TITLES.get(location.pathname) ?? 'الصفحة';

  return (
    <div
      className="route-loading-state"
      data-route-loading="true"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy="true"
    >
      <span className="route-loading-state__signal" aria-hidden="true" />
      <span>جارٍ تحميل {routeTitle}…</span>
    </div>
  );
}
