import { Fragment, useState } from 'react';
import { ChevronLeftIcon, CheckIcon, MonitorIcon, SmartphoneIcon, TabletIcon, NetworkIcon, CompassIcon, RouteIcon, PlayIcon, RefreshCwIcon, ArrowLeftIcon, FileTextIcon } from 'lucide-react';
import { BrowserWindow } from '../primitives/BrowserWindow';
import { PhoneFrame } from '../primitives/PhoneFrame';
import { PanelCard } from '../primitives/PanelCard';
import { ConnectorOverlay } from '../primitives/ConnectorOverlay';

const JOURNEY = ['اكتشاف', 'اختيار', 'تقديم الطلب', 'المتابعة'];

type SitemapNodeId = 'root' | 'services' | 'order' | 'ops';

const NODE_DETAILS: Record<SitemapNodeId, { name: string; route: string; depth: string; purpose: string; latency: string }> = {
  root: {
    name: 'الصفحة الرئيسية',
    route: '/',
    depth: 'المستوى 0',
    purpose: 'الاستقبال المباشر وعرض قيمة الحلول الشاملة.',
    latency: '8ms'
  },
  services: {
    name: 'الخدمات والحلول الرقمية',
    route: '/services',
    depth: 'المستوى 1',
    purpose: 'استعراض الـ 3 قطاعات والحلول المتاحة.',
    latency: '14ms'
  },
  order: {
    name: 'بوابة تقديم الطلبات (#GS-241)',
    route: '/order/gs-241',
    depth: 'المسار الحيوي',
    purpose: 'استلام نموذج الطلب السريع وتحويله للربط المباشر.',
    latency: '11ms'
  },
  ops: {
    name: 'غرفة العمليات والمتابعة',
    route: '/ops-room',
    depth: 'الربط الداخلي',
    purpose: 'مزامنة الحالة التشغيلية ولحظات المعالجة.',
    latency: '6ms'
  }
};

export function DirectionStage() {
  const [activeNode, setActiveNode] = useState<SitemapNodeId>('order');
  const [activeJourneyStep, setActiveJourneyStep] = useState<number>(2); // 'تقديم الطلب'
  const [activeViewport, setActiveViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isSimulating, setIsSimulating] = useState(false);

  // Route Flow Simulation
  const handleSimulateRoute = () => {
    setIsSimulating(true);
    const nodes: SitemapNodeId[] = ['root', 'services', 'order', 'ops'];
    let step = 0;
    
    const interval = setInterval(() => {
      setActiveNode(nodes[step]);
      setActiveJourneyStep(step);
      step++;
      if (step >= nodes.length) {
        clearInterval(interval);
        setTimeout(() => setIsSimulating(false), 800);
      }
    }, 700);
  };

  return (
    <>
      <div className="mx-auto max-w-[430px] lg:hidden">
        <DirectionBrowser
          activeNode={activeNode}
          setActiveNode={setActiveNode}
          activeViewport={activeViewport}
          isSimulating={isSimulating}
          handleSimulateRoute={handleSimulateRoute}
        />
      </div>

      <div className="relative hidden aspect-[16/11] w-full lg:block">
        <ConnectorOverlay variant="direction" />

        <div className="absolute left-[4%] top-[12%] z-20 w-[24%]">
          <DirectionContextCard isSimulating={isSimulating} handleSimulateRoute={handleSimulateRoute} />
        </div>

        <div className="absolute left-[4%] bottom-[12%] z-20 w-[24%]">
          <DirectionSecondaryCard activeViewport={activeViewport} setActiveViewport={setActiveViewport} />
        </div>

        <div className="absolute left-[31%] top-[14%] right-[25%] z-10 shadow-2xl transition-all">
          <DirectionBrowser
            activeNode={activeNode}
            setActiveNode={setActiveNode}
            activeViewport={activeViewport}
            isSimulating={isSimulating}
            handleSimulateRoute={handleSimulateRoute}
          />
        </div>

        <div className="absolute right-[4%] top-[8%] z-20 w-[20%]">
          <DirectionDetailCard
            activeNode={activeNode}
            activeJourneyStep={activeJourneyStep}
            setActiveJourneyStep={setActiveJourneyStep}
          />
        </div>

        <div className="absolute right-[4%] bottom-[8%] z-30 w-[16%]">
          <DirectionPhone activeNode={activeNode} />
        </div>
      </div>
    </>
  );
}

