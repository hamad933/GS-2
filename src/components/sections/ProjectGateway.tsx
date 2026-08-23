import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import gatewayEnvironment from '../../assets/gs-home-v2/05_GS_Final_Gateway_Clean_Production_Asset.webp';
import './ProjectGateway.v2.css';

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
        <bdi>جاهزون للبدء</bdi>
      </div>

      <div className="gateway-top-rule" aria-hidden="true">
        <span />
      </div>

      <div className="gateway-narrative">
        <p className="gateway-eyebrow">
          <span className="gateway-signal" aria-hidden="true" />
          <span>نقطة البدء</span>
        </p>

        <h2 id="gateway-title">
          لنبدأ مشروعًا
          <br />
          يستحق أن يُبنى جيدًا.
        </h2>

        <p className="gateway-intro">
          ابدأ من احتياجك والسياق والنتيجة المطلوبة، ثم رتّبها في مساحة اختيار
          واضحة تراجعها وتثبّتها بنفسك.
        </p>

        <div className="gateway-actions">
          <Link className="gateway-cta gateway-cta--primary" to="/start">
            <span>ابدأ اختيارك</span>
            <ArrowLeft aria-hidden="true" />
          </Link>
          <Link className="gateway-cta gateway-cta--secondary" to="/reference-projects">
            <span>شاهد المشاريع المرجعية</span>
            <ArrowLeft aria-hidden="true" />
          </Link>
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
