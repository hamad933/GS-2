import {
  START_DISCOVERY_PREFILL_VERSION,
  type DiscoveryPrefillSource,
  type StartDiscoveryPrefill,
} from '../types/start-discovery';

type UnknownRecord = Record<string, unknown>;

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

  return hasUsableContext ? prefill : undefined;
}
