import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { ROUTE_TITLES } from '../../routes/publicRoutes';
import { ROUTE_READY_EVENT } from '../../routes/RouteReadySignal';

const scrollPositions = new Map<string, number>();

function getRouteFocusTarget() {
  const explicitTarget = document.querySelector<HTMLElement>('[data-route-focus]');
  if (explicitTarget) return explicitTarget;
  if (document.querySelector('[data-route-loading]')) return null;
  return document.getElementById('main-content');
}

function readHashTarget(hash: string) {
  if (!hash || hash === '#') return { isValid: false, target: null };

  try {
    const id = decodeURIComponent(hash.slice(1));
    return { isValid: Boolean(id), target: id ? document.getElementById(id) : null };
  } catch {
    return { isValid: false, target: null };
  }
}

export function RouteEffects() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const routeTitle = ROUTE_TITLES.get(location.pathname) ?? 'الصفحة غير موجودة';
  const restoredPosition = navigationType === 'POP'
    ? scrollPositions.get(location.key)
    : undefined;

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    const routeAddress = `${location.pathname}${location.search}${location.hash}`;
    const saveScrollPosition = () => {
      const currentAddress = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (currentAddress !== routeAddress) return;
      scrollPositions.set(location.key, window.scrollY);
    };

    window.addEventListener('scroll', saveScrollPosition, { passive: true });
    window.addEventListener('pagehide', saveScrollPosition);
    document.addEventListener('click', saveScrollPosition, true);

    return () => {
      window.removeEventListener('scroll', saveScrollPosition);
      window.removeEventListener('pagehide', saveScrollPosition);
      document.removeEventListener('click', saveScrollPosition, true);
    };
  }, [location.hash, location.key, location.pathname, location.search]);

  useEffect(() => {
    document.title = `${routeTitle} | General Solutions`;

    let observer: MutationObserver | undefined;
    let readinessFrame = 0;
    let focusComplete = false;
    let scrollComplete = false;
    const initialFocus = document.activeElement;
    let routeReady = !document.querySelector('[data-route-loading]');

    const applyReadyEffects = () => {
      const focusTarget = getRouteFocusTarget();
      const routeIsReady = routeReady && Boolean(focusTarget);

      if (!focusComplete && focusTarget && routeIsReady) {
        const activeElement = document.activeElement;
        const mainContent = document.getElementById('main-content');
        const userMovedFocus = activeElement instanceof HTMLElement
          && activeElement !== document.body
          && activeElement !== initialFocus
          && !mainContent?.contains(activeElement);
        focusComplete = true;
        if (!userMovedFocus) focusTarget.focus({ preventScroll: true });
      }

      if (!scrollComplete) {
        const hashTarget = readHashTarget(location.hash);
        if (hashTarget.isValid && hashTarget.target) {
          hashTarget.target.scrollIntoView({ block: 'start', behavior: 'auto' });
          scrollComplete = true;
        } else if (routeIsReady && navigationType === 'POP') {
          window.scrollTo({
            top: restoredPosition ?? 0,
            left: 0,
            behavior: 'auto',
          });
          scrollComplete = true;
        } else if (routeIsReady && hashTarget.isValid) {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          scrollComplete = true;
        } else if (!hashTarget.isValid && navigationType !== 'POP') {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          scrollComplete = true;
        }
      }

      if (focusComplete && scrollComplete) observer?.disconnect();
    };

    const scheduleReadyEffects = () => {
      window.cancelAnimationFrame(readinessFrame);
      readinessFrame = window.requestAnimationFrame(applyReadyEffects);
    };

    const handleRouteReady = (event: Event) => {
      if (event instanceof CustomEvent && event.detail === location.key) {
        routeReady = true;
        scheduleReadyEffects();
      }
    };

    window.addEventListener(ROUTE_READY_EVENT, handleRouteReady);
    scheduleReadyEffects();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      observer = new MutationObserver(scheduleReadyEffects);
      observer.observe(mainContent, { childList: true, subtree: true });
    }

    return () => {
      window.cancelAnimationFrame(readinessFrame);
      observer?.disconnect();
      window.removeEventListener(ROUTE_READY_EVENT, handleRouteReady);
    };
  }, [location.hash, location.key, navigationType, restoredPosition, routeTitle]);

  return (
    <span className="route-announcement" role="status" aria-live="polite" aria-atomic="true">
      {routeTitle}
    </span>
  );
}
