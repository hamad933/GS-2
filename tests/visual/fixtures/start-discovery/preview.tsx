import ReactDOM from 'react-dom/client';
import '../../../../src/index.css';
import {
  START_DISCOVERY_PREFILL_VERSION,
  StartDiscoveryBody,
  type StartDiscoveryPrefill,
} from '../../../../src/features/start-discovery';

const bookingPrefill: StartDiscoveryPrefill = {
  version: START_DISCOVERY_PREFILL_VERSION,
  source: {
    adapter: 'solutions-decision-workspace',
    label: 'ملخص قرار الحلول',
    referenceId: 'START-W01-BOOKING',
  },
  recommendedFamily: 'الحجوزات والخدمات',
  solutionFamilyId: 'booking',
  decisionOrigin: 'SYSTEM_FINDER',
  recommendationResolution: 'decisive',
  capabilitySelections: [
    {
      name: 'كتالوج الخدمات',
      classification: 'CORE',
      provenance: 'SYSTEM_SEEDED',
    },
  ],
  capturedFacts: {
    outcome: 'جعل الحجز أوضح للعميل والفريق',
    activity: 'خدمة تعتمد على المواعيد',
    audience: 'عملاء وفريق خدمة',
  },
  budgetPreference: 'النطاق الذي ذكره المستخدم: مرن حسب القيمة',
  knownDependencies: ['قواعد إتاحة واضحة'],
  unknowns: ['سياسة الإلغاء النهائية'],
};

const portalsPrefill: StartDiscoveryPrefill = {
  version: START_DISCOVERY_PREFILL_VERSION,
  source: {
    adapter: 'solutions-decision-workspace',
    label: 'ملخص قرار الحلول',
    referenceId: 'START-W01-PORTALS',
  },
  recommendedFamily: 'الأنظمة التشغيلية والبوابات',
  solutionFamilyId: 'portals',
  decisionOrigin: 'USER_DIRECT',
  recommendationResolution: 'decisive',
  capabilitySelections: [],
  capturedFacts: {
    outcome: 'جمع الطلبات والحالات في مسار واحد',
    activity: 'عمليات وفرق',
    audience: 'فريق داخلي',
  },
};

const parameters = new URLSearchParams(window.location.search);
const prefillMode = parameters.get('prefill');
const prefill = prefillMode === 'booking'
  ? bookingPrefill
  : prefillMode === 'portals'
    ? portalsPrefill
    : undefined;

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <StartDiscoveryBody
      prefill={prefill}
      onDraftChange={(draft) => {
        root.dataset.draftRecommendedFamily = draft.recommendedFamily;
        root.dataset.draftSelectedFamily = draft.solutionFamilyId;
        root.dataset.draftDecisionOrigin = draft.decisionOrigin ?? '';
        root.dataset.draftRecommendedExperience = draft.recommendedConfigurationPreference ?? '';
        root.dataset.draftSelectedExperience = draft.configurationPreference;
      }}
      onLocalComplete={(_summary, draft) => {
        root.dataset.completed = 'true';
        root.dataset.completedFamily = draft.solutionFamilyId;
        root.dataset.completedCapabilities = draft.selectedCapabilities.join('|');
      }}
    />,
  );
}
