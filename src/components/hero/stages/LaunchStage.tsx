import React, { useState, useEffect, useCallback } from 'react';
import { CircleCheckBigIcon, SendIcon, ServerIcon, CheckIcon, ShieldCheckIcon, PlusCircleIcon, PlayIcon, PauseIcon, CheckCircle2Icon } from 'lucide-react';
import { BrowserWindow } from '../primitives/BrowserWindow';
import { PhoneFrame } from '../primitives/PhoneFrame';
import { PanelCard } from '../primitives/PanelCard';
import { RequestTag } from '../primitives/RequestTag';
import { ConnectorOverlay } from '../primitives/ConnectorOverlay';

interface RequestItem {
  id: string;
  client: string;
  service: string;
  status: 'طلب جديد' | 'قيد التنفيذ' | 'مكتمل';
  time: string;
}

const SAMPLE_CLIENTS = [
  { name: 'شركة المدى للتكنولوجيا', service: 'منظومة إدارة البلاغات' },
  { name: 'مؤسسة الرواد الذكية', service: 'بوابة الدفع والربط' },
  { name: 'شركة النخبة للحلول', service: 'تطبيق متابعة التشغيل' },
  { name: 'مجموعة نماء الاستثمارية', service: 'لوحة التحكم والبيانات' }
];

export function LaunchStage() {
  const [requests, setRequests] = useState<RequestItem[]>([
    { id: 'GS-241', client: 'شركة الأفق الرقمية', service: 'طلب خدمة التحول الرقمي', status: 'طلب جديد', time: 'الآن' },
    { id: 'GS-240', client: 'شركة الرؤية التقنية', service: 'تطوير البوابة الرئيسية', status: 'مكتمل', time: 'منذ 10 دقائق' },
    { id: 'GS-239', client: 'مؤسسة الحلول الذكية', service: 'ربط الأنظمة المباشر', status: 'مكتمل', time: 'منذ ساعة' },
  ]);

  const [activeReqId, setActiveReqId] = useState<string>('GS-241');
  const [autoStreamActive, setAutoStreamActive] = useState(false);

  const handleAddNewRequest = useCallback(() => {
    setRequests(prev => {
      const nextNum = parseInt(prev[0].id.replace('GS-', ''), 10) + 1;
      const newId = `GS-${nextNum}`;
      const sample = SAMPLE_CLIENTS[Math.floor(Math.random() * SAMPLE_CLIENTS.length)];
      const newReq: RequestItem = {
        id: newId,
        client: sample.name,
        service: sample.service,
        status: 'طلب جديد',
        time: 'الآن'
      };
      setActiveReqId(newId);
      return [newReq, ...prev];
    });
  }, []);

  const handleUpdateStatus = (id: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id !== id) return r;
      const nextStatus = r.status === 'طلب جديد' ? 'قيد التنفيذ' : r.status === 'قيد التنفيذ' ? 'مكتمل' : 'طلب جديد';
      return { ...r, status: nextStatus };
    }));
  };

  // Auto-stream synthetic traffic generator
  useEffect(() => {
    if (!autoStreamActive) return;
    const timer = setInterval(() => {
      handleAddNewRequest();
    }, 3800);
    return () => clearInterval(timer);
  }, [autoStreamActive, handleAddNewRequest]);

  const activeReq = requests.find((r) => r.id === activeReqId) || requests[0];

  return (
    <>
      <div className="mx-auto max-w-[430px] lg:hidden">
        <LaunchBrowser
          activeReq={activeReq}
          handleAddNewRequest={handleAddNewRequest}
          autoStreamActive={autoStreamActive}
          setAutoStreamActive={setAutoStreamActive}
        />
      </div>

      <div className="relative hidden aspect-[16/11] w-full lg:block">
        <ConnectorOverlay variant="launch" />

        <div className="absolute left-[6%] top-[15%] z-20 w-[24%]">
          <LaunchOpsCard
            requests={requests}
            activeReqId={activeReqId}
            setActiveReqId={setActiveReqId}
            handleAddNewRequest={handleAddNewRequest}
            handleUpdateStatus={handleUpdateStatus}
            autoStreamActive={autoStreamActive}
            setAutoStreamActive={setAutoStreamActive}
          />
        </div>

        <div className="absolute left-[6%] bottom-[15%] z-20 w-[24%]">
          <LaunchTraceCard activeReq={activeReq} requestsCount={requests.length} />
        </div>

        <div className="absolute left-[33%] top-[12%] right-[25%] z-10 shadow-xl opacity-95">
          <LaunchBrowser
            activeReq={activeReq}
            handleAddNewRequest={handleAddNewRequest}
            autoStreamActive={autoStreamActive}
            setAutoStreamActive={setAutoStreamActive}
          />
        </div>

        <div className="absolute right-[4%] top-[15%] z-20 w-[18%]">
          <LaunchSuccessCard activeReq={activeReq} />
        </div>

        <div className="absolute right-[4%] bottom-[15%] z-30 w-[16%]">
          <LaunchPhone activeReq={activeReq} />
        </div>
      </div>
    </>
  );
}

