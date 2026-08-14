import {
  START_DISCOVERY_PREFILL_VERSION,
  type DiscoveryCapabilityClassification,
  type DiscoveryCapabilityProvenance,
  type DiscoveryCapabilitySelection,
  type DiscoveryCapturedFacts,
  type DiscoveryPrefillSource,
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
    selections.push({
      name: entry.name,
      classification: entry.classification as DiscoveryCapabilityClassification,
      provenance: entry.provenance as DiscoveryCapabilityProvenance,
    });
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

  const selections = readCapabilitySelections(candidate.capabilitySelections);
  if (selections) {
    prefill.capabilitySelections = selections;
    if (selections.length) hasUsableContext = true;
  }

  const capturedFacts = readCapturedFacts(candidate.capturedFacts);
  if (capturedFacts) {
    prefill.capturedFacts = capturedFacts;
    hasUsableContext = true;
  }

  return hasUsableContext ? prefill : undefined;
}
