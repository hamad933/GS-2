import React from 'react';
import type { StageId } from '../../../types/hero';

interface ConnectorOverlayProps {
  variant: StageId;
}

export function ConnectorOverlay({ variant }: ConnectorOverlayProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible">
      
      <g fill="none" vectorEffect="non-scaling-stroke">
        {/* Base Architectural Grid - Always present to unify the stages */}
        <g stroke="#12203D" strokeWidth="0.2" opacity="0.08" strokeDasharray="1 4">
          {Array.from({length: 20}).map((_, i) => (
             <React.Fragment key={i}>
                <line x1={i * 5} y1="0" x2={i * 5} y2="100" />
                <line x1="0" y1={i * 5} x2="100" y2={i * 5} />
             </React.Fragment>
          ))}
        </g>
        
        {variant === 'need' && (
          <g>
            {/* Orthogonal blueprint measurements */}
            <path d="M 28 15 L 28 5 L 75 5 L 75 15" stroke="#12203D" strokeWidth="0.4" strokeDasharray="1 2" opacity="0.3" />
            <path d="M 16 20 L 5 20 L 5 80 L 16 80" stroke="#12203D" strokeWidth="0.4" strokeDasharray="1 2" opacity="0.3" />
            <path d="M 28 40 L 35 40 L 35 30 L 45 30" stroke="#AD7C46" strokeWidth="0.8" strokeDasharray="2 1.5" opacity="0.7" />
            <path d="M 75 80 L 85 80 L 85 70" stroke="#AD7C46" strokeWidth="0.6" strokeDasharray="1.5 2" opacity="0.5" />
            <circle cx="28" cy="40" r="1.2" fill="#AD7C46" />
            <circle cx="45" cy="30" r="0.8" fill="#12203D" />
            <circle cx="85" cy="70" r="0.8" fill="#12203D" />
          </g>
        )}

        {variant === 'direction' && (
          <g>
            {/* IA Routing Lines */}
            <path d="M 28 25 L 35 25 L 35 15 L 45 15" stroke="#AD7C46" strokeWidth="0.8" strokeDasharray="2 1.5" opacity="0.8" />
            <path d="M 28 40 L 35 40 L 35 50 L 50 50" stroke="#AD7C46" strokeWidth="0.8" strokeDasharray="2 1.5" opacity="0.8" />
            <path d="M 28 80 L 60 80 L 60 70 L 75 70" stroke="#12203D" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.5" />
            
            <rect x="27" y="24" width="2" height="2" fill="#AD7C46" />
            <rect x="27" y="39" width="2" height="2" fill="#AD7C46" />
            <rect x="27" y="79" width="2" height="2" fill="#12203D" opacity="0.5" />
            <circle cx="45" cy="15" r="0.8" fill="#12203D" />
            <circle cx="50" cy="50" r="0.8" fill="#12203D" />
            <circle cx="75" cy="70" r="0.8" fill="#12203D" />
          </g>
        )}

        {variant === 'build' && (
          <g>
            {/* Component Assembly Lines */}
            <path d="M 28 20 L 35 20 L 35 40 L 48 40" stroke="#AD7C46" strokeWidth="1" opacity="0.9" />
            <path d="M 28 85 L 50 85 L 50 60 L 60 60" stroke="#10B981" strokeWidth="1" opacity="0.8" />
            <path d="M 70 20 L 80 20 L 80 35 L 85 35" stroke="#12203D" strokeWidth="0.8" strokeDasharray="1.5 1.5" opacity="0.6" />
            
            <circle cx="28" cy="20" r="1.2" fill="#AD7C46" />
            <circle cx="28" cy="85" r="1.2" fill="#10B981" />
            <circle cx="48" cy="40" r="1.5" fill="#12203D" />
            <circle cx="60" cy="60" r="1.2" fill="#10B981" />
            <circle cx="70" cy="20" r="1" fill="#12203D" opacity="0.6" />
            <circle cx="85" cy="35" r="1" fill="#12203D" opacity="0.6" />
          </g>
        )}

        {variant === 'launch' && (
          <g>
            {/* Operational Handoff Lines - Glowing pulses */}
            <path d="M 30 30 L 40 30 L 40 50 L 55 50 L 55 25 L 75 25" stroke="#10B981" strokeWidth="1.2" strokeDasharray="4 2" opacity="0.9" />
            <path d="M 30 75 L 45 75 L 45 85 L 75 85" stroke="#AD7C46" strokeWidth="1" strokeDasharray="3 1.5" opacity="0.8" />
            <path d="M 65 50 L 65 75 L 75 75" stroke="#12203D" strokeWidth="0.8" strokeDasharray="1 2" opacity="0.5" />
            
            <circle cx="30" cy="30" r="1.5" fill="#10B981" />
            <circle cx="75" cy="25" r="2" fill="#10B981" />
            <circle cx="30" cy="75" r="1.2" fill="#AD7C46" />
            <circle cx="75" cy="85" r="1.2" fill="#AD7C46" />
            <circle cx="75" cy="75" r="1" fill="#12203D" opacity="0.5" />
          </g>
        )}
      </g>
    </svg>
  );
}
