import ReactDOM from 'react-dom/client';
import '../../../../src/index.css';
import {
  START_DISCOVERY_PREFILL_VERSION,
  StartDiscoveryBody,
  type DiscoveryCertainty,
  type StartDiscoveryPrefill,
} from '../../../../src/features/start-discovery';

const previewPrefill: StartDiscoveryPrefill = {
  version: START_DISCOVERY_PREFILL_VERSION,
  source: {
    adapter: 'solutions-decision-workspace',
    label: 'مساحة قرار الحلول',
    referenceId: 'SDW-DEMO-04',
  },
  selectedProblem: 'تتوزع طلبات الخدمة بين قنوات متعددة ولا تظهر حالتها بوضوح.',
  selectedOutcome: 'توحيد رحلة الطلب ومتابعة حالته من نقطة واحدة.',
  recommendedFamily: 'الأنظمة التشغيلية والبوابات',
  selectedCapabilities: ['استقبال الطلبات', 'متابعة الحالة'],
  optionalCapabilities: ['تقارير تشغيلية'],
  configurationPreference: 'أفضل نقطة بداية محدودة',
  budgetPreference: 'أحتاج تصورًا للنطاق قبل مناقشة الميزانية',
  knownDependencies: ['مراجعة مصدر بيانات الطلبات الحالي'],
  unknowns: ['آلية ترحيل السجلات القديمة'],
  relevantReferenceContext:
    'سياق مرجعي توضيحي من مساحة الحلول؛ لا يمثل وعدًا أو تطبيقًا مدمجًا.',
};

const parameters = new URLSearchParams(window.location.search);
const usePrefill = parameters.get('prefill') === '1';
const certainty = parameters.get('certainty') as DiscoveryCertainty | null;

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <StartDiscoveryBody
      prefill={usePrefill ? previewPrefill : undefined}
      initialCertainty={certainty ?? undefined}
    />,
  );
}
