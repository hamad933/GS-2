import type { ReactNode } from 'react';

type MediaSlot = { src?: string; alt: string; placeholder?: ReactNode };
type ProjectMediaProps = { desktop: MediaSlot; mobile: MediaSlot; detail?: MediaSlot; label: string };

const ILLUSTRATIVE_EVIDENCE_LABEL = 'تصور توضيحي غير توثيقي؛ ليس لقطة من المنتج ولا دليلًا عليه.';

function Slot({ slot, className }: { slot: MediaSlot; className: string }) {
  return (
    <div className={className}>
      {slot.src ? (
        <img src={slot.src} alt={slot.alt} loading="lazy" decoding="async" />
      ) : (
        <div
          className="engineered-placeholder"
          role="img"
          data-evidence="illustrative-placeholder"
          aria-label={`${ILLUSTRATIVE_EVIDENCE_LABEL} ${slot.alt}`}
        >
          {slot.placeholder}
        </div>
      )}
    </div>
  );
}

export function ProjectMedia({ desktop, mobile, detail, label }: ProjectMediaProps) {
  const containsIllustrativePlaceholders = !desktop.src || !mobile.src || Boolean(detail && !detail.src);

  return (
    <figure
      className="project-media"
      aria-label={label}
      data-evidence={containsIllustrativePlaceholders ? 'contains-illustrative-placeholders' : 'provided-media'}
    >
      <figcaption>
        {containsIllustrativePlaceholders
          ? 'تصورات توضيحية غير توثيقية — لا تمثل لقطات من المنتج أو دليلًا عليه.'
          : 'وسائط المشروع المرجعي.'}
      </figcaption>
      <Slot slot={desktop} className="media-desktop" />
      <Slot slot={mobile} className="media-mobile" />
      {detail && <Slot slot={detail} className="media-detail" />}
    </figure>
  );
}
