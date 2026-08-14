import {
  budgetPreferences,
  configurationDirections,
  familyById,
  getFactLabel,
} from '../data/solutions';
import {
  START_DISCOVERY_PREFILL_VERSION,
  type StartDiscoveryPrefill,
} from '../types/start-discovery';
import type { DecisionSnapshot } from '../types/solutions';

export interface StartDiscoveryRouteState {
  discoveryPrefill: StartDiscoveryPrefill;
}

function unique(values: readonly string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function mapBudgetPreference(snapshot: DecisionSnapshot) {
  const preference = snapshot.budgetPreference === 'unknown'
    ? undefined
    : budgetPreferences.find((item) => item.id === snapshot.budgetPreference)?.title;
  const suppliedRange = snapshot.budgetRange.trim();

  if (preference && suppliedRange) {
    return `${preference} · النطاق الذي ذكره المستخدم: ${suppliedRange}`;
  }
  if (suppliedRange) return `النطاق الذي ذكره المستخدم: ${suppliedRange}`;
  return preference;
}

function mapReferenceContext(snapshot: DecisionSnapshot) {
  const reference = familyById[snapshot.recommendedFamily].reference;
  if (!reference.code) return undefined;

  return `${reference.code} — ${reference.title}. ${reference.note} حالة المرجع: ${reference.evidenceState}.`;
}

/**
 * Translates the Solutions decision contract into Start / Discovery v1.
 * Fields without a truthful v1 destination remain intentionally unmapped and
 * are recorded in the W05 execution handoff instead of being relabelled.
 */
export function mapSolutionsDecisionToDiscovery(
  snapshot: DecisionSnapshot,
): StartDiscoveryPrefill {
  const family = familyById[snapshot.recommendedFamily];
  const optionalNames = new Set(
    family.capabilities
      .filter((capability) => capability.classification === 'OPTIONAL')
      .map((capability) => capability.name),
  );
  const selectedCapabilities = unique(
    snapshot.selectedCapabilities.filter((capability) => !optionalNames.has(capability)),
  );
  const optionalCapabilities = unique(
    snapshot.selectedCapabilities.filter((capability) => optionalNames.has(capability)),
  );
  const selectedOutcome = snapshot.facts.outcome && snapshot.facts.outcome !== 'unknown'
    ? getFactLabel('outcome', snapshot.facts.outcome)
    : undefined;

  return {
    version: START_DISCOVERY_PREFILL_VERSION,
    source: {
      adapter: 'solutions-decision-workspace',
      label: 'ملخص قرار الحلول',
    },
    selectedOutcome,
    recommendedFamily: family.title,
    selectedCapabilities,
    optionalCapabilities,
    configurationPreference: configurationDirections.find(
      (direction) => direction.id === snapshot.configuration,
    )?.title,
    budgetPreference: mapBudgetPreference(snapshot),
    knownDependencies: unique(snapshot.confirmedDependencies),
    unknowns: unique(snapshot.unknowns),
    relevantReferenceContext: mapReferenceContext(snapshot),
  };
}

export function createStartDiscoveryRouteState(
  snapshot: DecisionSnapshot,
): StartDiscoveryRouteState {
  return { discoveryPrefill: mapSolutionsDecisionToDiscovery(snapshot) };
}

export function readStartDiscoveryRouteState(
  state: unknown,
): StartDiscoveryPrefill | undefined {
  if (!state || typeof state !== 'object' || !('discoveryPrefill' in state)) {
    return undefined;
  }

  const candidate = (state as { discoveryPrefill?: unknown }).discoveryPrefill;
  if (!candidate || typeof candidate !== 'object') return undefined;
  if (!('version' in candidate) || candidate.version !== START_DISCOVERY_PREFILL_VERSION) {
    return undefined;
  }

  return candidate as StartDiscoveryPrefill;
}
