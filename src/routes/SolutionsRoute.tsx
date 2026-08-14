import { useNavigate } from 'react-router-dom';
import { SolutionsDecisionWorkspace } from '../features/solutions';
import { createStartDiscoveryRouteState } from '../integration/solutionsToDiscovery';
import { RouteReadySignal } from './RouteReadySignal';
import './integratedPublicPages.css';

export default function SolutionsRoute() {
  const navigate = useNavigate();

  return (
    <RouteReadySignal>
      <div className="integrated-public-page integrated-public-page--solutions">
        <SolutionsDecisionWorkspace
          onStartDiscovery={(snapshot) => {
            navigate('/start', { state: createStartDiscoveryRouteState(snapshot) });
          }}
        />
      </div>
    </RouteReadySignal>
  );
}
