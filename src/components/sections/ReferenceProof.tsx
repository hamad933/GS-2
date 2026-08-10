import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ProjectMedia } from '../project/ProjectMedia';
import { referenceProjects, type ReferenceProject } from '../../data/homeShowcase';

function IllustrativeSurface({ project, compact = false }: { project: ReferenceProject; compact?: boolean }) {
  return (
    <div className={`illustrative-ui ui-${project.visual} ${compact ? 'is-compact' : ''}`}>
      <header><b>GS</b><span>معاينة تصميمية قابلة لاستبدال الوسائط</span><i /></header>
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
      <header className="proof-heading"><p><span>03</span> أعمال مختارة</p><h2 id="proof-title">مشروع واحد.<br />في مركز المشهد.</h2><div><strong>{active.family}</strong><p>{active.statement}</p></div></header>
      <div className="proof-theatre">
        <ProjectMedia label={`معاينة تصميمية لمشروع ${active.family}`}
          desktop={{ alt: `معاينة تصميمية مؤقتة لسطح المكتب لمشروع ${active.family}`, placeholder: <IllustrativeSurface project={active} /> }}
          mobile={{ alt: `معاينة تصميمية مؤقتة للهاتف لمشروع ${active.family}`, placeholder: <IllustrativeSurface project={active} compact /> }}
          detail={{ alt: `تفصيل تصميمي مؤقت للمشروع ${active.index}`, placeholder: <div className="detail-study"><small>{active.index}</small><strong>{active.focus[1]}</strong><span /></div> }} />
        <div className="project-index" aria-label="اختر مشروعًا">
          {referenceProjects.map((project) => <button key={project.id} type="button" aria-pressed={project.id === active.id} onClick={() => setActiveId(project.id)} onFocus={() => setActiveId(project.id)}><i>{project.index}</i><span>{project.family}</span></button>)}
        </div>
      </div>
      <p className="proof-disclosure">المعاينات الحالية تصميمية ومؤقتة؛ ستُستبدل بوسائط المشاريع المعتمدة دون تغيير بنية المسرح.</p>
    </section>
  );
}
