import React, { useState } from 'react';
import { PaletteIcon, BarChart3Icon, CheckCircle2Icon, ArrowLeftIcon, SparklesIcon, Code2Icon, EyeIcon, SendIcon, TypeIcon, SlidersIcon } from 'lucide-react';
import { BrowserWindow } from '../primitives/BrowserWindow';
import { PhoneFrame } from '../primitives/PhoneFrame';
import { PanelCard } from '../primitives/PanelCard';
import { ConnectorOverlay } from '../primitives/ConnectorOverlay';

export function BuildStage() {
  const [activeColor, setActiveColor] = useState('#AD7C46'); // Bronze
  const [activeFont, setActiveFont] = useState<'plex' | 'kufi' | 'tajawal'>('kufi');
  const [layoutDensity, setLayoutDensity] = useState<'standard' | 'compact'>('standard');
  const [showCode, setShowCode] = useState(false);
  const [clientCompany, setClientCompany] = useState('شركة الأفق الرقمية');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const triggerFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3500);
  };

  return (
    <>
      <div className="mx-auto max-w-[430px] lg:hidden">
        <BuildBrowser
          activeColor={activeColor}
          activeFont={activeFont}
          layoutDensity={layoutDensity}
          showCode={showCode}
          setShowCode={setShowCode}
          clientCompany={clientCompany}
          setClientCompany={setClientCompany}
          formSubmitted={formSubmitted}
          triggerFormSubmit={triggerFormSubmit}
        />
      </div>

      <div className="relative hidden aspect-[16/11] w-full lg:block">
        <ConnectorOverlay variant="build" />

        <div className="absolute left-[4%] top-[8%] z-20 w-[24%]">
          <BuildSystemCard
            activeColor={activeColor}
            setActiveColor={setActiveColor}
            activeFont={activeFont}
            setActiveFont={setActiveFont}
          />
        </div>

        <div className="absolute left-[4%] bottom-[8%] z-20 w-[24%]">
          <BuildResponsiveCard layoutDensity={layoutDensity} setLayoutDensity={setLayoutDensity} />
        </div>

        <div className="absolute left-[30%] top-[10%] right-[24%] z-30 shadow-2xl scale-[1.02] ring-1 ring-bronze-500/20 rounded-xl">
          <BuildBrowser
            activeColor={activeColor}
            activeFont={activeFont}
            layoutDensity={layoutDensity}
            showCode={showCode}
            setShowCode={setShowCode}
            clientCompany={clientCompany}
            setClientCompany={setClientCompany}
            formSubmitted={formSubmitted}
            triggerFormSubmit={triggerFormSubmit}
          />
        </div>

        <div className="absolute right-[4%] top-[12%] z-20 w-[18%]">
          <BuildDashboardCard formSubmitted={formSubmitted} />
        </div>

        <div className="absolute right-[4%] bottom-[12%] z-40 w-[16%]">
          <BuildPhone formSubmitted={formSubmitted} clientCompany={clientCompany} />
        </div>
      </div>
    </>
  );
}

interface BuildBrowserProps {
  activeColor: string;
  activeFont: 'plex' | 'kufi' | 'tajawal';
  layoutDensity: 'standard' | 'compact';
  showCode: boolean;
  setShowCode: (val: boolean) => void;
  clientCompany: string;
  setClientCompany: (val: string) => void;
  formSubmitted: boolean;
  triggerFormSubmit: (e?: React.FormEvent) => void;
}

