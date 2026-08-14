import { useLocation } from 'react-router-dom';
import { StartDiscoveryBody } from '../features/start-discovery';
import { RouteReadySignal } from './RouteReadySignal';
import { readStartDiscoveryRouteState } from './startDiscoveryRouteState';
import './integratedPublicPages.css';

export default function StartDiscoveryRoute() {
  const location = useLocation();
  const prefill = readStartDiscoveryRouteState(location.state);

  return (
    <RouteReadySignal>
      <div className="integrated-public-page integrated-public-page--start">
        <StartDiscoveryBody
          prefill={prefill}
          initialCertainty={prefill ? 'configured' : undefined}
        />
      </div>
    </RouteReadySignal>
  );
}
