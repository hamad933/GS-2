import React from 'react';

interface PanelCardProps {
  className?: string;
  children: React.ReactNode;
  dark?: boolean;
  highlight?: boolean;
}

export function PanelCard({ className = '', children, dark = false, highlight = false }: PanelCardProps) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 p-3.5 backdrop-blur-md ${
        highlight
          ? 'border-bronze-500/60 bg-bronze-50/90 text-navy-900 shadow-[0_25px_50px_-20px_rgba(173,124,70,0.3)]'
          : dark
          ? 'border-navy-700 bg-navy-900/95 text-mineral-50 shadow-[0_30px_60px_-25px_rgba(18,32,61,0.5)]'
          : 'border-mineral-300/80 bg-white/95 text-navy-900 shadow-[0_25px_55px_-25px_rgba(18,32,61,0.25)]'
      } ${className}`}>
      {children}
    </div>
  );
}
