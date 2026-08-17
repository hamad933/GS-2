import { useNavigate } from 'react-router-dom';
import { SolutionsExploration } from '../features/solutions';
import { createStartDiscoveryRouteStateFromExploration } from '../integration/solutionsToDiscovery';
import { RouteReadySignal } from './RouteReadySignal';
import './integratedPublicPages.css';

export default function SolutionsRoute() {
  const navigate = useNavigate();

  return (
    <RouteReadySignal>
      <div className="integrated-public-page integrated-public-page--solutions">
        <SolutionsExploration
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
