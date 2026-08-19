import { useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  SolutionsExploration,
  type SolutionsExplorationState,
} from '../features/solutions';
import { createStartDiscoveryRouteStateFromExploration } from '../integration/solutionsToDiscovery';
import { RouteReadySignal } from './RouteReadySignal';
import './integratedPublicPages.css';

function readInitialSolutionsState(state: unknown): Partial<SolutionsExplorationState> | undefined {
  if (!state || typeof state !== 'object' || Array.isArray(state)) return undefined;
  const candidate = (state as { solutionsExploration?: unknown }).solutionsExploration;
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return undefined;
  return candidate as Partial<SolutionsExplorationState>;
}

export default function SolutionsRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialState = useRef(readInitialSolutionsState(location.state));

  const persistExplorationState = useCallback((state: SolutionsExplorationState) => {
    const currentHistoryState = window.history.state;
    const current = currentHistoryState && typeof currentHistoryState === 'object'
      ? currentHistoryState as Record<string, unknown>
      : {};
    const currentUserState = current.usr && typeof current.usr === 'object' && !Array.isArray(current.usr)
      ? current.usr as Record<string, unknown>
      : {};

    window.history.replaceState(
      {
        ...current,
        usr: {
          ...currentUserState,
          solutionsExploration: state,
        },
      },
      document.title,
    );
  }, []);

  return (
    <RouteReadySignal>
      <div
        className="integrated-public-page integrated-public-page--solutions"
        data-route-focus
        tabIndex={-1}
      >
        <SolutionsExploration
          initialState={initialState.current}
          onStateChange={persistExplorationState}
          onStartFamily={(familyId, origin) => {
            navigate('/start', {
              state: createStartDiscoveryRouteStateFromExploration(familyId, origin),
            });
          }}
          onDiscover={() => navigate('/start')}
        />
      </div>
    </RouteReadySignal>
  );
}