function BuildBrowser({
  activeColor,
  activeFont,
  layoutDensity,
  showCode,
  setShowCode,
  clientCompany,
  setClientCompany,
  formSubmitted,
  triggerFormSubmit
}: BuildBrowserProps) {
  const getFontFamilyClass = () => {
    if (activeFont === 'plex') return 'font-sans';
    if (activeFont === 'tajawal') return 'font-sans tracking-tight';
    return 'font-kufi';
  };

  return (
    <BrowserWindow address="generalsolutions.sa/build" badge="المرحلة ٠٣: التصميم والتطوير (الذروة البصرية)">
      <div className={`relative min-h-[250px] overflow-hidden bg-[#0A0D14] text-white sm:min-h-[290px] lg:min-h-[330px] ${getFontFamilyClass()}`}>
        
        {/* Top Control Toggle */}
        <div className="relative z-20 flex items-center justify-between border-b border-white/5 px-3.5 py-2 bg-[#0F141F] text-[9px]">
          <span className="font-mono text-bronze-400 flex items-center gap-1.5 opacity-90">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {showCode ? 'Component Tree (Live)' : 'Preview: generalsolutions.sa/app'}
          </span>
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-1.5 rounded bg-white/5 border border-white/10 px-2 py-1 font-bold text-white hover:bg-white/10 transition-all shadow-sm">
            {showCode ? <EyeIcon className="h-3 w-3 text-bronze-300" /> : <Code2Icon className="h-3 w-3 text-emerald-400" />}
            {showCode ? 'عرض الواجهة (UI)' : 'عرض الكود (Code)'}
          </button>
        </div>

        <div className="relative h-full flex flex-col">
          {showCode ? (
            <div className="flex-1 p-4 font-mono text-[9.5px] leading-relaxed overflow-x-auto bg-[#0A0D14]">
              <p className="text-mineral-400 mb-2">{'// General Solutions - Dynamic UI Component'}</p>
              <div className="space-y-1">
                <p className="text-white">
                  <span className="text-[#F97583]">import</span> {'{ '} 
                  <span className="text-[#B392F0]">HeroSection</span>, 
                  <span className="text-[#B392F0]"> CompanyHeader</span>
                  {' }'} <span className="text-[#F97583]">from</span> <span className="text-[#9ECBFF]">'@gs/ui'</span>;
                </p>
                <p className="text-white mt-3">
                  &lt;<span className="text-[#85E89D]">HeroSection</span> 
                  <span className="text-[#B392F0]"> theme</span>=<span className="text-[#9ECBFF]">"{activeColor}"</span> 
                  <span className="text-[#B392F0]"> font</span>=<span className="text-[#9ECBFF]">"{activeFont}"</span>&gt;
                </p>
                <p className="pl-4 text-white">
                  &lt;<span className="text-[#85E89D]">CompanyHeader</span>&gt;
                  {clientCompany}
                  &lt;/<span className="text-[#85E89D]">CompanyHeader</span>&gt;
                </p>
                <p className="pl-4 text-white">
                  &lt;<span className="text-[#85E89D]">Badge</span> 
                  <span className="text-[#B392F0]"> status</span>=<span className="text-[#9ECBFF]">"connected"</span> /&gt;
                </p>
                <p className="pl-4 text-white">
                  &lt;<span className="text-[#85E89D]">QuickOrderForm</span> 
                  <span className="text-[#B392F0]"> state</span>=<span className="text-[#9ECBFF]">{formSubmitted ? '"submitted"' : '"idle"'}</span> /&gt;
                </p>
                <p className="text-white">&lt;/<span className="text-[#85E89D]">HeroSection</span>&gt;</p>
              </div>
            </div>
          ) : (
            /* Live Web App Canvas */
            <div className={`flex-1 relative z-10 p-5 ${layoutDensity === 'compact' ? 'space-y-4' : 'space-y-5'} bg-[#F8F9FA] text-navy-900 overflow-hidden`}>
              
              {/* Architectural Grid Background */}
              <div className="absolute inset-0 opacity-[0.03]"
                   style={{ backgroundImage: 'linear-gradient(#12203D 1px, transparent 1px), linear-gradient(90deg, #12203D 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              
              {/* Soft UI background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.08] pointer-events-none blur-3xl" style={{ backgroundColor: activeColor }} />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-[0.05] pointer-events-none blur-3xl" style={{ backgroundColor: activeColor }} />

              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-mineral-200 pb-3 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold text-white shadow-md transition-colors"
                    style={{ backgroundColor: activeColor }}>
                    GS
                  </div>
                  <span className="text-sm font-bold text-navy-900 tracking-tight">الحلول العامة</span>
                </div>
                <div className="hidden sm:flex items-center gap-5 text-[11px] font-bold text-navy-900/60">
                  <span className="text-navy-900 border-b-2 pb-1.5" style={{ borderColor: activeColor }}>الرئيسية</span>
                  <span className="hover:text-navy-900 transition-colors cursor-pointer">الخدمات</span>
                  <span className="hover:text-navy-900 transition-colors cursor-pointer">المشاريع</span>
                </div>
                <button
                  type="button"
                  style={{ backgroundColor: activeColor }}
                  className="hidden sm:inline-flex rounded-lg px-3.5 py-1.5 text-[9.5px] font-bold text-white shadow-sm hover:opacity-90 transition-opacity">
                  اطلب استشارة
                </button>
              </div>

              {/* Hero Section Banner */}
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-center mt-2 relative z-10">
                <div className="space-y-3.5 pr-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-mineral-200 px-3 py-1 text-[9.5px] font-bold text-navy-900 shadow-sm">
                    <SparklesIcon className="h-3.5 w-3.5" style={{ color: activeColor }} />
                    منظومة حلول رقمية مخصصة
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold leading-[1.2] text-navy-900">
                    تمكين التحول الرقمي بأعلى معايير الأداء
                  </h2>
                  <p className="text-[11px] leading-relaxed text-navy-900/70 max-w-[320px]">
                    نربط واجهة المستفيد بغرفة العمليات بشكل متكامل وسريع، لضمان استمرارية الأعمال بأعلى كفاءة.
                  </p>
                  
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      style={{ backgroundColor: activeColor }}
                      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-bold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                      تقديم طلب خدمة
                      <ArrowLeftIcon className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/60 flex items-center gap-1.5 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      متصل بالتشغيل
                    </span>
                  </div>
                </div>

                {/* Visual / Form Column */}
                <div className="relative">
                  {/* Decorative backdrop for the form */}
                  <div className="absolute -inset-4 bg-white/40 border border-white/60 backdrop-blur-xl rounded-2xl shadow-xl shadow-navy-900/5 -rotate-2 scale-[1.02] origin-bottom-left" />
                  
                  {/* Interactive Form Preview Card */}
                  <form onSubmit={triggerFormSubmit} className="relative rounded-xl border border-mineral-200 bg-white p-5 shadow-2xl shadow-navy-900/10 space-y-4">
                    <div className="absolute top-0 right-0 w-full h-1 rounded-t-xl" style={{ backgroundColor: activeColor }} />
                    
                    <div className="flex justify-between items-center text-[11px] font-bold text-navy-900">
                      <span>طلب خدمة سريع</span>
                      <span className="text-[9px] text-bronze-600 font-mono bg-bronze-50 px-2 py-0.5 rounded border border-bronze-200">#GS-241</span>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-bold text-navy-900/60">اسم الجهة أو الشركة</label>
                      <input
                        type="text"
                        value={clientCompany}
                        onChange={(e) => setClientCompany(e.target.value)}
                        placeholder="أدخل اسم الجهة..."
                        className="w-full rounded-lg bg-mineral-50 border border-mineral-200 px-3 py-2 text-[10px] font-bold text-navy-900 placeholder:text-navy-900/40 focus:outline-none focus:border-bronze-400 focus:ring-1 focus:ring-bronze-400 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-bold text-navy-900/60">نوع الخدمة المطلوبة</label>
                      <div className="w-full rounded-lg bg-mineral-50 border border-mineral-200 px-3 py-2 text-[10px] text-navy-900/50">
                        أنظمة تشغيلية
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      style={{ backgroundColor: formSubmitted ? '#10B981' : activeColor }}
                      className="relative w-full rounded-lg py-2.5 text-[10px] font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-2">
                      {formSubmitted ? (
                        <>
                          <CheckCircle2Icon className="h-4 w-4" />
                          تم الربط بنجاح
                        </>
                      ) : (
                        <>
                          <SendIcon className="h-4 w-4" />
                          إرسال واستكمال الطلب
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </BrowserWindow>
  );
}

function BuildPhone({ formSubmitted, clientCompany }: { formSubmitted: boolean; clientCompany: string }) {
  return (
    <PhoneFrame className="hidden md:block">
      <div className="flex min-h-[160px] flex-col gap-2.5 bg-navy-900 p-3 text-white sm:min-h-[220px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-bronze-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5 relative z-10">
          <span className="font-kufi text-[9px] font-bold text-bronze-300">عرض الجوال</span>
          <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shadow-sm">تجاوب 100%</span>
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-center space-y-3">
          <div className="text-center space-y-1">
            <div className="mx-auto h-6 w-6 rounded bg-bronze-500/20 flex items-center justify-center border border-bronze-500/30">
              <span className="h-3 w-3 bg-bronze-400 rounded-sm" />
            </div>
            <p className="font-bold text-[10px] text-white truncate">{clientCompany || 'حلول رقمية'}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 space-y-2 backdrop-blur-sm shadow-inner">
            <p className="text-[8px] font-semibold text-mineral-200">طلب خدمة (#GS-241)</p>
            <div className={`h-6 rounded-md text-[8.5px] font-bold text-white flex items-center justify-center transition-all shadow-sm ${
              formSubmitted ? 'bg-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/20' : 'bg-bronze-600 ring-2 ring-bronze-600/20 shadow-bronze-600/20'
            }`}>
              {formSubmitted ? '✓ تم الاستلام' : 'اختبار الإرسال'}
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

interface BuildSystemCardProps {
  activeColor: string;
  setActiveColor: (hex: string) => void;
  activeFont: 'plex' | 'kufi' | 'tajawal';
  setActiveFont: (font: 'plex' | 'kufi' | 'tajawal') => void;
}

function BuildSystemCard({ activeColor, setActiveColor, activeFont, setActiveFont }: BuildSystemCardProps) {
  const SWATCHES = [
    { name: 'Bronze', hex: '#AD7C46' },
    { name: 'Navy', hex: '#12203D' },
    { name: 'Emerald', hex: '#10B981' },
    { name: 'Amber', hex: '#D97706' }
  ];

  return (
    <PanelCard className="flex flex-col gap-2.5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-colors duration-700" style={{ backgroundColor: `${activeColor}15` }} />
      <div className="flex items-center justify-between border-b border-mineral-200 pb-1.5 relative z-10">
        <div className="flex items-center gap-1.5">
          <PaletteIcon className="h-4 w-4 transition-colors duration-300" style={{ color: activeColor }} />
          <p className="font-kufi text-[12px] font-bold text-navy-900">نظام التصميم (Tokens)</p>
        </div>
        <span className="rounded-md bg-navy-900 px-2 py-0.5 text-[8.5px] font-mono font-bold text-white shadow-sm">v2.4</span>
      </div>

      {/* Color Swatches */}
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-1.5">
          <p className="text-[9px] font-bold text-navy-900/80">الألوان التفاعلية:</p>
          <span className="text-[8.5px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-mineral-200 shadow-2xs transition-colors duration-300" style={{ color: activeColor }}>{activeColor}</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {SWATCHES.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setActiveColor(item.hex)}
              className="flex flex-col items-center group/btn relative">
              <div
                className={`h-5 w-full rounded-md border shadow-sm transition-all duration-300 ${
                  activeColor === item.hex ? 'ring-2 ring-offset-1 scale-105 z-10' : 'border-black/10 hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: item.hex,
                  ...(activeColor === item.hex ? { ringColor: item.hex } : {}) 
                }}
              />
              <span className={`mt-1 text-[7.5px] font-mono font-semibold transition-colors ${activeColor === item.hex ? 'text-navy-900' : 'text-navy-900/50 group-hover/btn:text-navy-900/80'}`}>{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Switcher */}
      <div>
        <p className="text-[8.5px] font-semibold text-navy-900/70 mb-1 flex items-center gap-1">
          <TypeIcon className="h-3 w-3 text-bronze-600" /> نمط الخط العربي:
        </p>
        <div className="grid grid-cols-3 gap-1">
          {(['kufi', 'plex', 'tajawal'] as const).map((font) => (
            <button
              key={font}
              type="button"
              onClick={() => setActiveFont(font)}
              className={`rounded border py-0.5 text-[8px] font-bold transition-all ${
                activeFont === font
                  ? 'border-bronze-500 bg-bronze-50 text-bronze-800 ring-1 ring-bronze-400'
                  : 'border-mineral-200 bg-mineral-50 text-navy-900/60 hover:border-mineral-300'
              }`}>
              {font === 'kufi' ? 'كوفي' : font === 'plex' ? 'بليكس' : 'تاواجل'}
            </button>
          ))}
        </div>
      </div>
    </PanelCard>
  );
}

function BuildDashboardCard({ formSubmitted }: { formSubmitted: boolean }) {
  return (
    <PanelCard className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center justify-between border-b border-mineral-200 pb-1.5 relative z-10">
        <div className="flex items-center gap-1.5">
          <BarChart3Icon className="h-4 w-4 text-bronze-600" />
          <p className="font-kufi text-[11px] font-bold text-navy-900">مؤشرات التطوير</p>
        </div>
        <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
          <CheckCircle2Icon className="h-3 w-3" /> جاهز
        </span>
      </div>

      {/* Animated Performance Bars */}
      <div className="mt-2.5 space-y-2 relative z-10">
        <div className="flex justify-between text-[9px] font-bold text-navy-900/80">
          <span>التطابق البصري:</span>
          <span className="text-bronze-700">100%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-mineral-100 overflow-hidden shadow-inner border border-mineral-200">
          <div className="h-full w-full bg-gradient-to-r from-bronze-500 to-bronze-400 rounded-full" />
        </div>

        <div className="flex justify-between text-[9px] font-bold text-navy-900/80">
          <span>اختبار الاتصال السريع:</span>
          <span className={`transition-all duration-300 ${formSubmitted ? 'text-emerald-700' : 'text-navy-900/60'}`}>
            {formSubmitted ? '✓ ناجح (0.2s)' : 'جاهز'}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-mineral-100 overflow-hidden shadow-inner border border-mineral-200">
          <div className={`h-full rounded-full transition-all duration-700 ease-out ${formSubmitted ? 'w-full bg-gradient-to-r from-emerald-500 to-emerald-400' : 'w-3/4 bg-bronze-300/80'}`} />
        </div>
      </div>
    </PanelCard>
  );
}

interface BuildResponsiveCardProps {
  layoutDensity: 'standard' | 'compact';
  setLayoutDensity: (d: 'standard' | 'compact') => void;
}

function BuildResponsiveCard({ layoutDensity, setLayoutDensity }: BuildResponsiveCardProps) {
  return (
    <PanelCard className="relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-tr from-white to-mineral-50/50 pointer-events-none" />
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-1.5">
          <SlidersIcon className="h-3.5 w-3.5 text-navy-900/80" />
          <p className="text-[10px] font-bold text-navy-900">كثافة الواجهة</p>
        </div>
        <div className="flex gap-1 p-0.5 rounded-lg bg-mineral-100 border border-mineral-200 shadow-inner">
          <button
            type="button"
            onClick={() => setLayoutDensity('standard')}
            className={`rounded-md px-2 py-0.5 text-[8px] font-bold transition-all ${
              layoutDensity === 'standard' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-900/60 hover:text-navy-900/80'
            }`}>
            ممتد
          </button>
          <button
            type="button"
            onClick={() => setLayoutDensity('compact')}
            className={`rounded-md px-2 py-0.5 text-[8px] font-bold transition-all ${
              layoutDensity === 'compact' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-900/60 hover:text-navy-900/80'
            }`}>
            مدمج
          </button>
        </div>
      </div>
      <div className="rounded-lg bg-[#0F141F] border border-navy-800 p-2 font-mono text-[8px] space-y-1 relative z-10 shadow-inner">
        <p className="text-emerald-400 flex items-center gap-1"><span className="h-1 w-1 bg-emerald-400 rounded-full animate-pulse" /> Tailwind compiled</p>
        <p className="text-bronze-300 flex items-center gap-1"><span className="h-1 w-1 bg-bronze-300 rounded-full" /> RTL layout active</p>
      </div>
    </PanelCard>
  );
}

