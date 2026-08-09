import React, { useState } from 'react';
import { FileTextIcon, TargetIcon, LayersIcon, CheckCircle2Icon, EyeIcon, MousePointerClickIcon, PlusIcon } from 'lucide-react';
import { BrowserWindow } from '../primitives/BrowserWindow';
import { PhoneFrame } from '../primitives/PhoneFrame';
import { PanelCard } from '../primitives/PanelCard';
import { ConnectorOverlay } from '../primitives/ConnectorOverlay';

type WireframeSection = 'hero' | 'nav' | 'services';

const INITIAL_GOALS = [
  'تحديد أهداف الخدمة الرقمية بدقة',
  'معالجة انقطاع الطلبات بين الموقع والتشغيل',
  'تحسين تجربة المستفيد وسرعة الوصول'
];

const SECTION_NOTES: Record<WireframeSection, { title: string; note: string; spec: string }> = {
  hero: {
    title: 'قسم البطل (Hero Section)',
    note: 'يركز على رسالة القيمة الواضحة مع زر إجراء مباشر (CTA) لربط طلب الخدمة بالمباشرة.',
    spec: 'المقاس: 100vh | الخط: IBM Plex / Kufi | الأزرار: تفاعلية سريعة'
  },
  nav: {
    title: 'الهوية والتنقل (Nav & Header)',
    note: 'شريط تنقل مرن يدعم الوصول السريع لخدمات الشركات ومتابعة الطلب.',
    spec: 'ثابت (Sticky) | القائمة الرئيسية | التجاوب التام'
  },
  services: {
    title: 'مُكوّنات الخدمات (Service Grid)',
    note: 'تقسيم ثلاثي للخدمات الرئيسية مع بطاقات تفاعلية واضحة ومعاينة ميزان الأداء.',
    spec: 'شبكة 3 أعمدة | التأثيرات التفاعلية | أداء عالي'
  }
};

