export type SolutionFamilyId =
  | 'business'
  | 'commerce'
  | 'booking'
  | 'assets'
  | 'portals'
  | 'knowledge';

export type EntryMode = 'discover' | 'direction' | 'compare';

export type WorkspaceStep = 'entry' | 'qualify' | 'recommend' | 'configure' | 'summary';

export type ConfigurationPhase = 'capabilities' | 'options' | 'constraints';

export type CapabilityClassification =
  | 'CORE'
  | 'RECOMMENDED'
  | 'OPTIONAL'
  | 'CONDITIONAL'
  | 'CUSTOM';

export type EvidenceState =
  | 'VERIFIED_IMPLEMENTATION'
  | 'REVIEWED_VISUAL_EVIDENCE'
  | 'BOUNDED_DEMO'
  | 'REFERENCE_ONLY'
  | 'PLANNED'
  | 'NOT_AVAILABLE'
  | 'REJECTED';

export type FactKey = 'outcome' | 'activity' | 'audience' | 'complexity';

export type DecisionFacts = Partial<Record<FactKey, string>> & {
  constraints: string;
};

export type FinderOption = {
  id: string;
  label: string;
  detail: string;
  weights: Partial<Record<SolutionFamilyId, number>>;
};

export type FinderQuestion = {
  key: FactKey;
  eyebrow: string;
  title: string;
  help: string;
  options: FinderOption[];
};

export type Capability = {
  name: string;
  description: string;
  classification: CapabilityClassification;
};

export type ReferenceContext = {
  code?: 'RP01' | 'RP02' | 'RP03' | 'RP04';
  title: string;
  note: string;
  evidenceState: EvidenceState;
};

export type SolutionFamily = {
  id: SolutionFamilyId;
  number: string;
  title: string;
  cue: string;
  problem: string;
  fits: string[];
  doesNotFit: string;
  operatingLoop: string[];
  capabilities: Capability[];
  dependencies: string[];
  boundaries: string[];
  reference: ReferenceContext;
  complexityNote: string;
  nextDecision: string;
};

export type ConfigurationDirectionId = 'focused' | 'connected' | 'custom';

export type ConfigurationDirection = {
  id: ConfigurationDirectionId;
  title: string;
  shortLabel: string;
  description: string;
  dimensions: {
    operationalDepth: string;
    capabilityCoverage: string;
    customization: string;
    integration: string;
    reporting: string;
    discovery: string;
  };
};

export type BudgetPreferenceId = 'control' | 'flexible' | 'complex' | 'unknown';

export type Recommendation = {
  recommendedId: SolutionFamilyId;
  alternativeId?: SolutionFamilyId;
  reasons: string[];
  missing: string[];
};

export type DecisionSnapshot = {
  entryMode: EntryMode;
  facts: DecisionFacts;
  recommendedFamily: SolutionFamilyId;
  alternativeFamily?: SolutionFamilyId;
  selectedCapabilities: string[];
  configuration: ConfigurationDirectionId;
  budgetPreference: BudgetPreferenceId;
  budgetRange: string;
  confirmedDependencies: string[];
  unknowns: string[];
  evidenceState: EvidenceState;
};

export type SolutionsDecisionWorkspaceProps = {
  initialMode?: EntryMode;
  onDecisionChange?: (snapshot: DecisionSnapshot) => void;
  onStartDiscovery?: (snapshot: DecisionSnapshot) => void;
};
