import { useState } from 'react';
import anatomyObject from '../../assets/gs-w05/GS_A04_System_Anatomy_Object.png';

const layers = [
  { id: 'discovery', index: '01', title: 'الاكتشاف', role: 'نفهم الاحتياج والسياق والقيود قبل أن نرسم شكل الحل.' },
  { id: 'direction', index: '02', title: 'الاتجاه', role: 'نحوّل ما تعلّمناه إلى قرار واضح وبنية يمكن البناء عليها.' },
  { id: 'build', index: '03', title: 'البناء', role: 'تتشكّل الواجهات والمكوّنات والمسارات كمنتج واحد متماسك.' },
  { id: 'integration', index: '04', title: 'التكامل', role: 'تلتقي أجزاء التجربة مع التشغيل ونقاط الربط اللازمة.' },
  { id: 'launch', index: '05', title: 'الإطلاق والنمو', role: 'نطلق أساسًا منظمًا يمكن تطويره مع تغيّر العمل.' },
];

export function SystemAnatomy() {
  const [active, setActive] = useState(layers[0]);

  return (
    <section id="system-anatomy" className="system-anatomy" aria-labelledby="anatomy-title" data-active={active.id}>
      <img className="production-environment anatomy-environment" src={anatomyObject} alt="" aria-hidden="true" loading="lazy" />
      <header className="anatomy-heading">
        <p><span>04</span> كيف نبني الأنظمة الرقمية</p>
        <h2 id="anatomy-title">المنتج الجيد<br />منظومة مترابطة.</h2>
        <p>نفتح النظام إلى مستوياته؛ كل مستوى يضيف وضوحًا ويحافظ على صلته بما قبله وما بعده.</p>
      </header>
      <div className="anatomy-field">
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
