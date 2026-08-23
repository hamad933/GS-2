import { useCallback, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getStartFamily, isStartFamilyId } from '../data/start-discovery/startExperience';
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
  staleAt?: string;
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

function adoptedFamilyLabel(familyId: string) {
  return isStartFamilyId(familyId) ? getStartFamily(familyId).title : 'لم يُعتمد اتجاه بعد.';
}

export default function StartDiscoveryRoute() {
  const location = useLocation();
  const prefill = readStartDiscoveryRouteState(location.state);
  const initialProjectBrief = useRef<StartProjectBriefHandoff | null>(readLocalProjectBrief());
  const projectBriefRef = useRef<StartProjectBriefHandoff | null>(initialProjectBrief.current);
  const projectBriefStaleRef = useRef(Boolean(initialProjectBrief.current?.staleAt));
  const [projectBrief, setProjectBrief] = useState<StartProjectBriefHandoff | null>(initialProjectBrief.current);
  const [projectBriefStale, setProjectBriefStale] = useState(projectBriefStaleRef.current);
  const draftChangeSeen = useRef(false);

  const handleDraftChange = useCallback(() => {
    if (!draftChangeSeen.current) {
      draftChangeSeen.current = true;
      return;
    }
    const currentBrief = projectBriefRef.current;
    if (!currentBrief || projectBriefStaleRef.current) return;

    const staleBrief: StartProjectBriefHandoff = {
      ...currentBrief,
      staleAt: new Date().toISOString(),
    };
    projectBriefRef.current = staleBrief;
    projectBriefStaleRef.current = true;
    setProjectBrief(staleBrief);
    setProjectBriefStale(true);

    try {
      window.sessionStorage.setItem(START_PROJECT_BRIEF_SESSION_KEY, JSON.stringify(staleBrief));
    } catch {
      // The visible state remains stale even when storage is unavailable.
      // The completion path owns the truthful recoverable storage error.
    }
  }, []);

  const handleLocalComplete = useCallback((summary: DiscoverySummary, draft: StartDiscoveryDraft) => {
    const handoff = createLocalProjectBrief(summary, draft);
    window.sessionStorage.setItem(START_PROJECT_BRIEF_SESSION_KEY, JSON.stringify(handoff));
    projectBriefRef.current = handoff;
    projectBriefStaleRef.current = false;
    setProjectBrief(handoff);
    setProjectBriefStale(false);
  }, []);

  return (
    <RouteReadySignal>
      <div className="integrated-public-page integrated-public-page--start">
        <StartDiscoveryBody
          prefill={prefill}
          initialCertainty={prefill ? 'configured' : undefined}
          onDraftChange={handleDraftChange}
          onLocalComplete={handleLocalComplete}
        />
        {projectBrief ? (
          <section
            className="start-project-brief-handoff"
            aria-labelledby="start-project-brief-title"
            data-testid="project-brief-handoff"
            data-handoff-mode="local-public"
            data-handoff-state={projectBriefStale ? 'stale' : 'current'}
          >
            <p className="start-project-brief-handoff__eyebrow">
              {projectBriefStale ? 'موجز المشروع · يحتاج مراجعة جديدة' : 'موجز المشروع · محفوظ داخل هذه الجلسة'}
            </p>
            <h2 id="start-project-brief-title">
              {projectBriefStale
                ? 'الموجز المحفوظ يعود إلى نسخة سابقة من مخططك'
                : 'تم حفظ موجز هذه النسخة داخل جلسة المتصفح'}
            </h2>
            {projectBriefStale ? (
              <p role="status">
                عدّلت المخطط بعد آخر حفظ، لذلك لم نعد نعرض الموجز القديم على أنه الحالة الحالية. أكمل التعديل، ثم عُد إلى المراجعة واحفظ نسخة جديدة.
              </p>
            ) : (
              <p>
                حُفظ هذا الموجز داخل جلسة المتصفح فقط. لم يتم إرسال بيانات إلى خادم أو بريد إلكتروني، ولم يُنشأ مشروع أو طلب أو عملية شراء.
              </p>
            )}
            <dl aria-label={projectBriefStale ? 'بيانات آخر موجز محفوظ — غير محدثة' : 'بيانات الموجز المحفوظ'}>
              <div>
                <dt>توصية GS</dt>
                <dd>{projectBrief.directionTruth.recommendedFamily || 'لا توجد توصية منسوبة.'}</dd>
              </div>
              <div>
                <dt>الاتجاه الذي اعتمدته</dt>
                <dd>{adoptedFamilyLabel(projectBrief.directionTruth.adoptedFamilyId)}</dd>
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
            <div className="start-project-brief-handoff__next" aria-labelledby="start-project-brief-next-title">
              <h3 id="start-project-brief-next-title">الخطوة التالية وملكيتها</h3>
              {projectBriefStale ? (
                <p>أنت تملك الخطوة التالية: أكمل التعديل في START، راجع المخطط من جديد، ثم احفظ الموجز المحدث داخل الجلسة.</p>
              ) : (
                <>
                  <p><strong>ما حدث:</strong> حُفظت هذه النسخة محليًا فقط. <strong>ما لم يحدث:</strong> لم تستلم GS طلبًا، ولم يبدأ مشروع، ولم يحدث إرسال أو شراء أو دفع.</p>
                  <p><strong>ما يمكنك فعله الآن:</strong> راجع النسخة أو عدّلها قبل أي مشاركة خارج هذه الصفحة. أنت أو فريقك تملكون قرار الخطوة الخارجية التالية.</p>
                  <a href="#start-review-title">ارجع إلى المراجعة أو التعديل</a>
                </>
              )}
            </div>
          </section>
        ) : null}
      </div>
    </RouteReadySignal>
  );
}
