import type { ReactNode } from 'react';

type MediaSlot = { src?: string; alt: string; placeholder?: ReactNode };
type ProjectMediaProps = { desktop: MediaSlot; mobile: MediaSlot; detail?: MediaSlot; label: string };

function Slot({ slot, className }: { slot: MediaSlot; className: string }) {
  return <div className={className}>{slot.src ? <img src={slot.src} alt={slot.alt} /> : <div className="engineered-placeholder" role="img" aria-label={slot.alt}>{slot.placeholder}</div>}</div>;
}

export function ProjectMedia({ desktop, mobile, detail, label }: ProjectMediaProps) {
  return (
    <figure className="project-media" aria-label={label}>
      <figcaption><span>المشروع المختار</span><i /> استكشف المشروع</figcaption>
      <Slot slot={desktop} className="media-desktop" />
      <Slot slot={mobile} className="media-mobile" />
      {detail && <Slot slot={detail} className="media-detail" />}
    </figure>
  );
}
