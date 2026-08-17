import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  SolutionsExploration,
  type SolutionsExplorationStartOrigin,
} from '../../../../src/features/solutions';
import type { SolutionFamilyId } from '../../../../src/types/solutions';
import '../../../../src/index.css';
import './fixture.css';

type Transition =
  | { kind: 'family'; familyId: SolutionFamilyId; origin: SolutionsExplorationStartOrigin }
  | { kind: 'discover' };

export function Fixture() {
  const [transition, setTransition] = useState<Transition>();
  return (
    <>
      <SolutionsExploration
        onStartFamily={(familyId, origin) => setTransition({ kind: 'family', familyId, origin })}
        onDiscover={() => setTransition({ kind: 'discover' })}
      />
      <output
        id="fixture-transition"
        aria-label="حالة نقطة تكامل START"
        data-ready={transition ? 'true' : 'false'}
        data-kind={transition?.kind ?? 'none'}
        data-family={transition?.kind === 'family' ? transition.familyId : 'none'}
        data-origin={transition?.kind === 'family' ? transition.origin : 'none'}
        hidden
      />
    </>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Solutions fixture root element is unavailable');
createRoot(rootElement).render(<StrictMode><Fixture /></StrictMode>);
