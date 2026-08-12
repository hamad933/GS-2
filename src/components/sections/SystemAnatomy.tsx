import { useState } from 'react';
import anatomyObject from '../../assets/gs-home-v2/04_GS_System_Anatomy_Clean_Production_Asset.webp';
import './SystemAnatomy.v2.css';

type LayerId = 'discovery' | 'direction' | 'build' | 'integration' | 'launch';

type Layer = {
  id: LayerId;
  index: string;
  title: string;
  role: string;
  anchorY: number;
  route: string;
};

const layers: Layer[] = [
  {
    id: 'discovery',
    index: '01',
    title: 'الاكتشاف',
    role: 'نفهم الاحتياج والسياق والقيود قبل أن نرسم شكل الحل.',
    anchorY: 20,
    route: 'M 558 439 H 674 L 705 408 V 244 L 738 208 H 772',
  },
  {
    id: 'direction',
    index: '02',
    title: 'الاتجاه',
    role: 'نحوّل ما تعلّمناه إلى قرار واضح وبنية يمكن البناء عليها.',
    anchorY: 32,
    route: 'M 558 511 H 685 L 716 480 V 365 L 750 328 H 784',
  },
  {
    id: 'build',
    index: '03',
    title: 'البناء',
    role: 'تتشكّل الواجهات والمكوّنات والمسارات كمنتج واحد متماسك.',
    anchorY: 46,
    route: 'M 558 583 H 696 L 728 551 V 500 L 762 463 H 796',
  },
  {
    id: 'integration',
    index: '04',
    title: 'التكامل',
    role: 'تلتقي أجزاء التجربة مع التشغيل ونقاط الربط اللازمة.',
    anchorY: 60,
    route: 'M 558 655 H 708 L 741 622 V 617 L 775 581 H 809',
  },
  {
    id: 'launch',
    index: '05',
    title: 'الإطلاق والنمو',
    role: 'نطلق أساسًا منظمًا يمكن تطويره مع تغيّر العمل.',
    anchorY: 71,
    route: 'M 558 727 H 720 L 753 694 H 818',
  },
];

function StageIcon({ id }: { id: LayerId }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      {id === 'discovery' && (
        <>
          <path {...common} d="M8 4H4v4M24 4h4v4M28 24v4h-4M8 28H4v-4" />
          <circle {...common} cx="16" cy="16" r="6" />
          <circle {...common} cx="16" cy="16" r="1.5" />
        </>
      )}
      {id === 'direction' && (
        <>
          <circle {...common} cx="16" cy="16" r="11" />
          <path {...common} d="m20.5 10.5-2.6 7.4-7.4 2.6 2.6-7.4 7.4-2.6Z" />
          <circle {...common} cx="16" cy="16" r="1.2" />
        </>
      )}
      {id === 'build' && (
        <>
          <rect {...common} x="12" y="4" width="8" height="7" rx="1" />
          <rect {...common} x="3.5" y="21" width="8" height="7" rx="1" />
          <rect {...common} x="20.5" y="21" width="8" height="7" rx="1" />
          <path {...common} d="M16 11v5M7.5 21v-5h17v5" />
        </>
      )}
      {id === 'integration' && (
        <>
          <ellipse {...common} cx="16" cy="7" rx="9" ry="3.5" />
          <path {...common} d="M7 7v7c0 2 4 3.5 9 3.5s9-1.5 9-3.5V7M7 14v7c0 2 4 3.5 9 3.5s9-1.5 9-3.5v-7" />
          <path {...common} d="M11 13.4c1.4.4 3.1.6 5 .6s3.6-.2 5-.6" />
        </>
      )}
      {id === 'launch' && (
        <>
          <path {...common} d="M16 3.5c3.1 2.3 6.5 3.5 10 4v7.1c0 6.2-4.1 10.7-10 13.9-5.9-3.2-10-7.7-10-13.9V7.5c3.5-.5 6.9-1.7 10-4Z" />
          <path {...common} d="m11.5 16 3 3 6-7" />
        </>
      )}
    </svg>
  );
}

function PrincipleIcon({ kind }: { kind: 'clarity' | 'continuity' | 'growth' }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      {kind === 'clarity' && <path d="M5 16h7m8 0h7M16 5v7m0 8v7M11 11l10 10m0-10L11 21" />}
      {kind === 'continuity' && <path d="M9 10a8 8 0 0 1 12 0l2 2m0-5v5h-5M23 22a8 8 0 0 1-12 0l-2-2m0 5v-5h5" />}
      {kind === 'growth' && <path d="M7 24 24 7m-9 0h9v9M7 8v16h16" />}
    </svg>
  );
}

