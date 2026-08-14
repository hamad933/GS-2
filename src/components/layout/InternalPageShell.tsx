import type { ReactNode } from 'react';

interface InternalPageShellProps {
  eyebrow: string;
  title: string;
  intro: string;
  signal: string;
  children?: ReactNode;
}

export function InternalPageShell({
  eyebrow,
  title,
  intro,
  signal,
  children,
}: InternalPageShellProps) {
  return (
    <section className="internal-page" aria-labelledby="internal-page-title">
      <div className="internal-page__atmosphere" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="internal-page__frame">
        <div className="internal-page__signal" dir="ltr">
          <span>{signal}</span>
          <i aria-hidden="true" />
        </div>
        <div className="internal-page__content">
          <p className="internal-page__eyebrow">{eyebrow}</p>
          <h1 id="internal-page-title" data-route-focus tabIndex={-1}>{title}</h1>
          <p className="internal-page__intro">{intro}</p>
          {children}
        </div>
        <div className="internal-page__coordinate" aria-hidden="true" dir="ltr">
          <span>GS</span>
          <span>SYSTEM</span>
          <span>REFERENCE</span>
        </div>
      </div>
    </section>
  );
}
