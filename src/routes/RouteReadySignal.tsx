import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export const ROUTE_READY_EVENT = 'gs:public-route-ready';

export function RouteReadySignal({ children }: { children: ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(ROUTE_READY_EVENT, { detail: location.key }));
  }, [location.key]);

  return children;
}
