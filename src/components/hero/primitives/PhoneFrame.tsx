import React from 'react';

interface PhoneFrameProps {
  className?: string;
  children: React.ReactNode;
}

export function PhoneFrame({ className = '', children }: PhoneFrameProps) {
  return (
    <div
      className={`relative rounded-[28px] border-[3.5px] border-navy-900 bg-navy-950 p-1.5 shadow-[0_35px_65px_-20px_rgba(18,32,61,0.55)] transition-transform duration-300 ${className}`}>
      {/* Top Dynamic Island Notch */}
      <div className="absolute top-2.5 left-1/2 z-20 h-2.5 w-14 -translate-x-1/2 rounded-full bg-navy-950 flex items-center justify-center">
        <span className="h-1 w-1 rounded-full bg-navy-800 ml-2" />
        <span className="h-1 w-2.5 rounded-full bg-navy-800" />
      </div>

      {/* Screen Container */}
      <div className="relative overflow-hidden rounded-[20px] bg-white pt-5 pb-3">
        {children}
        
        {/* Bottom Home Indicator Bar */}
        <div className="absolute bottom-1 left-1/2 z-20 h-1 w-12 -translate-x-1/2 rounded-full bg-navy-900/30" />
      </div>
    </div>
  );
}
