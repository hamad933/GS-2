import { Link } from 'react-router-dom';
import { InternalPageShell } from '../components/layout/InternalPageShell';

export function NotFound() {
  return (
    <InternalPageShell
      eyebrow="المسار غير متاح"
      title="هذه الصفحة غير موجودة"
      intro="قد يكون الرابط قد تغيّر. يمكنك العودة إلى الصفحة الرئيسية ومتابعة الاختيار من هناك."
      signal="ERROR / 404">
      <Link className="internal-page__action" to="/">
        العودة إلى الرئيسية
      </Link>
    </InternalPageShell>
  );
}
