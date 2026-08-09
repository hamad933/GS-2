import React from 'react';

interface RequestTagProps {
  tone?: 'solid' | 'muted' | 'bronze' | 'emerald';
  className?: string;
  pulse?: boolean;
}

export function RequestTag({ tone = 'solid', className = '', pulse = false }: RequestTagProps) {
  return (
    <span
      dir="ltr"
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[10px] font-bold tracking-wider transition-all ${
        tone === 'solid'
          ? 'bg-navy-900 text-mineral-50 shadow-sm'
          : tone === 'bronze'
          ? 'bg-bronze-500 text-white shadow-sm'
          : tone === 'emerald'
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'border border-dashed border-navy-900/30 bg-mineral-100/60 text-navy-900/60'
      } ${className}`}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
      )}
      #GS-241
    </span>
  );
}
