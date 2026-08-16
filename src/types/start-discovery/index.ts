export const START_DISCOVERY_PREFILL_VERSION = 1 as const;

export type DiscoveryCertainty =
  | 'exploring'
  | 'direction'
  | 'configured'
  | 'detailed';

export type DiscoveryStepId =
  | 'certainty'
  | 'foundation'
  | 'people-outcomes'
  | 'configuration'
  | 'dependencies'
  | 'preferences'
  | 'summary'
  | 'complete';

export type DiscoverySummaryStatus =
  | 'known'
  | 'selected'
  | 'preferred'
  | 'dependent'
  | 'unknown';

export type DiscoveryCapabilityClassification =
  | 'CORE'
  | 'RECOMMENDED'
  | 'OPTIONAL'
  | 'CONDITIONAL'
  | 'CUSTOM';

export type DiscoveryCapabilityProvenance = 'SYSTEM_SEEDED' | 'USER_SELECTED';

export type DiscoveryDecisionOrigin =
  | 'SYSTEM_FINDER'
  | 'USER_DIRECT'
  | 'USER_COMPARE'
  | 'USER_OPEN_DIRECTION'
  | 'USER_ALTERNATIVE';

export type DiscoveryRecommendationResolution = 'decisive' | 'tied' | 'insufficient';

export interface DiscoveryCapabilitySelection {
  name: string;
  classification: DiscoveryCapabilityClassification;
  provenance: DiscoveryCapabilityProvenance;
}

export interface DiscoveryCapturedFacts {
  outcome?: string;
  activity?: string;
  audience?: string;
  complexity?: string;
  constraints?: string;
}

export interface DiscoveryPrefillSource {
  /** Adapter identifier such as `solutions-decision-workspace`. */
  adapter: string;
  /** Customer-facing label shown as the source of the carried context. */
  label?: string;
  /** Optional opaque reference for the integrating feature. */
  referenceId?: string;
}

/**
 * Stable, feature-agnostic contract for carrying context into discovery.
 * Integrators should map their own domain model to this shape rather than
 * importing implementation details from Start / Discovery.
 */
export interface StartDiscoveryPrefill {
  version: typeof START_DISCOVERY_PREFILL_VERSION;
  source?: DiscoveryPrefillSource;
  selectedProblem?: string;
  selectedOutcome?: string;
  recommendedFamily?: string;
  /** Stable family identity from the originating decision surface. */
  solutionFamilyId?: string;
  /** Whether the family was recommended by the system or chosen by the user. */
  decisionOrigin?: DiscoveryDecisionOrigin;
  /** Finder resolution carried as context when a Finder result was involved. */
  recommendationResolution?: DiscoveryRecommendationResolution;
  selectedCapabilities?: readonly string[];
  optionalCapabilities?: readonly string[];
  capabilitySelections?: readonly DiscoveryCapabilitySelection[];
  capturedFacts?: DiscoveryCapturedFacts;
  configurationPreference?: string;
  budgetPreference?: string;
  knownDependencies?: readonly string[];
  unknowns?: readonly string[];
  relevantReferenceContext?: string;
}

export interface StartDiscoveryDraft {
  certainty?: DiscoveryCertainty;
  objective: string;
  currentProblem: string;
  intendedUsers: string;
  domain: string;
  expectedOutcomes: string;
  importantWorkflows: string;
  recommendedFamily: string;
  solutionFamilyId: string;
  decisionOrigin?: DiscoveryDecisionOrigin;
  recommendationResolution?: DiscoveryRecommendationResolution;
  selectedCapabilities: string[];
  optionalCapabilities: string[];
  uncertainCapabilities: string[];
  capabilitySelections: DiscoveryCapabilitySelection[];
  capturedFacts?: DiscoveryCapturedFacts;
  /** System-carried experience direction; it is not customer adoption. */
  recommendedConfigurationPreference?: string;
  /** Customer-adopted experience direction only. */
  configurationPreference: string;
  existingSystems: string;
  integrations: string;
  dependencies: string[];
  dataConsiderations: string;
  contentConsiderations: string;
  budgetPreference: string;
  timingPreference: string;
  constraints: string;
  unknowns: string[];
  additionalNotes: string;
  referenceContext: string;
  prefillSource?: DiscoveryPrefillSource;
}

export interface DiscoverySummaryItem {
  label: string;
  values: string[];
}

export interface DiscoverySummaryGroup {
  status: DiscoverySummaryStatus;
  label: string;
  description: string;
  items: DiscoverySummaryItem[];
}

export interface DiscoverySummary {
  title: string;
  certaintyLabel: string;
  groups: DiscoverySummaryGroup[];
}

export interface StartDiscoveryBodyProps {
  /** Context supplied by a future decision workspace or another trusted adapter. */
  prefill?: StartDiscoveryPrefill;
  /** Lets an integrating surface bypass the certainty question when already known. */
  initialCertainty?: DiscoveryCertainty;
  className?: string;
  onDraftChange?: (draft: StartDiscoveryDraft) => void;
  /** Local completion callback only; this component performs no remote submission. */
  onLocalComplete?: (
    summary: DiscoverySummary,
    draft: StartDiscoveryDraft,
  ) => void;
}
