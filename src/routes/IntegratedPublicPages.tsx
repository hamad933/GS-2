import { useLocation, useNavigate } from 'react-router-dom';
import { HowWeWorkBody } from '../features/how-we-work';
import { ReferenceProjectsBody } from '../features/reference-projects';
import { SolutionsDecisionWorkspace } from '../features/solutions';
import { StartDiscoveryBody } from '../features/start-discovery';
import {
  createStartDiscoveryRouteState,
  readStartDiscoveryRouteState,
} from '../integration/solutionsToDiscovery';
import './integratedPublicPages.css';

export function SolutionsPage() {
  const navigate = useNavigate();

  return (
    <div className="integrated-public-page integrated-public-page--solutions">
      <SolutionsDecisionWorkspace
        onStartDiscovery={(snapshot) => {
          navigate('/start', { state: createStartDiscoveryRouteState(snapshot) });
        }}
      />
    </div>
  );
}

export function ReferenceProjectsPage() {
  return (
    <div className="integrated-public-page integrated-public-page--reference-projects">
      <ReferenceProjectsBody />
    </div>
  );
}

export function HowWeWorkPage() {
  return (
    <div className="integrated-public-page integrated-public-page--how-we-work">
      <HowWeWorkBody />
    </div>
  );
}

export function StartDiscoveryPage() {
  const location = useLocation();
  const prefill = readStartDiscoveryRouteState(location.state);

  return (
    <div className="integrated-public-page integrated-public-page--start">
      <StartDiscoveryBody
        prefill={prefill}
        initialCertainty={prefill ? 'configured' : undefined}
      />
    </div>
  );
}