export function SystemAnatomy() {
  const [activeId, setActiveId] = useState<LayerId>('discovery');
  const active = layers.find((layer) => layer.id === activeId) ?? layers[0];

  return (
    <section
      id="system-anatomy"
      className="system-anatomy-v2"
      aria-labelledby="anatomy-title"
      data-active={active.id}
      dir="rtl"
    >
      <div className="anatomy-canvas">
        <img className="anatomy-object" src={anatomyObject} alt="" aria-hidden="true" loading="lazy" />
        <div className="anatomy-grain" aria-hidden="true" />

        <div className="anatomy-top-band" aria-label="هوية القسم">
          <span className="anatomy-brand">GENERAL SOLUTIONS</span>
          <span>منهج البناء</span>
          <span>منظومة مترابطة</span>
          <strong><b>04</b> تشريح النظام</strong>
        </div>

        <header className="anatomy-heading">
          <p className="anatomy-eyebrow"><i aria-hidden="true" /> تشريح النظام</p>
          <h2 id="anatomy-title"><span>كيف نبني الأنظمة</span><span>الرقمية طبقة فوق طبقة</span></h2>
          <p className="anatomy-intro">
            نفتح النظام إلى مستوياته؛ كل مستوى يضيف وضوحًا ويحافظ على صلته بما قبله وما بعده.
          </p>
        </header>

        <svg className="anatomy-connectors" viewBox="0 0 1600 1000" preserveAspectRatio="none" aria-hidden="true">
          {layers.map((layer, index) => (
            <g key={layer.id} className={active.id === layer.id ? 'is-active' : undefined}>
              <path className="connector-route" d={layer.route} />
              <circle className="connector-origin" cx="558" cy={439 + index * 72} r="4" />
              <circle className="connector-anchor" cx={[772, 784, 796, 809, 818][index]} cy={[208, 328, 463, 581, 694][index]} r="5" />
            </g>
          ))}
        </svg>

        <div className="anatomy-stages" aria-label="مراحل بناء النظام">
          {layers.map((layer) => {
            const selected = active.id === layer.id;
            return (
              <button
                key={layer.id}
                className={selected ? 'is-active' : undefined}
                type="button"
                aria-label={layer.title}
                aria-pressed={selected}
                onClick={() => setActiveId(layer.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setActiveId(layer.id);
                  }
                }}
              >
                <span className="stage-index">{layer.index}</span>
                <span className="stage-icon"><StageIcon id={layer.id} /></span>
                <span className="stage-copy">
                  <strong>{layer.title}</strong>
                  <small>{layer.role}</small>
                </span>
                <i className="stage-signal" aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <div className="anatomy-object-anchors" aria-hidden="true">
          {layers.map((layer) => (
            <i
              key={layer.id}
              className={active.id === layer.id ? 'is-active' : undefined}
              style={{ '--anchor-y': `${layer.anchorY}%` } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="anatomy-layer-lighting" aria-hidden="true">
          {layers.map((layer) => (
            <i
              key={layer.id}
              className={active.id === layer.id ? 'is-active' : undefined}
              style={{ '--anchor-y': `${layer.anchorY}%` } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="anatomy-right-guide" aria-hidden="true" />
        <div className="anatomy-layer-labels" aria-hidden="true">
          {layers.map((layer) => (
            <span
              key={layer.id}
              className={active.id === layer.id ? 'is-active' : undefined}
              style={{ '--anchor-y': `${layer.anchorY}%` } as React.CSSProperties}
            >
              <b>{layer.index}</b><i />{layer.title}
            </span>
          ))}
        </div>

        <p className="anatomy-live-role" aria-live="polite">
          <span>دور الطبقة / {active.index}</span>
          <strong>{active.title}</strong>
          <small>{active.role}</small>
        </p>

        <div className="anatomy-principles" aria-label="مبادئ بناء النظام">
          <span><PrincipleIcon kind="clarity" /><b>وضوح كل مستوى</b><small>كل طبقة تُفهم في موضعها.</small></span>
          <span><PrincipleIcon kind="continuity" /><b>ترابط المراحل</b><small>صلة واضحة من القرار إلى الإطلاق.</small></span>
          <span><PrincipleIcon kind="growth" /><b>أساس قابل للتطوير</b><small>بنية منظّمة تنمو مع تغيّر العمل.</small></span>
        </div>
      </div>
    </section>
  );
}
