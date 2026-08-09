export function Pedestal() {
  return (
    <div className="pointer-events-none absolute inset-x-[-8%] bottom-[-10%] z-0 flex justify-center">
      <div className="relative h-[120px] w-[120%] max-w-[1100px]">
        {/* Outer ambient glow shadow */}
        <div className="absolute inset-x-0 bottom-0 h-full rounded-[50%] bg-mineral-200/80 shadow-[0_45px_80px_-20px_rgba(18,32,61,0.25)]" />
        
        {/* Base Stage Ellipse */}
        <div className="absolute inset-x-[4%] bottom-[12%] h-[80%] rounded-[50%] border border-mineral-300/80 bg-mineral-100/90 backdrop-blur-sm" />
        
        {/* Inner Stage Platform */}
        <div className="absolute inset-x-[12%] bottom-[28%] h-[56%] rounded-[50%] border border-bronze-500/20 bg-mineral-50/90 shadow-inner">
          {/* Subtle Radial Axis Grid */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <div className="h-full w-px bg-dashed border-r border-navy-900/40" />
            <div className="h-px w-full bg-dashed border-b border-navy-900/40" />
          </div>
          
          {/* Stage Axis Coordinate Badges */}
          <div className="absolute left-[8%] top-1/2 -translate-y-1/2 rounded-full border border-mineral-300 bg-white/80 px-2 py-0.5 text-[8px] font-semibold text-navy-900/40">
            X: 01-04
          </div>
          <div className="absolute right-[8%] top-1/2 -translate-y-1/2 rounded-full border border-mineral-300 bg-white/80 px-2 py-0.5 text-[8px] font-semibold text-navy-900/40">
            RTL-CORE
          </div>
        </div>

        {/* Bronze Stage Focus Pulse Line */}
        <div className="absolute inset-x-[22%] bottom-[42%] h-[28%] rounded-[50%] border border-dashed border-bronze-500/40 bg-bronze-50/20" />
      </div>
    </div>
  );
}