interface DirectionBrowserProps {
  activeNode: SitemapNodeId;
  setActiveNode: (n: SitemapNodeId) => void;
  activeViewport: 'desktop' | 'tablet' | 'mobile';
  isSimulating: boolean;
  handleSimulateRoute: () => void;
}

function DirectionBrowser({
  activeNode,
  setActiveNode,
  activeViewport,
  isSimulating,
  handleSimulateRoute
}: DirectionBrowserProps) {
  const getViewportWidthStyle = () => {
    if (activeViewport === 'mobile') return 'max-w-[280px] mx-auto transition-all duration-300';
    if (activeViewport === 'tablet') return 'max-w-[420px] mx-auto transition-all duration-300';
    return 'w-full transition-all duration-300';
  };

  return (
    <BrowserWindow address={`generalsolutions.sa${NODE_DETAILS[activeNode].route}`} badge="المرحلة ٠٢: الاتجاه والهيكل">
      <div className={`relative min-h-[220px] bg-white p-3.5 sm:min-h-[270px] lg:min-h-[310px] overflow-hidden ${getViewportWidthStyle()}`}>
        {/* Architectural Grid Background for IA */}
        <div className="absolute inset-0 opacity-[0.03]"
             style={{ backgroundImage: 'linear-gradient(#12203D 1px, transparent 1px), linear-gradient(90deg, #12203D 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

        {/* IA Sitemap Header */}
        <div className="relative z-10 mb-4 flex items-center justify-between border-b border-dashed border-mineral-300 pb-1.5">
          <div className="flex items-center gap-1.5">
            <NetworkIcon className="h-3.5 w-3.5 text-bronze-600" />
            <span className="font-kufi text-[10.5px] font-bold text-navy-900">هيكلية تدفق البيانات (IA)</span>
          </div>
          <button
            type="button"
            onClick={handleSimulateRoute}
            disabled={isSimulating}
            className="flex items-center gap-1.5 rounded border border-mineral-200 bg-white px-2 py-1 text-[8px] font-bold text-navy-900 hover:border-bronze-400 disabled:opacity-50 transition-all shadow-2xs">
            {isSimulating ? <RefreshCwIcon className="h-2.5 w-2.5 animate-spin text-bronze-600" /> : <PlayIcon className="h-2.5 w-2.5 text-bronze-600" />}
            {isSimulating ? 'جاري محاكاة التدفق...' : 'تشغيل تدفق المستخدم'}
          </button>
        </div>

        {/* Tree Blueprint Visual */}
        <div className="relative z-10 pr-2 pb-2">
          {/* Vertical stem connecting nodes */}
          <div className="absolute right-[19px] top-6 bottom-4 w-px bg-mineral-300 border-l border-dashed border-mineral-400" />

          {/* Root Level Node */}
          <div
            onClick={() => setActiveNode('root')}
            className={`relative flex cursor-pointer items-center justify-between rounded border p-2 transition-all ${
              activeNode === 'root' ? 'border-bronze-500 bg-bronze-50 shadow-sm' : 'border-mineral-300 bg-white hover:border-mineral-400'
            }`}>
            <div className="flex items-center gap-2 text-[9.5px] font-bold">
              <span className={`h-2.5 w-2.5 rounded-sm ${activeNode === 'root' ? 'bg-bronze-500 animate-pulse' : 'bg-navy-900'}`} />
              الواجهة الاستقبالية (/)
            </div>
            <span className="rounded bg-mineral-100 px-1.5 py-0.5 text-[8px] font-mono font-medium text-navy-900/60 border border-mineral-200">
              مستوى 0
            </span>
          </div>

          {/* Level 1 Subnodes */}
          <div className="mt-3 mr-6 space-y-4 relative">
            
            {/* Subnode 1: Services */}
            <div className="relative group">
              <div className="absolute -right-4 top-1/2 w-4 h-px bg-mineral-300 border-t border-dashed border-mineral-400" />
              <div
                onClick={() => setActiveNode('services')}
                className={`relative flex items-stretch rounded-lg border transition-all overflow-hidden cursor-pointer ${
                  activeNode === 'services'
                    ? 'border-bronze-500 bg-bronze-50 shadow-md ring-1 ring-bronze-500/20'
                    : 'border-mineral-300 bg-white hover:border-mineral-400'
                }`}>
                <div className="w-16 bg-mineral-100 border-l border-mineral-200 shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#12203D 1px, transparent 1px), linear-gradient(90deg, #12203D 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
                  <img src="/interface.webp" alt="Services Mock" className="w-full h-full object-cover opacity-60 mix-blend-multiply grayscale contrast-125 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                </div>
                <div className="flex-1 p-2.5 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2.5 w-2.5 rounded-sm ${activeNode === 'services' ? 'bg-bronze-500 animate-ping' : 'bg-mineral-400'}`} />
                      <span className="text-[10px] font-bold text-navy-900">بوابة الخدمات</span>
                    </div>
                    <span className="text-[8px] text-navy-900/60 pr-4">منصة استعراض وطلب الحلول</span>
                  </div>
                  <span className="text-[8px] font-mono text-navy-900/60 bg-white border border-mineral-200 px-1.5 py-0.5 rounded shadow-2xs">/services</span>
                </div>
              </div>
            </div>

            {/* Subnode 2: Order Gateway (#GS-241) */}
            <div className="relative group">
              <div className="absolute -right-4 top-1/2 w-4 h-px bg-bronze-400 border-t border-dashed border-bronze-500" />
              <div
                onClick={() => setActiveNode('order')}
                className={`relative flex items-stretch rounded-lg border-2 shadow-sm transition-all overflow-hidden cursor-pointer ${
                  activeNode === 'order'
                    ? 'border-bronze-600 bg-white shadow-md'
                    : 'border-bronze-400 bg-white hover:border-bronze-500'
                }`}>
                <div className="w-16 bg-bronze-50 border-l border-bronze-200 shrink-0 relative overflow-hidden flex items-center justify-center">
                  <FileTextIcon className="h-6 w-6 text-bronze-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex-1 p-2.5 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-navy-900">تذكرة طلب (#GS-241)</span>
                    </div>
                    <span className="text-[8px] text-navy-900/60 pr-4">نموذج الاستيعاب الديناميكي</span>
                  </div>
                  <span className="rounded bg-navy-900 px-2 py-1 text-[8px] font-bold text-white flex items-center gap-1 shadow-xs">
                    نقطة تحويل <ArrowLeftIcon className="h-2.5 w-2.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Subnode 3: Operational Dashboard */}
            <div className="relative group">
              <div className="absolute -right-4 top-1/2 w-4 h-px bg-mineral-300 border-t border-dashed border-mineral-400" />
              <div
                onClick={() => setActiveNode('ops')}
                className={`relative flex items-stretch rounded-lg border transition-all overflow-hidden cursor-pointer ${
                  activeNode === 'ops'
                    ? 'border-bronze-500 bg-bronze-50 shadow-md ring-1 ring-bronze-500/20'
                    : 'border-mineral-300 bg-white hover:border-mineral-400'
                }`}>
                <div className="w-16 bg-mineral-100 border-l border-mineral-200 shrink-0 relative overflow-hidden">
                  <img src="/dashboard.webp" alt="Dashboard Mock" className="w-full h-full object-cover opacity-60 mix-blend-multiply grayscale contrast-125 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                </div>
                <div className="flex-1 p-2.5 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2.5 w-2.5 rounded-sm ${activeNode === 'ops' ? 'bg-emerald-500 animate-pulse' : 'bg-mineral-400'}`} />
                      <span className="text-[10px] font-bold text-navy-900">غرفة التحكم</span>
                    </div>
                    <span className="text-[8px] text-navy-900/60 pr-4">لوحة العمليات التشغيلية</span>
                  </div>
                  <span className="text-[8px] font-mono text-navy-900/60 bg-white border border-mineral-200 px-1.5 py-0.5 rounded shadow-2xs">/ops-room</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrowserWindow>
  );
}

function DirectionPhone({ activeNode }: { activeNode: SitemapNodeId }) {
  const node = NODE_DETAILS[activeNode];

  return (
    <PhoneFrame className="hidden md:block">
      <div className="flex min-h-[160px] flex-col gap-2.5 bg-mineral-50 p-3 sm:min-h-[220px]">
        <div className="flex items-center justify-between border-b border-mineral-200 pb-1.5">
          <span className="font-kufi text-[9px] font-bold text-navy-900">القائمة الهيكلية</span>
          <span className="rounded-md bg-bronze-100 border border-bronze-200 px-1.5 py-0.5 text-[8px] font-semibold text-bronze-800 shadow-sm">موبايل</span>
        </div>
        <div className="space-y-2.5 flex-1 flex flex-col justify-center">
          <div className="rounded-lg border border-bronze-300 bg-white p-2.5 text-[9.5px] font-bold text-navy-900 flex items-center justify-between shadow-sm scale-[1.02] transition-all">
            <span className="truncate flex items-center gap-1.5"><span className="h-1.5 w-1.5 bg-bronze-500 rounded-full animate-pulse"/>{node.name}</span>
            <ChevronLeftIcon className="h-3 w-3 text-bronze-500 shrink-0" />
          </div>
          <div className="rounded-md border border-mineral-200 bg-white p-2 text-[8px] text-navy-900/70 flex justify-between items-center shadow-sm">
            <span className="flex items-center gap-1">مسار: <span className="font-mono text-bronze-700 bg-bronze-50 px-1 py-0.5 rounded border border-bronze-200">{node.route}</span></span>
            <span className="font-mono text-[8px] text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">{node.latency}</span>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

interface DirectionContextCardProps {
  isSimulating: boolean;
  handleSimulateRoute: () => void;
}

function DirectionContextCard({ isSimulating, handleSimulateRoute }: DirectionContextCardProps) {
  return (
    <PanelCard className="flex flex-col gap-2.5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-bronze-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center gap-1.5 border-b border-mineral-200 pb-2 relative z-10">
        <CompassIcon className="h-4 w-4 text-bronze-600" />
        <p className="font-kufi text-[12px] font-bold text-navy-900">توجيه البنية الرقمية</p>
      </div>
      <div className="flex flex-col gap-1.5 text-[9.5px] relative z-10">
        <div className="flex items-center gap-2 text-navy-900/80 font-medium">
          <CheckIcon className="h-3 w-3 text-emerald-600 shrink-0 bg-emerald-50 rounded-sm" /> تدرج معلوماتي واضح
        </div>
        <div className="flex items-center gap-2 text-navy-900/80 font-medium">
          <CheckIcon className="h-3 w-3 text-emerald-600 shrink-0 bg-emerald-50 rounded-sm" /> مسارات وصول فائقة السرعة
        </div>
        <div className="flex items-center gap-2 text-navy-900/80 font-medium">
          <CheckIcon className="h-3 w-3 text-emerald-600 shrink-0 bg-emerald-50 rounded-sm" /> جاهزية للربط التشغيلي
        </div>
      </div>
      <button
        type="button"
        onClick={handleSimulateRoute}
        disabled={isSimulating}
        className="mt-1 w-full rounded-md bg-navy-900 hover:bg-navy-800 text-white text-[9.5px] font-bold py-1.5 px-3 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 shadow-sm relative z-10">
        <PlayIcon className="h-3.5 w-3.5 text-bronze-400" />
        {isSimulating ? 'محاكاة المسار جارية...' : 'اختبار تدفق المسار تلقائياً'}
      </button>
    </PanelCard>
  );
}

interface DirectionDetailCardProps {
  activeNode: SitemapNodeId;
  activeJourneyStep: number;
  setActiveJourneyStep: (idx: number) => void;
}

function DirectionDetailCard({ activeNode, activeJourneyStep, setActiveJourneyStep }: DirectionDetailCardProps) {
  const node = NODE_DETAILS[activeNode];

  return (
    <PanelCard className="space-y-2.5 bg-gradient-to-bl from-white to-mineral-50/80 shadow-sm border border-mineral-200/80">
      <div className="border-b border-mineral-200 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-navy-900 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 bg-bronze-500 rounded-full" />
            {node.name}
          </span>
          <span className="rounded-md bg-bronze-50 border border-bronze-200 text-bronze-800 text-[8px] font-mono font-bold px-1.5 py-0.5 shadow-2xs">
            {node.depth}
          </span>
        </div>
        <p className="mt-1.5 text-[9.5px] text-navy-900/70 leading-relaxed font-medium">{node.purpose}</p>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <RouteIcon className="h-3.5 w-3.5 text-bronze-600" />
          <p className="text-[10px] font-bold text-navy-900">رحلة المستفيد (User Flow)</p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {JOURNEY.map((step, i) => (
            <Fragment key={step}>
              <span
                onClick={() => setActiveJourneyStep(i)}
                className={`cursor-pointer rounded-md px-2 py-1 text-[8px] font-bold transition-all shadow-2xs ${
                  activeJourneyStep === i
                    ? 'bg-navy-900 text-white shadow-sm scale-[1.02]'
                    : 'bg-white border border-mineral-200 text-navy-900/70 hover:bg-mineral-50 hover:border-mineral-300'
                }`}>
                {step}
              </span>
              {i < JOURNEY.length - 1 && <ChevronLeftIcon className="h-2.5 w-2.5 text-mineral-400" />}
            </Fragment>
          ))}
        </div>
      </div>
    </PanelCard>
  );
}

interface DirectionSecondaryCardProps {
  activeViewport: 'desktop' | 'tablet' | 'mobile';
  setActiveViewport: (vp: 'desktop' | 'tablet' | 'mobile') => void;
}

function DirectionSecondaryCard({ activeViewport, setActiveViewport }: DirectionSecondaryCardProps) {
  return (
    <PanelCard>
      <p className="mb-1.5 text-[9.5px] font-bold text-navy-900/70">تطابق القنوات والمتصفحات</p>
      <div className="grid grid-cols-3 gap-1.5 text-center">
        <button
          type="button"
          onClick={() => setActiveViewport('desktop')}
          className={`rounded-lg border p-1 transition-all ${
            activeViewport === 'desktop' ? 'border-bronze-500 bg-bronze-50 ring-2 ring-bronze-400/20' : 'border-mineral-200 bg-mineral-50 hover:border-mineral-300'
          }`}>
          <MonitorIcon className={`mx-auto h-3.5 w-3.5 ${activeViewport === 'desktop' ? 'text-bronze-600' : 'text-navy-900'}`} />
          <p className="mt-0.5 text-[7.5px] font-bold text-navy-900">1920px</p>
        </button>
        <button
          type="button"
          onClick={() => setActiveViewport('tablet')}
          className={`rounded-lg border p-1 transition-all ${
            activeViewport === 'tablet' ? 'border-bronze-500 bg-bronze-50 ring-2 ring-bronze-400/20' : 'border-mineral-200 bg-mineral-50 hover:border-mineral-300'
          }`}>
          <TabletIcon className={`mx-auto h-3.5 w-3.5 ${activeViewport === 'tablet' ? 'text-bronze-600' : 'text-navy-900'}`} />
          <p className="mt-0.5 text-[7.5px] font-bold text-navy-900">1024px</p>
        </button>
        <button
          type="button"
          onClick={() => setActiveViewport('mobile')}
          className={`rounded-lg border p-1 transition-all ${
            activeViewport === 'mobile' ? 'border-bronze-500 bg-bronze-50 ring-2 ring-bronze-400/20' : 'border-mineral-200 bg-mineral-50 hover:border-mineral-300'
          }`}>
          <SmartphoneIcon className={`mx-auto h-3.5 w-3.5 ${activeViewport === 'mobile' ? 'text-bronze-600' : 'text-navy-900'}`} />
          <p className="mt-0.5 text-[7.5px] font-bold text-navy-900">390px</p>
        </button>
      </div>
    </PanelCard>
  );
}

