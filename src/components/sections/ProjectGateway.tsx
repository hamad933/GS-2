import { ArrowLeft } from 'lucide-react';
import gatewayEnvironment from '../../assets/gs-home-v2/05_GS_Final_Gateway_Clean_Production_Asset.webp';
import './ProjectGateway.v2.css';

const projectMailto =
  'mailto:hello@generalsolutions.co?subject=%D8%A8%D8%AF%D8%A1%20%D9%85%D8%B4%D8%B1%D9%88%D8%B9%20%D8%AC%D8%AF%D9%8A%D8%AF&body=%D8%A7%D9%84%D8%A7%D8%AD%D8%AA%D9%8A%D8%A7%D8%AC%3A%0A%0A%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D9%82%3A%0A%0A%D8%A7%D9%84%D9%86%D8%AA%D9%8A%D8%AC%D8%A9%20%D8%A7%D9%84%D9%85%D8%B7%D9%84%D9%88%D8%A8%D8%A9%3A';

const projectInputs = ['الاحتياج', 'السياق', 'النتيجة المطلوبة'];

export function ProjectGateway() {
  return (
    <section
      id="project-gateway"
      className="project-gateway"
      aria-labelledby="gateway-title"
      dir="rtl"
    >
      <img
        className="gateway-scene"
        src={gatewayEnvironment}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
      />

      <div className="gateway-identity" aria-hidden="true">
        <bdi>GENERAL SOLUTIONS</bdi>
        <span />
        <bdi>S05</bdi>
      </div>

      <div className="gateway-top-rule" aria-hidden="true">
        <span />
      </div>

      <div className="gateway-narrative">
        <p className="gateway-eyebrow">
          <span className="gateway-signal" aria-hidden="true" />
          <span>نقطة البدء</span>
          <bdi>05</bdi>
        </p>

        <h2 id="gateway-title">
          لنبدأ مشروعًا
          <br />
          يستحق أن يُبنى جيدًا.
        </h2>

        <p className="gateway-intro">
          شاركنا احتياجك، وسنبدأ من الواقع الذي تريد تغييره. الزر يفتح رسالة بريد
          منظمة لتكملها وترسلها بنفسك.
        </p>

        <div className="gateway-actions">
          <a className="gateway-cta gateway-cta--primary" href={projectMailto}>
            <span>ابدأ مشروعك</span>
            <ArrowLeft aria-hidden="true" />
          </a>
          <a className="gateway-cta gateway-cta--secondary" href="#reference-proof">
            <span>شاهد الأعمال</span>
            <ArrowLeft aria-hidden="true" />
          </a>
        </div>

        <small className="gateway-privacy">
          <span aria-hidden="true" />
          لن يتم إرسال أي بيانات من هذه الصفحة.
        </small>
      </div>

      <svg
        className="gateway-path-signal"
        viewBox="0 0 420 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M412 10H395V83H79C64 83 61 75 69 64L102 35" />
        <rect x="407" y="6" width="8" height="8" transform="rotate(45 411 10)" />
      </svg>

      <div className="gateway-continuity" aria-label="المعلومات المطلوبة لبدء المشروع">
        <ol>
          {projectInputs.map((input, index) => (
            <li key={input}>
              <bdi>{String(index + 1).padStart(2, '0')}</bdi>
              <span>{input}</span>
              <i aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
