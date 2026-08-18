import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StartDiscoveryBody } from '../features/start-discovery';
import type { DiscoverySummary, StartDiscoveryDraft } from '../types/start-discovery';
import { RouteReadySignal } from './RouteReadySignal';
import { readStartDiscoveryRouteState } from './startDiscoveryRouteState';
import './integratedPublicPages.css';

const START_PROJECT_BRIEF_SESSION_KEY = 'gs-start-project-brief-v1';

interface StartProjectBriefHandoff {
  version: 1;
  mode: 'LOCAL_PUBLIC_HANDOFF';
  createdAt: string;
  summary: DiscoverySummary;
  draft: StartDiscoveryDraft;
  directionTruth: {
    recommendedFamily: string;
    adoptedFamilyId: string;
    decisionOrigin: StartDiscoveryDraft['decisionOrigin'] | null;
    recommendationResolution: StartDiscoveryDraft['recommendationResolution'] | null;
  };
  provenance: {
    prefillSource: StartDiscoveryDraft['prefillSource'] | null;
    capabilitySelections: StartDiscoveryDraft['capabilitySelections'];
  };
  explicitChannels: {
    selectedCapabilities: string[];
    optionalCapabilities: string[];
    uncertainCapabilities: string[];
    dependencies: string[];
    unknowns: string[];
    existingSystems: string;
    integrations: string;
  };
}

function readLocalProjectBrief() {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(START_PROJECT_BRIEF_SESSION_KEY) ?? 'null') as StartProjectBriefHandoff | null;
    return parsed?.version === 1 && parsed.mode === 'LOCAL_PUBLIC_HANDOFF' ? parsed : null;
  } catch {
    return null;
  }
}

function createLocalProjectBrief(summary: DiscoverySummary, draft: StartDiscoveryDraft): StartProjectBriefHandoff {
  return {
    version: 1,
    mode: 'LOCAL_PUBLIC_HANDOFF',
    createdAt: new Date().toISOString(),
    summary,
    draft,
    directionTruth: {
      recommendedFamily: draft.recommendedFamily,
      adoptedFamilyId: draft.solutionFamilyId,
      decisionOrigin: draft.decisionOrigin ?? null,
      recommendationResolution: draft.recommendationResolution ?? null,
    },
    provenance: {
      prefillSource: draft.prefillSource ?? null,
      capabilitySelections: [...draft.capabilitySelections],
    },
    explicitChannels: {
      selectedCapabilities: [...draft.selectedCapabilities],
      optionalCapabilities: [...draft.optionalCapabilities],
      uncertainCapabilities: [...draft.uncertainCapabilities],
      dependencies: [...draft.dependencies],
      unknowns: [...draft.unknowns],
      existingSystems: draft.existingSystems,
      integrations: draft.integrations,
    },
  };
}

export default function StartDiscoveryRoute() {
  const location = useLocation();
  const prefill = readStartDiscoveryRouteState(location.state);
  const [projectBrief, setProjectBrief] = useState<StartProjectBriefHandoff | null>(() => readLocalProjectBrief());

  const handleLocalComplete = (summary: DiscoverySummary, draft: StartDiscoveryDraft) => {
    const handoff = createLocalProjectBrief(summary, draft);
    window.sessionStorage.setItem(START_PROJECT_BRIEF_SESSION_KEY, JSON.stringify(handoff));
    setProjectBrief(handoff);
  };

  return (
    <RouteReadySignal>
      <div className="integrated-public-page integrated-public-page--start">
        <StartDiscoveryBody
          prefill={prefill}
          initialCertainty={prefill ? 'configured' : undefined}
          onLocalComplete={handleLocalComplete}
        />
        {projectBrief ? (
          <section
            className="start-project-brief-handoff"
            aria-labelledby="start-project-brief-title"
            data-testid="project-brief-handoff"
            data-handoff-mode="local-public"
          >
            <p className="start-project-brief-handoff__eyebrow">موجز المشروع · جاهز للمتابعة المحلية</p>
            <h2 id="start-project-brief-title">تم حفظ مخططك للخطوة التالية دون إعادة الإدخال</h2>
            <p>
              حُفظ هذا الموجز داخل جلسة المتصفح فقط. لم يتم إرسال بيانات إلى خادم أو بريد إلكتروني، ولا يعني ذلك تأكيد تسليم خارجي.
            </p>
            <dl>
              <div>
                <dt>توصية GS</dt>
                <dd>{projectBrief.directionTruth.recommendedFamily || 'لا توجد توصية منسوبة.'}</dd>
              </div>
              <div>
                <dt>الاتجاه الذي اعتمدته</dt>
                <dd>{projectBrief.directionTruth.adoptedFamilyId || 'لم يُعتمد اتجاه بعد.'}</dd>
              </div>
              <div>
                <dt>مصدر السياق</dt>
                <dd>{projectBrief.provenance.prefillSource?.label || projectBrief.provenance.prefillSource?.adapter || 'بدأت من START مباشرة.'}</dd>
              </div>
              <div>
                <dt>قنوات لم تُملأ</dt>
                <dd>
                  {[
                    projectBrief.explicitChannels.selectedCapabilities.length ? null : 'قدرات مختارة',
                    projectBrief.explicitChannels.dependencies.length ? null : 'اعتمادات',
                    projectBrief.explicitChannels.unknowns.length ? null : 'نقاط غير محسومة',
                  ].filter(Boolean).join(' · ') || 'لا توجد قنوات فارغة ضمن هذه المجموعة.'}
                </dd>
              </div>
            </dl>
            <p role="status">الموجز الكامل والمسودة ومصدر كل اختيار محفوظة محليًا ويمكن لمسار إنتاج لاحق استهلاكها دون طلب البيانات نفسها مرة أخرى.</p>
          </section>
        ) : null}
      </div>
    </RouteReadySignal>
  );
}
