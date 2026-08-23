import { HowWeWorkBody } from '../features/how-we-work';
import { RouteReadySignal } from './RouteReadySignal';
import './integratedPublicPages.css';

export default function HowWeWorkRoute() {
  return (
    <RouteReadySignal>
      <div className="integrated-public-page integrated-public-page--how-we-work">
        <HowWeWorkBody />
      </div>
    </RouteReadySignal>
  );
}