interface LaunchBrowserProps {
  activeReq: RequestItem;
  handleAddNewRequest: () => void;
  autoStreamActive: boolean;
  setAutoStreamActive: (val: boolean) => void;
}

function LaunchBrowser({
  activeReq,
  handleAddNewRequest,
  autoStreamActive,
  setAutoStreamActive
}: LaunchBrowserProps) {
  return (
    <BrowserWindow address="generalsolutions.sa/live" badge="المرحلة ٠٤: الإطلاق والربط التشغيلي">
      <div className="relative min-h-[250px] overflow-hidden bg-[#0A0D14] text-white sm:min-h-[290px] lg:min-h-[330px] p-4 sm:p-5">
        {/* Ambient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#0A0D14] to-[#0A0D14] pointer-events-none" />

        <div className="relative z-10 h-full flex flex-col">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="font-sans text-xs font-bold tracking-tight text-white/90">General Solutions Live System</span>
            </div>
            <button
              type="button"
              onClick={() => setAutoStreamActive(!autoStreamActive)}
              className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-[8.5px] font-bold transition-all ${
                autoStreamActive
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  : 'border-white/10 bg-white/5 text-mineral-400 hover:bg-white/10 hover:text-white'
              }`}>
              {autoStreamActive ? <PauseIcon className="h-3 w-3" /> : <PlayIcon className="h-3 w-3" />}
              {autoStreamActive ? 'إيقاف مراقبة التدفق' : 'مراقبة التدفق المباشر'}
            </button>
          </div>

          <div className="flex-1 mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Live Website Preview Thumbnail */}
            <div className="relative rounded-xl border border-white/10 bg-[#0F141F] p-4 flex flex-col group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-bronze-500/5 to-transparent pointer-events-none" />
              
              <div className="flex items-center justify-between mb-3 relative z-10">
                <p className="text-[10px] font-bold text-white/90">واجهة المستخدم الحية</p>
                <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  generalsolutions.sa
                </span>
              </div>
              
              <div className="flex-1 relative rounded-lg border border-white/10 overflow-hidden bg-[#0A0D14]">
                <img src="/showcase.webp" alt="Live Website" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F141F] via-transparent to-transparent" />
                
                {/* Floating Notification */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-md p-2 flex items-center gap-2 animate-fade-in-up">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0">
                    <CheckCircle2Icon className="h-3 w-3 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-white">تم استلام طلبك بنجاح</p>
                    <p className="text-[7.5px] text-white/70">رقم الطلب: #{activeReq.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Request Stream & Operations */}
            <div className="rounded-xl border border-white/10 bg-[#0F141F] p-4 flex flex-col relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <p className="text-[10px] font-bold text-white/90">غرفة العمليات والمتابعة</p>
                <button
                  type="button"
                  onClick={handleAddNewRequest}
                  className="flex items-center gap-1.5 text-[8.5px] font-bold text-bronze-400 hover:text-bronze-300 hover:bg-bronze-500/10 px-2 py-1 rounded transition-all">
                  <PlusCircleIcon className="h-3.5 w-3.5" /> محاكاة طلب
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                <div className="bg-[#0A0D14] border border-white/5 rounded-lg p-2.5">
                  <p className="text-[8px] font-medium text-white/40 mb-1">Uptime</p>
                  <p className="text-[11px] font-mono font-bold text-emerald-400">99.999%</p>
                </div>
                <div className="bg-[#0A0D14] border border-white/5 rounded-lg p-2.5">
                  <p className="text-[8px] font-medium text-white/40 mb-1">Latency</p>
                  <p className="text-[11px] font-mono font-bold text-white/90">~12ms</p>
                </div>
              </div>
              
              <div className="flex-1 bg-[#0A0D14] border border-white/5 rounded-lg p-3 flex flex-col relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-[#0A0D14] to-transparent z-10" />
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0A0D14] to-transparent z-10" />
                
                <div className="w-full space-y-2.5 relative z-0">
                  <div className="flex items-center justify-between rounded-md bg-white/[0.03] border border-emerald-500/20 p-2.5 shadow-sm animate-fade-in-up">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheckIcon className="h-4 w-4 text-emerald-400" />
                      <div>
                        <p className="text-[9.5px] font-bold text-white/90">#{activeReq.id}</p>
                        <p className="text-[8px] text-white/50">{activeReq.client}</p>
                      </div>
                    </div>
                    <span className="rounded bg-emerald-500/20 px-2 py-1 text-[8px] font-bold text-emerald-400">
                      معتمد ومرحل
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-md bg-white/[0.02] border border-white/5 p-2.5 opacity-60 scale-[0.98] origin-top">
                     <div className="flex items-center gap-2.5">
                      <div className="h-4 w-4 rounded-full bg-white/10" />
                      <div className="space-y-1.5">
                        <div className="h-2 w-10 bg-white/20 rounded" />
                        <div className="h-1.5 w-16 bg-white/10 rounded" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-md bg-white/[0.01] border border-white/5 p-2.5 opacity-30 scale-[0.96] origin-top">
                     <div className="flex items-center gap-2.5">
                      <div className="h-4 w-4 rounded-full bg-white/5" />
                      <div className="space-y-1.5">
                        <div className="h-2 w-8 bg-white/10 rounded" />
                        <div className="h-1.5 w-12 bg-white/5 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </BrowserWindow>
  );
}

