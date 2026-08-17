import {
  budgetPreferences,
  configurationDirections,
  familyById,
  getFactLabel,
} from '../data/solutions';
import {
  START_DISCOVERY_PREFILL_VERSION,
  type DiscoveryCapabilitySelection,
  type DiscoveryCapturedFacts,
  type DiscoveryDecisionOrigin,
  type StartDiscoveryPrefill,
} from '../types/start-discovery';
import type {
  DecisionSnapshot,
  EvidenceState,
  SolutionFamilyId,
} from '../types/solutions';

export interface StartDiscoveryRouteState {
  discoveryPrefill: StartDiscoveryPrefill;
}

export type SolutionsExplorationStartOrigin = Extract<
  DiscoveryDecisionOrigin,
  'USER_DIRECT' | 'USER_COMPARE'
>;

const evidenceLabels: Record<EvidenceState, string> = {
  VERIFIED_IMPLEMENTATION: 'تنفيذ متحقق',
  REVIEWED_VISUAL_EVIDENCE: 'دليل بصري مراجع',
  BOUNDED_DEMO: 'عرض تجريبي محدود',
  REFERENCE_ONLY: 'سياق مرجعي للاستئناس فقط',
  PLANNED: 'مخطط',
  NOT_AVAILABLE: 'الدليل غير متاح',
  REJECTED: 'غير معتمد',
};

function unique(values: readonly string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function mapBudgetPreference(snapshot: DecisionSnapshot) {
  const preference = snapshot.budgetPreference === 'unknown'
    ? undefined
    : budgetPreferences.find((item) => item.id === snapshot.budgetPreference)?.title;
  const suppliedRange = snapshot.budgetRange.trim();
  if (preference && suppliedRange) return `${preference} · النطاق الذي ذكره المستخدم: ${suppliedRange}`;
  if (suppliedRange) return `النطاق الذي ذكره المستخدم: ${suppliedRange}`;
  return preference;
}

function mapReferenceContext(snapshot: DecisionSnapshot) {
  const reference = familyById[snapshot.recommendedFamily].reference;
  if (!reference.code) return undefined;
  return `${reference.code} — ${reference.title}. ${reference.note} حالة السياق: ${evidenceLabels[reference.evidenceState]}.`;
}

function mapCapturedFacts(snapshot: DecisionSnapshot): DiscoveryCapturedFacts | undefined {
  const capturedFacts: DiscoveryCapturedFacts = {};
  for (const key of ['outcome', 'activity', 'audience', 'complexity'] as const) {
    const label = getFactLabel(key, snapshot.facts[key]);
    if (label) capturedFacts[key] = label;
  }
  const constraints = snapshot.facts.constraints.trim();
  if (constraints) capturedFacts.constraints = constraints;
  return Object.keys(capturedFacts).length ? capturedFacts : undefined;
}

function mapCapabilitySelections(snapshot: DecisionSnapshot): DiscoveryCapabilitySelection[] {
  if (snapshot.capabilitySelections?.length) return snapshot.capabilitySelections.map((selection) => ({ ...selection }));
  const family = familyById[snapshot.recommendedFamily];
  return unique(snapshot.selectedCapabilities).map((name) => ({
    name,
    classification: family.capabilities.find((capability) => capability.name === name)?.classification ?? 'CUSTOM',
    provenance: 'SYSTEM_SEEDED',
  }));
}

/** Compatibility mapper for the superseded decision-workspace contract. */
export function mapSolutionsDecisionToDiscovery(snapshot: DecisionSnapshot): StartDiscoveryPrefill {
  const family = familyById[snapshot.recommendedFamily];
  const capabilitySelections = mapCapabilitySelections(snapshot);
  const userSelections = capabilitySelections.filter((selection) => selection.provenance === 'USER_SELECTED');
  const selectedCapabilities = unique(userSelections.filter((selection) => selection.classification !== 'OPTIONAL').map((selection) => selection.name));
  const optionalCapabilities = unique(userSelections.filter((selection) => selection.classification === 'OPTIONAL').map((selection) => selection.name));
  return {
    version: START_DISCOVERY_PREFILL_VERSION,
    source: { adapter: 'solutions-decision-workspace', label: 'ملخص قرار الحلول' },
    recommendedFamily: family.title,
    solutionFamilyId: family.id,
    decisionOrigin: snapshot.decisionOrigin,
    recommendationResolution: snapshot.recommendationResolution,
    selectedCapabilities,
    optionalCapabilities,
    capabilitySelections,
    capturedFacts: mapCapturedFacts(snapshot),
    configurationPreference: configurationDirections.find((direction) => direction.id === snapshot.configuration)?.title,
    budgetPreference: mapBudgetPreference(snapshot),
    knownDependencies: unique(snapshot.confirmedDependencies),
    unknowns: unique(snapshot.unknowns),
    relevantReferenceContext: mapReferenceContext(snapshot),
  };
}

/** Final SOLUTIONS exploration carries only context the customer actually chose. */
export function mapSolutionsExplorationToDiscovery(
  familyId: SolutionFamilyId,
  decisionOrigin: SolutionsExplorationStartOrigin = 'USER_DIRECT',
): StartDiscoveryPrefill {
  return {
    version: START_DISCOVERY_PREFILL_VERSION,
    source: {
      adapter: 'solutions-exploration',
      label: 'استكشاف الحلول',
      referenceId: familyId,
    },
    solutionFamilyId: familyId,
    decisionOrigin,
  };
}

export function createStartDiscoveryRouteStateFromExploration(
  familyId: SolutionFamilyId,
  decisionOrigin: SolutionsExplorationStartOrigin = 'USER_DIRECT',
): StartDiscoveryRouteState {
  return { discoveryPrefill: mapSolutionsExplorationToDiscovery(familyId, decisionOrigin) };
}

export function createStartDiscoveryRouteState(snapshot: DecisionSnapshot): StartDiscoveryRouteState {
  return { discoveryPrefill: mapSolutionsDecisionToDiscovery(snapshot) };
}

export { readStartDiscoveryRouteState } from '../routes/startDiscoveryRouteState';
