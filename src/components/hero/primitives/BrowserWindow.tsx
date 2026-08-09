import React from 'react';
import { LockIcon } from 'lucide-react';

interface BrowserWindowProps {
  address?: string;
  className?: string;
  children: React.ReactNode;
  dark?: boolean;
  badge?: string;
}

export function BrowserWindow({
  address = 'generalsolutions.sa',
  className = '',
  children,
  dark = false,
  badge
}: BrowserWindowProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
        dark
          ? 'border-navy-700 bg-navy-900 text-white shadow-[0_45px_90px_-25px_rgba(18,32,61,0.6)]'
          : 'border-mineral-300/80 bg-white text-navy-900 shadow-[0_45px_90px_-35px_rgba(18,32,61,0.35)]'
      } ${className}`}>
      
      {/* Chrome Bar */}
      <div
        className={`flex items-center justify-between border-b px-4 py-2.5 ${
          dark ? 'border-navy-800 bg-navy-950/70' : 'border-mineral-200 bg-mineral-100/70'
        }`}>
        {/* Window controls */}
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </div>

        {/* Address pill */}
        <div
          dir="ltr"
          className={`flex max-w-[60%] items-center justify-center gap-1.5 truncate rounded-full px-3.5 py-1 text-[10px] font-medium transition-colors ${
            dark
              ? 'bg-navy-900/90 text-mineral-200/80 border border-navy-700/60'
              : 'bg-white text-navy-900/60 border border-mineral-200 shadow-sm'
          }`}>
          <LockIcon className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
          <span className="truncate">{address}</span>
        </div>

        {/* Optional status badge or space filler */}
        {badge ? (
          <span className="rounded-full bg-bronze-500/15 border border-bronze-500/30 px-2 py-0.5 text-[9px] font-semibold text-bronze-600">
            {badge}
          </span>
        ) : (
          <div className="w-12" />
        )}
      </div>

      {/* Page Body */}
      <div className="relative">{children}</div>
    </div>
  );
}
