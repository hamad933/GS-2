import {
  START_DISCOVERY_PREFILL_VERSION,
  type DiscoveryCapabilityClassification,
  type DiscoveryCapabilityProvenance,
  type DiscoveryCapabilitySelection,
  type DiscoveryCapturedFacts,
  type DiscoveryDecisionOrigin,
  type DiscoveryPrefillSource,
  type DiscoveryRecommendationResolution,
  type StartDiscoveryPrefill,
} from '../types/start-discovery';

type UnknownRecord = Record<string, unknown>;

const capabilityClassifications = new Set<DiscoveryCapabilityClassification>([
  'CORE',
  'RECOMMENDED',
  'OPTIONAL',
  'CONDITIONAL',
  'CUSTOM',
]);
const capabilityProvenance = new Set<DiscoveryCapabilityProvenance>([
  'SYSTEM_SEEDED',
  'USER_SELECTED',
]);
const decisionOrigins = new Set<DiscoveryDecisionOrigin>([
  'SYSTEM_FINDER',
  'USER_DIRECT',
  'USER_COMPARE',
  'USER_OPEN_DIRECTION',
  'USER_ALTERNATIVE',
]);
const recommendationResolutions = new Set<DiscoveryRecommendationResolution>([
  'decisive',
  'tied',
  'insufficient',
]);
const capturedFactFields = [
  'outcome',
  'activity',
  'audience',
  'complexity',
  'constraints',
] as const;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readStringArray(value: unknown): readonly string[] | undefined {
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === 'string')) {
    return undefined;
  }

  return value;
}

function readPrefillSource(value: unknown): DiscoveryPrefillSource | undefined {
  if (!isRecord(value) || typeof value.adapter !== 'string' || !value.adapter.trim()) {
    return undefined;
  }

  const source: DiscoveryPrefillSource = { adapter: value.adapter };
  if (typeof value.label === 'string') source.label = value.label;
  if (typeof value.referenceId === 'string') source.referenceId = value.referenceId;
  return source;
}

function readCapabilitySelections(
  value: unknown,
): readonly DiscoveryCapabilitySelection[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const selections: DiscoveryCapabilitySelection[] = [];
  const selectionsByName = new Map<
    string,
    Pick<DiscoveryCapabilitySelection, 'classification' | 'provenance'>
  >();
  for (const entry of value) {
    if (!isRecord(entry) || typeof entry.name !== 'string' || !entry.name.trim()) {
      return undefined;
    }
    if (
      typeof entry.classification !== 'string'
      || !capabilityClassifications.has(entry.classification as DiscoveryCapabilityClassification)
      || typeof entry.provenance !== 'string'
      || !capabilityProvenance.has(entry.provenance as DiscoveryCapabilityProvenance)
    ) {
      return undefined;
    }

    const name = entry.name.trim();
    const classification = entry.classification as DiscoveryCapabilityClassification;
    const provenance = entry.provenance as DiscoveryCapabilityProvenance;
    const existing = selectionsByName.get(name);
    if (existing) {
      if (
        existing.classification !== classification
        || existing.provenance !== provenance
      ) {
        return undefined;
      }
      continue;
    }

    selectionsByName.set(name, { classification, provenance });
    selections.push({ name, classification, provenance });
  }

  return selections;
}

function readCapturedFacts(value: unknown): DiscoveryCapturedFacts | undefined {
  if (!isRecord(value)) return undefined;

  const facts: DiscoveryCapturedFacts = {};
  let hasUsableFact = false;
  for (const field of capturedFactFields) {
    const candidate = value[field];
    if (candidate === undefined) continue;
    if (typeof candidate !== 'string') return undefined;
    facts[field] = candidate;
    if (candidate.trim()) hasUsableFact = true;
  }

  return hasUsableFact ? facts : undefined;
}

export function readStartDiscoveryRouteState(
  state: unknown,
): StartDiscoveryPrefill | undefined {
  if (!isRecord(state) || !isRecord(state.discoveryPrefill)) {
    return undefined;
  }

  const candidate = state.discoveryPrefill;
  if (candidate.version !== START_DISCOVERY_PREFILL_VERSION) {
    return undefined;
  }

  const prefill: StartDiscoveryPrefill = {
    version: START_DISCOVERY_PREFILL_VERSION,
  };
  const source = readPrefillSource(candidate.source);
  if (source) prefill.source = source;

  let hasUsableContext = false;
  const stringFields = [
    'selectedProblem',
    'selectedOutcome',
    'recommendedFamily',
    'solutionFamilyId',
    'configurationPreference',
    'budgetPreference',
    'relevantReferenceContext',
  ] as const;
  for (const field of stringFields) {
    const value = candidate[field];
    if (typeof value !== 'string') continue;
    prefill[field] = value;
    if (value.trim()) hasUsableContext = true;
  }

  if (
    typeof candidate.decisionOrigin === 'string'
    && decisionOrigins.has(candidate.decisionOrigin as DiscoveryDecisionOrigin)
  ) {
    prefill.decisionOrigin = candidate.decisionOrigin as DiscoveryDecisionOrigin;
    hasUsableContext = true;
  }

  if (
    typeof candidate.recommendationResolution === 'string'
    && recommendationResolutions.has(
      candidate.recommendationResolution as DiscoveryRecommendationResolution,
    )
  ) {
    prefill.recommendationResolution =
      candidate.recommendationResolution as DiscoveryRecommendationResolution;
    hasUsableContext = true;
  }

  const arrayFields = [
    'selectedCapabilities',
    'optionalCapabilities',
    'knownDependencies',
    'unknowns',
  ] as const;
  for (const field of arrayFields) {
    const value = readStringArray(candidate[field]);
    if (!value) continue;
    prefill[field] = value;
    if (value.some((entry) => entry.trim())) hasUsableContext = true;
  }

  const hasExplicitCapabilitySelections = Object.prototype.hasOwnProperty.call(
    candidate,
    'capabilitySelections',
  );
  if (hasExplicitCapabilitySelections) {
    const selections = readCapabilitySelections(candidate.capabilitySelections);
    prefill.capabilitySelections = selections ?? [];
    if (selections?.length) hasUsableContext = true;
  }

  const capturedFacts = readCapturedFacts(candidate.capturedFacts);
  if (capturedFacts) {
    prefill.capturedFacts = capturedFacts;
    hasUsableContext = true;
  }

  return hasUsableContext ? prefill : undefined;
}
