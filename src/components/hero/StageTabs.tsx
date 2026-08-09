import React, { Fragment } from 'react';
import { CheckIcon, ChevronLeftIcon, PauseIcon, PlayIcon } from 'lucide-react';
import { STAGE_ORDER, STAGE_COPY } from '../../data/heroContent';

interface StageTabsProps {
  activeIndex: number;
  onSelect: (index: number) => void;
  onPause: () => void;
  onResume: () => void;
  progressKey: number;
  duration: number;
  paused: boolean;
  reducedMotion: boolean;
}

export function StageTabs({
  activeIndex,
  onSelect,
  onPause,
  onResume,
  progressKey,
  duration,
  paused,
  reducedMotion
}: StageTabsProps) {
  return (
    <div
      className="relative z-30 flex items-center gap-1 overflow-x-auto px-6 pb-3 sm:gap-1.5 sm:px-8 lg:px-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="مراحل رحلة الحل">
      
      {!reducedMotion &&
      <button
        type="button"
        onClick={paused ? onResume : onPause}
        className="ml-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-navy-900/10 text-navy-900/45 transition-colors hover:border-navy-900/25 hover:text-navy-900"
        aria-label={paused ? 'متابعة التحوّل التلقائي' : 'إيقاف التحوّل التلقائي'}
        title={paused ? 'متابعة' : 'إيقاف مؤقت'}>
        
          {paused ? <PlayIcon className="h-3 w-3" fill="currentColor" /> : <PauseIcon className="h-3 w-3" fill="currentColor" />}
        </button>
      }
      {STAGE_ORDER.map((id, i) => {
        const copy = STAGE_COPY[id];
        const isActive = i === activeIndex;
        const isDone = i < activeIndex;

        return (
          <Fragment key={id}>
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(i)}
              className={`group relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition-colors ${
              isActive ?
              'font-semibold text-navy-900' :
              isDone ?
              'text-navy-900/55 hover:text-navy-900/80' :
              'text-navy-900/35 hover:text-navy-900/55'}`
              }>
              
              {isActive && <span className="h-1.5 w-1.5 rounded-full bg-bronze-500" />}
              {copy.tabLabel}
              {isDone && <CheckIcon className="h-3 w-3 text-bronze-600" strokeWidth={2.5} />}
              {isActive &&
              <span className="absolute inset-x-2 -bottom-0.5 h-[2px] overflow-hidden rounded-full bg-navy-900/10">
                  {!reducedMotion &&
                <span
                  key={progressKey}
                  className="block h-full w-full origin-right bg-bronze-500"
                  style={{
                    animation: `stage-progress ${duration}ms linear forwards`,
                    animationPlayState: paused ? 'paused' : 'running'
                  }} />

                }
                </span>
              }
            </button>
            {i < STAGE_ORDER.length - 1 &&
            <ChevronLeftIcon className="h-3.5 w-3.5 shrink-0 text-navy-900/20" />
            }
          </Fragment>);

      })}
    </div>);

}