import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SolutionsDecisionWorkspace } from '../../../../src/features/solutions';
import type { DecisionSnapshot } from '../../../../src/types/solutions';
import '../../../../src/index.css';
import './fixture.css';

export function Fixture() {
  const [preparedDecision, setPreparedDecision] = useState<DecisionSnapshot>();

  return (
    <>
      <SolutionsDecisionWorkspace onStartDiscovery={setPreparedDecision} />
      <output
        id="fixture-transition"
        aria-label="حالة نقطة تكامل Discovery"
        data-ready={preparedDecision ? 'true' : 'false'}
        hidden
      >
        {preparedDecision ? preparedDecision.recommendedFamily : 'not-ready'}
      </output>
    </>
  );
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Solutions fixture root element is unavailable');
}

createRoot(rootElement).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