export function NeedStage() {
  const [activeSection, setActiveSection] = useState<WireframeSection>('hero');
  const [goals, setGoals] = useState<string[]>(INITIAL_GOALS);
  const [checkedGoals, setCheckedGoals] = useState<boolean[]>([true, true, false]);
  const [highFidelity, setHighFidelity] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  const toggleGoal = (index: number) => {
    setCheckedGoals(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    setGoals(prev => [...prev, newGoalText.trim()]);
    setCheckedGoals(prev => [...prev, true]);
    setLastActionMessage(`تمت إضافة الهدف: "${newGoalText.trim()}"`);
    setNewGoalText('');
    setTimeout(() => setLastActionMessage(null), 3000);
  };

  return (
    <>
      <div className="mx-auto max-w-[430px] lg:hidden">
        <NeedBrowser
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          highFidelity={highFidelity}
          setHighFidelity={setHighFidelity}
          setLastActionMessage={setLastActionMessage}
        />
      </div>

      <div className="relative hidden aspect-[16/11] w-full lg:block">
        <ConnectorOverlay variant="need" />

        <div className="absolute left-[4%] top-[12%] w-[24%] z-20">
          <NeedContextCard
            goals={goals}
            checkedGoals={checkedGoals}
            onToggleGoal={toggleGoal}
            newGoalText={newGoalText}
            setNewGoalText={setNewGoalText}
            onAddGoal={handleAddGoal}
            lastActionMessage={lastActionMessage}
          />
        </div>

        <div className="absolute left-[4%] bottom-[12%] w-[24%] z-20">
          <NeedSecondaryCard goalsCount={goals.length} completedCount={checkedGoals.filter(Boolean).length} />
        </div>

        <div className="absolute left-[31%] top-[8%] right-[25%] z-10 shadow-2xl">
          <NeedBrowser
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            highFidelity={highFidelity}
            setHighFidelity={setHighFidelity}
            setLastActionMessage={setLastActionMessage}
          />
        </div>

        <div className="absolute right-[4%] top-[12%] z-20 w-[18%]">
          <NeedDetailCard activeSection={activeSection} />
        </div>

        <div className="absolute right-[4%] bottom-[8%] z-30 w-[16%]">
          <NeedPhone activeSection={activeSection} />
        </div>
      </div>
    </>
  );
}

interface NeedBrowserProps {
  activeSection: WireframeSection;
  setActiveSection: (sec: WireframeSection) => void;
  highFidelity: boolean;
  setHighFidelity: (val: boolean) => void;
  setLastActionMessage: (msg: string | null) => void;
}

function NeedBrowser({
  activeSection,
  setActiveSection,
  highFidelity,
  setHighFidelity,
  setLastActionMessage
}: NeedBrowserProps) {
  const handleButtonClick = (btnLabel: string) => {
    setLastActionMessage(`تم النقر على "${btnLabel}" في المعاينة`);
    setTimeout(() => setLastActionMessage(null), 2500);
  };

  return (
    <BrowserWindow address="generalsolutions.sa/discovery" badge="المرحلة ٠١: الاكتشاف والاحتياج">
      <div className="relative min-h-[230px] bg-white p-3.5 sm:min-h-[270px] lg:min-h-[310px] overflow-hidden">
        {/* Architectural Grid Background for Blueprint */}
        <div className="absolute inset-0 opacity-[0.03]"
             style={{ backgroundImage: 'linear-gradient(#12203D 1px, transparent 1px), linear-gradient(90deg, #12203D 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        
        {/* Blueprint Control Bar */}
        <div className="relative z-10 flex items-center justify-between border-b border-dashed border-mineral-300 pb-1.5 mb-4 text-[8px] font-mono text-navy-900/60">
          <span className="flex items-center gap-1.5 font-sans font-bold">
            <MousePointerClickIcon className="h-3 w-3 text-bronze-600 animate-pulse" />
            انقر على الأقسام للتفاعل
          </span>
          <button
            type="button"
            onClick={() => setHighFidelity(!highFidelity)}
            className="flex items-center gap-1.5 rounded bg-bronze-50 border border-bronze-300 px-2 py-1 text-[8px] font-bold text-bronze-800 transition-all hover:bg-bronze-100 shadow-2xs">
            <EyeIcon className="h-2.5 w-2.5" />
            {highFidelity ? 'عرض الهيكل السلكي' : 'عرض النسخة الملونة'}
          </button>
        </div>

        {/* Blueprint Top Navbar Wireframe */}
        <div
          onClick={() => setActiveSection('nav')}
          className={`relative z-10 mb-4 flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-all ${
            activeSection === 'nav'
              ? 'border-2 border-bronze-500 bg-bronze-50 shadow-md ring-4 ring-bronze-500/10'
              : 'border-dashed border-mineral-300 bg-white hover:border-mineral-400 hover:shadow-sm'
          }`}>
          <div className="flex items-center gap-2.5">
            <div className={`h-5 w-24 rounded-md transition-colors ${highFidelity ? 'bg-navy-900 shadow-sm' : 'bg-mineral-200'}`} />
          </div>
          <div className="flex gap-2">
            {['الرئيسية', 'الخدمات', 'المشاريع', 'تواصل'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick(item);
                }}
                className={`rounded-md px-3 py-1 text-[9px] transition-all ${
                  highFidelity
                    ? 'font-bold text-navy-900 hover:bg-bronze-50 hover:text-bronze-700'
                    : 'bg-mineral-50 text-mineral-400 hover:bg-mineral-100'
                }`}>
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Wireframe Section */}
        <div
          onClick={() => setActiveSection('hero')}
          className={`relative z-10 mb-4 cursor-pointer rounded-2xl border p-5 transition-all overflow-hidden ${
            activeSection === 'hero'
              ? 'border-2 border-bronze-500 bg-bronze-50 shadow-lg ring-4 ring-bronze-500/10'
              : 'border-dashed border-mineral-300 bg-white hover:border-mineral-400 hover:shadow-md'
          }`}>
          {/* Faded Blueprint Image Background */}
          <div className="absolute inset-0 opacity-[0.08] mix-blend-multiply pointer-events-none transition-opacity">
            <img src="/architecture.webp" alt="Blueprint" className="w-full h-full object-cover" />
          </div>
          
          <div className="relative z-10 flex items-start justify-between gap-6">
            <div className="flex-1 space-y-4">
              {activeSection === 'hero' && (
                <span className="inline-block mb-1 rounded-md bg-white px-2.5 py-1 text-[9px] font-bold text-bronze-700 shadow-sm border border-bronze-200 animate-fade-in-up">
                  قسم البطل
                </span>
              )}
              <div className="space-y-2">
                <div className={`h-8 w-4/5 rounded-lg shadow-sm transition-colors ${highFidelity ? 'bg-navy-900' : 'bg-mineral-200'}`} />
                <div className={`h-8 w-3/5 rounded-lg shadow-sm transition-colors ${highFidelity ? 'bg-navy-900' : 'bg-mineral-200'}`} />
              </div>
              <div className="space-y-1.5 w-3/4">
                <div className={`h-2.5 w-full rounded-md transition-colors ${highFidelity ? 'bg-navy-900/60' : 'bg-mineral-100'}`} />
                <div className={`h-2.5 w-4/5 rounded-md transition-colors ${highFidelity ? 'bg-navy-900/60' : 'bg-mineral-100'}`} />
              </div>
              
              <div className="pt-2 flex items-center gap-3">
                <div className={`h-10 w-32 rounded-lg shadow-sm transition-all ${highFidelity ? 'bg-bronze-600' : 'border-2 border-dashed border-mineral-300 bg-mineral-50'}`} />
                <div className={`h-10 w-32 rounded-lg transition-all ${highFidelity ? 'border border-mineral-300 bg-white shadow-sm' : 'border border-dashed border-mineral-200 bg-mineral-50/50'}`} />
              </div>
            </div>
            
            {/* Structural Graphic Placeholder */}
            <div className="hidden md:block w-40 shrink-0">
              <div className={`w-full aspect-[4/3] rounded-xl border-2 transition-all shadow-inner relative overflow-hidden flex flex-col items-center justify-center gap-3 ${highFidelity ? 'border-mineral-200 bg-mineral-50' : 'border-dashed border-mineral-300 bg-mineral-50/50'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-mineral-200/50 to-transparent opacity-50" />
                <div className={`h-12 w-20 rounded-md border shadow-sm z-10 transition-colors ${highFidelity ? 'border-mineral-300 bg-white' : 'border-dashed border-mineral-300 bg-mineral-100'}`} />
                <div className={`h-2 w-24 rounded-md z-10 transition-colors ${highFidelity ? 'bg-mineral-300' : 'bg-mineral-200'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Services Wireframe Grid */}
        <div
          onClick={() => setActiveSection('services')}
          className={`relative z-10 grid cursor-pointer grid-cols-3 gap-4 rounded-2xl border p-5 transition-all ${
            activeSection === 'services'
              ? 'border-2 border-bronze-500 bg-bronze-50 shadow-lg ring-4 ring-bronze-500/10'
              : 'border-dashed border-mineral-300 bg-white hover:border-mineral-400 hover:shadow-md'
          }`}>
          {activeSection === 'services' && (
            <span className="absolute -top-3 right-4 rounded-md bg-white px-2.5 py-1 text-[9px] font-bold text-bronze-700 shadow-sm border border-bronze-200 animate-fade-in-up">
              قسم الخدمات
            </span>
          )}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`rounded-xl border p-3 transition-all flex flex-col gap-3 group ${
                highFidelity
                  ? 'border-mineral-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-1'
                  : 'border-dashed border-mineral-300 bg-mineral-50'
              }`}>
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${highFidelity ? 'bg-bronze-50 border border-bronze-100 group-hover:bg-bronze-100' : 'bg-mineral-200'}`}>
                {highFidelity && <div className="h-5 w-5 bg-bronze-400 rounded-md opacity-60" />}
              </div>
              <div className="space-y-2 w-full">
                <div className={`h-3 w-3/4 rounded-md transition-colors ${highFidelity ? 'bg-navy-900' : 'bg-mineral-200'}`} />
                <div className="space-y-1.5">
                  <div className={`h-2 w-full rounded-md transition-colors ${highFidelity ? 'bg-navy-900/40' : 'bg-mineral-100'}`} />
                  <div className={`h-2 w-5/6 rounded-md transition-colors ${highFidelity ? 'bg-navy-900/40' : 'bg-mineral-100'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BrowserWindow>
  );
}

function NeedPhone({ activeSection }: { activeSection: WireframeSection }) {
  return (
    <PhoneFrame className="hidden md:block">
      <div className="flex min-h-[160px] flex-col gap-3 bg-mineral-50 p-3 sm:min-h-[220px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-bronze-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between border-b border-dashed border-mineral-300 pb-2 relative z-10">
          <span className="text-[9.5px] font-bold text-navy-900/60">عرض الجوال</span>
          <span className="text-[8.5px] font-mono font-bold text-bronze-700 bg-white px-1.5 py-0.5 rounded border border-mineral-200 shadow-sm">390px</span>
        </div>
        
        <div className="flex flex-col gap-2.5 relative z-10 flex-1">
          {/* Header Mock */}
          <div className={`h-4 w-full rounded-md transition-colors ${activeSection === 'nav' ? 'bg-navy-900 shadow-sm scale-[1.02]' : 'bg-navy-900/10'}`} />
          
          {/* Hero Mock */}
          <div className={`rounded-xl border p-3 transition-all flex flex-col gap-2 ${
            activeSection === 'hero' ? 'border-bronze-500 bg-bronze-50 shadow-md ring-2 ring-bronze-500/10 scale-[1.02]' : 'border-dashed border-mineral-300 bg-white/60'
          }`}>
            <div className="h-3 w-4/5 rounded-md bg-bronze-400" />
            <div className="h-2 w-3/5 rounded-sm bg-bronze-300/80" />
            <div className="h-10 w-full rounded-lg bg-bronze-200/50 mt-1" />
          </div>
          
          {/* Services Mock */}
          <div className={`h-12 w-full rounded-xl border transition-all ${
            activeSection === 'services' ? 'border-bronze-500 bg-bronze-50 shadow-md ring-2 ring-bronze-500/10 scale-[1.02]' : 'border-dashed border-mineral-300 bg-white/60'
          }`} />
        </div>
      </div>
    </PhoneFrame>
  );
}

interface NeedContextCardProps {
  goals: string[];
  checkedGoals: boolean[];
  onToggleGoal: (idx: number) => void;
  newGoalText: string;
  setNewGoalText: (val: string) => void;
  onAddGoal: (e: React.FormEvent) => void;
  lastActionMessage: string | null;
}

function NeedContextCard({
  goals,
  checkedGoals,
  onToggleGoal,
  newGoalText,
  setNewGoalText,
  onAddGoal,
  lastActionMessage
}: NeedContextCardProps) {
  const completedCount = checkedGoals.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / (goals.length || 1)) * 100);

  return (
    <PanelCard className="flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-mineral-200 pb-2">
        <div className="flex items-center gap-2">
          <TargetIcon className="h-4 w-4 text-bronze-600 shrink-0" />
          <p className="font-kufi text-[12px] font-bold text-navy-900">أهداف الاستكشاف</p>
        </div>
        <span className="text-[9px] font-mono text-bronze-700 bg-bronze-50 px-2 py-0.5 rounded-md border border-bronze-300 shadow-sm">
          {completedCount}/{goals.length} ({progressPercent}%)
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full rounded-full bg-mineral-100 border border-mineral-200 overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-bronze-500 to-bronze-400 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {lastActionMessage && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 p-1.5 text-[9px] font-bold text-emerald-700 shadow-sm animate-fade-in-up">
          ✓ {lastActionMessage}
        </div>
      )}

      {/* Goals Checklist */}
      <ul className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
        {goals.map((goal, idx) => (
          <li
            key={`${goal}-${idx}`}
            onClick={() => onToggleGoal(idx)}
            className="flex cursor-pointer items-start gap-2.5 text-[10px] leading-relaxed text-navy-900/80 hover:text-navy-900 group">
            <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md transition-all shadow-sm ${
              checkedGoals[idx] ? 'bg-bronze-600 text-white' : 'border border-mineral-300 bg-white group-hover:border-bronze-400'
            }`}>
              {checkedGoals[idx] && <CheckCircle2Icon className="h-3 w-3" />}
            </span>
            <span className={`transition-all ${checkedGoals[idx] ? 'font-semibold text-navy-900/60 line-through' : 'font-medium'}`}>
              {goal}
            </span>
          </li>
        ))}
      </ul>

      {/* Interactive Add Goal Input */}
      <form onSubmit={onAddGoal} className="mt-2 flex items-center gap-2">
        <input
          type="text"
          value={newGoalText}
          onChange={(e) => setNewGoalText(e.target.value)}
          placeholder="إضافة متطلب جديد..."
          className="flex-1 rounded-md border border-mineral-300 bg-white px-2.5 py-1.5 text-[9.5px] font-medium text-navy-900 placeholder:text-navy-900/40 focus:border-bronze-500 focus:ring-1 focus:ring-bronze-500 focus:outline-none transition-all shadow-sm"
        />
        <button
          type="submit"
          disabled={!newGoalText.trim()}
          className="rounded-md bg-navy-900 hover:bg-navy-800 disabled:bg-navy-900/50 text-white p-1.5 transition-all shadow-sm">
          <PlusIcon className="h-4 w-4" />
        </button>
      </form>
    </PanelCard>
  );
}

function NeedDetailCard({ activeSection }: { activeSection: WireframeSection }) {
  const info = SECTION_NOTES[activeSection];

  return (
    <PanelCard className="border border-bronze-200 bg-gradient-to-br from-white to-bronze-50/50 shadow-md space-y-2 relative overflow-hidden">
      <div className="absolute -left-4 -top-4 w-16 h-16 bg-bronze-500/5 rounded-full blur-xl" />
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <FileTextIcon className="h-4 w-4 text-bronze-600" />
          <p className="text-[11px] font-bold text-navy-900">{info.title}</p>
        </div>
        <span className="rounded-md bg-bronze-100 text-bronze-800 px-2 py-0.5 text-[8px] font-mono font-bold border border-bronze-200">محدد</span>
      </div>
      <p className="text-[10px] leading-relaxed text-navy-900/80 font-medium relative z-10">
        {info.note}
      </p>
      <div className="text-[9px] font-mono font-bold text-navy-900 bg-white p-1.5 rounded-md border border-mineral-200 shadow-sm relative z-10">
        {info.spec}
      </div>
    </PanelCard>
  );
}

interface NeedSecondaryCardProps {
  goalsCount: number;
  completedCount: number;
}

function NeedSecondaryCard({ goalsCount, completedCount }: NeedSecondaryCardProps) {
  return (
    <PanelCard className="relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-20 h-20 bg-bronze-500/5 rounded-full blur-xl pointer-events-none" />
      <div className="flex items-center gap-2 mb-2.5 relative z-10">
        <LayersIcon className="h-4 w-4 text-bronze-600" />
        <p className="text-[11px] font-bold text-navy-900/80 group-hover:text-navy-900 transition-colors">مخرجات مرحلة الاحتياج</p>
      </div>
      <div className="flex flex-wrap gap-1.5 relative z-10">
        {['واجهة العميل', 'بوابة الطلبات', 'لوحة التحكم', 'الربط البرمجي'].map((chip) => (
          <span
            key={chip}
            className="rounded-md border border-bronze-200 bg-bronze-50/50 px-2.5 py-1 text-[9px] font-semibold text-bronze-800 shadow-sm transition-all hover:bg-bronze-100 hover:scale-105">
            {chip}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-mineral-200 pt-2 relative z-10">
        <span className="text-[9px] text-navy-900/60 font-bold">حالة الجاهزية</span>
        <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 shadow-sm flex items-center gap-1">
          <CheckCircle2Icon className="h-3 w-3" />
          {completedCount}/{goalsCount} مكتمل
        </span>
      </div>
    </PanelCard>
  );
}

