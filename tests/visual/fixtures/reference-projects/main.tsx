import ReactDOM from 'react-dom/client';
import { ReferenceProjectsBody } from '../../../../src/features/reference-projects';
import type { ReferenceLocale } from '../../../../src/data/reference-projects';

const locale: ReferenceLocale = new URLSearchParams(window.location.search).get('locale') === 'en' ? 'en' : 'ar';
document.documentElement.lang = locale;
document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';

const root = document.getElementById('root');
if (root) ReactDOM.createRoot(root).render(<ReferenceProjectsBody locale={locale} />);
