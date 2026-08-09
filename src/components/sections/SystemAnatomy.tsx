import { useState } from 'react';

const layers = [
  { id: 'experience', index: '01', title: 'التجربة', role: 'السطح الذي يراه الناس ويتحركون خلاله بوضوح.' },
  { id: 'operations', index: '02', title: 'التشغيل', role: 'المسارات التي تنظّم العمل وتحوّل الإجراء إلى خطوة قابلة للمتابعة.' },
  { id: 'data', index: '03', title: 'البيانات', role: 'المعلومات التي تنتقل بين التجربة والعمل وتبقي السياق متصلاً.' },
  { id: 'integrations', index: '04', title: 'نقاط الربط', role: 'المواضع المحددة التي يمكن أن تصل النظام بخدماته المحيطة عند الحاجة.' },
  { id: 'architecture', index: '05', title: 'البنية', role: 'الأساس المنظّم الذي يحمل أجزاء النظام ويحدد علاقتها ببعضها.' },
];

export function SystemAnatomy() {
  const [active, setActive] = useState(layers[0]);

  return (
    <section id="system-anatomy" className="system-anatomy" aria-labelledby="anatomy-title" data-active={active.id}>
      <header className="anatomy-heading">
        <p><span>04</span> تشريح النظام</p>
        <h2 id="anatomy-title">ما يظهر على السطح<br />تحمله منظومة كاملة.</h2>
        <p>نفتح المنتج إلى طبقاته المترابطة؛ كل طبقة تؤدي دوراً، ولا تعمل بمعزل عن التي تليها.</p>
      </header>
      <div className="anatomy-field">
        <div className="anatomy-spine" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <div className="anatomy-layers" aria-label="طبقات النظام">
          {layers.map((layer) => (
            <button key={layer.id} type="button" aria-pressed={active.id === layer.id}
              onClick={() => setActive(layer)} onFocus={() => setActive(layer)}>
              <span>{layer.index}</span><strong>{layer.title}</strong><i aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="anatomy-role" aria-live="polite">
          <small>دور الطبقة / {active.index}</small><strong>{active.title}</strong><p>{active.role}</p>
        </div>
      </div>
    </section>
  );
}
