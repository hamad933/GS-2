import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ProjectMedia } from '../project/ProjectMedia';
import { referenceProjects, type ReferenceProject } from '../../data/homeShowcase';

function IllustrativeSurface({ project, compact = false }: { project: ReferenceProject; compact?: boolean }) {
  return (
    <div className={`illustrative-ui ui-${project.visual} ${compact ? 'is-compact' : ''}`}>
      <header><b>GS</b><span>تصوّر واجهة / غير تابع لعميل</span><i /></header>
      <main>
        <div className="ui-copy"><small>{project.family}</small><strong>{project.visual === 'service' ? 'ابدأ من حاجتك' : project.visual === 'commerce' ? 'تفاصيل تستحق الاقتراب' : 'ما يحتاج انتباهك الآن'}</strong><p>{project.statement}</p><button type="button" tabIndex={-1}>خطوة توضيحية <ArrowLeft /></button></div>
        <div className="ui-art" aria-hidden="true"><span /><span /><span /><b>{project.index}</b></div>
      </main>
      <footer>{project.focus.map((item) => <span key={item}>{item}</span>)}</footer>
    </div>
  );
}

export function ReferenceProof() {
  const [activeId, setActiveId] = useState(referenceProjects[0].id);
  const active = referenceProjects.find((project) => project.id === activeId) ?? referenceProjects[0];
  return (
    <section id="reference-proof" className="reference-proof" aria-labelledby="proof-title" data-project={active.id}>
      <header className="proof-heading"><p><span>03</span> مرجع بصري للحل</p><h2 id="proof-title">حين يصبح المسار<br />سطحاً يمكن اختباره.</h2><div><strong>{active.title}</strong><p>{active.statement}</p></div></header>
      <div className="proof-theatre">
        <ProjectMedia label={`تصوّر توضيحي: ${active.title}`}
          desktop={{ alt: `واجهة سطح مكتب توضيحية لمجال ${active.family}، وليست مشروع عميل حقيقياً`, placeholder: <IllustrativeSurface project={active} /> }}
          mobile={{ alt: `واجهة هاتف توضيحية لمجال ${active.family}، وليست مشروع عميل حقيقياً`, placeholder: <IllustrativeSurface project={active} compact /> }}
          detail={{ alt: `تفصيل بصري توضيحي من التصور ${active.index}`, placeholder: <div className="detail-study"><small>تفصيل / {active.index}</small><strong>{active.focus[1]}</strong><span /></div> }} />
        <div className="project-index" aria-label="اختر التصور المرجعي">
          {referenceProjects.map((project) => <button key={project.id} type="button" aria-pressed={project.id === active.id} onClick={() => setActiveId(project.id)} onFocus={() => setActiveId(project.id)}><i>{project.index}</i><span>{project.family}</span></button>)}
        </div>
      </div>
      <p className="proof-disclosure">جميع الأسطح المعروضة تصوّرات توضيحية مصممة لبيان بنية التجربة، وليست أعمال عملاء أو نتائج تشغيلية.</p>
    </section>
  );
}