function LaunchPhone({ activeReq }: { activeReq: RequestItem }) {
  return (
    <PhoneFrame>
      <div className="flex min-h-[165px] flex-col gap-2 bg-mineral-50 p-2.5 sm:min-h-[185px]">
        <div className="flex items-center justify-between border-b border-mineral-200 pb-1">
          <span className="text-[8px] font-bold text-navy-900">إشعار الجوال</span>
          <RequestTag tone="solid" />
        </div>
        <div className="rounded-lg border border-emerald-300 bg-emerald-50/80 p-2 space-y-1">
          <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-800">
            <CheckIcon className="h-3 w-3 text-emerald-600" />
            تم تأكيد الطلب
          </div>
          <p className="text-[7.5px] text-navy-900/80 leading-3">
            عزيزي العميل، تم استلام طلبك رقم <span className="font-bold">#{activeReq.id}</span> وتحويله لغرفة العمليات.
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}

function LaunchSuccessCard({ activeReq }: { activeReq: RequestItem }) {
  return (
    <PanelCard highlight className="text-center flex flex-col items-center justify-center py-2 space-y-1">
      <CircleCheckBigIcon className="h-6 w-6 text-emerald-600" strokeWidth={2} />
      <p className="font-kufi text-[10.5px] font-bold text-navy-900">
        تم اعتماد الطلب #{activeReq.id}
      </p>
      <p className="text-[8px] text-navy-900/60 font-semibold">{activeReq.client}</p>
      <div className="mt-1">
        <span className={`inline-block rounded px-2 py-0.5 text-[8px] font-bold ${
          activeReq.status === 'مكتمل'
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            : 'bg-bronze-100 text-bronze-800 border border-bronze-300'
        }`}>
          الحالة: {activeReq.status}
        </span>
      </div>
    </PanelCard>
  );
}

interface LaunchOpsCardProps {
  requests: RequestItem[];
  activeReqId: string;
  setActiveReqId: (id: string) => void;
  handleAddNewRequest: () => void;
  handleUpdateStatus: (id: string) => void;
  autoStreamActive: boolean;
  setAutoStreamActive: (val: boolean) => void;
}

function LaunchOpsCard({
  requests,
  activeReqId,
  setActiveReqId,
  handleAddNewRequest,
  handleUpdateStatus,
  autoStreamActive,
  setAutoStreamActive
}: LaunchOpsCardProps) {
  return (
    <PanelCard dark className="flex flex-col gap-2 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center justify-between border-b border-navy-700/80 pb-1.5 relative z-10">
        <div className="flex items-center gap-1.5">
          <ServerIcon className="h-4 w-4 text-emerald-400" />
          <p className="font-kufi text-[11px] font-bold text-white">غرفة العمليات (Ops)</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAutoStreamActive(!autoStreamActive)}
            title={autoStreamActive ? 'إيقاف التدفق' : 'تشغيل التدفق'}
            className={`p-1.5 rounded-md text-[8.5px] font-bold transition-all shadow-sm ${
              autoStreamActive ? 'bg-emerald-500 text-white shadow-emerald-900/50' : 'bg-navy-800 text-mineral-300 hover:text-white hover:bg-navy-700'
            }`}>
            {autoStreamActive ? <PauseIcon className="h-3 w-3" /> : <PlayIcon className="h-3 w-3" />}
          </button>
          <button
            type="button"
            onClick={handleAddNewRequest}
            title="إضافة طلب جديد"
            className="text-emerald-400 hover:text-emerald-300 transition-colors p-1 bg-navy-800 hover:bg-navy-700 rounded-md shadow-sm">
            <PlusCircleIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Active Request Queue */}
      <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 relative z-10">
        {requests.map((item) => {
          const isActive = item.id === activeReqId;
          return (
            <div
              key={item.id}
              onClick={() => setActiveReqId(item.id)}
              className={`cursor-pointer rounded-lg border p-2 transition-all ${
                isActive
                  ? 'border-bronze-500 bg-bronze-500/10 ring-1 ring-bronze-500/30 shadow-inner'
                  : 'border-navy-700/60 bg-navy-800/40 hover:bg-navy-800/80 hover:border-navy-600'
              }`}>
              <div className="flex items-center justify-between text-[8px]">
                <span dir="ltr" className="font-mono font-bold text-bronze-300 flex items-center gap-1">
                  {isActive && <span className="h-1 w-1 rounded-full bg-bronze-400 animate-pulse" />}
                  #{item.id}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateStatus(item.id);
                  }}
                  title="انقر لتغيير الحالة"
                  className={`rounded-md px-2 py-0.5 text-[7.5px] font-bold hover:scale-105 transition-transform shadow-sm ${
                    item.status === 'مكتمل'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : item.status === 'قيد التنفيذ'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-bronze-500/20 text-bronze-100 border border-bronze-400/30'
                  }`}>
                  {item.status} ✎
                </button>
              </div>
              <p className="mt-1 text-[9px] font-medium text-mineral-200 truncate pr-2">{item.client}</p>
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
}

function LaunchTraceCard({ activeReq, requestsCount }: { activeReq: RequestItem; requestsCount: number }) {
  return (
    <PanelCard className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-bronze-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-1.5">
          <SendIcon className="h-4 w-4 text-bronze-600" />
          <p className="text-[10.5px] font-bold text-navy-900">مسار التتبع الشامل</p>
        </div>
        <span className="text-[8px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shadow-sm">
          إجمالي: {requestsCount}
        </span>
      </div>
      <div className="flex items-center justify-between text-[8px] font-bold text-navy-900/80 bg-mineral-50 p-2 rounded-lg border border-mineral-200 shadow-inner relative z-10">
        <span>1. الموقع</span>
        <span className="text-bronze-500">←</span>
        <span className="text-bronze-800 bg-white px-1 py-0.5 rounded border border-bronze-200 shadow-2xs">2. التأكيد (#{activeReq.id})</span>
        <span className="text-emerald-500">←</span>
        <span>3. العمليات</span>
      </div>
    </PanelCard>
  );
}

