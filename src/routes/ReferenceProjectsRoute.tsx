import { ReferenceProjectsBody } from '../features/reference-projects';
import { RouteReadySignal } from './RouteReadySignal';
import './integratedPublicPages.css';

export default function ReferenceProjectsRoute() {
  return (
    <RouteReadySignal>
      <div className="integrated-public-page integrated-public-page--reference-projects">
        <ReferenceProjectsBody />
      </div>
    </RouteReadySignal>
  );
}
