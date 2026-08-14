import { InternalPageShell } from '../components/layout/InternalPageShell';
import type { PublicPageContent } from '../routes/publicRoutes';

interface PublicRoutePageProps {
  page: PublicPageContent;
}

export function PublicRoutePage({ page }: PublicRoutePageProps) {
  return (
    <InternalPageShell
      eyebrow={page.eyebrow}
      title={page.label}
      intro={page.intro}
      signal={page.signal}
    />
  );
}
