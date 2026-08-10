import { ArrowLeft } from 'lucide-react';
import gatewayEnvironment from '../../assets/gs-w05/GS_A05_Final_Gateway_Environment.png';

export function ProjectGateway() {
  return (
    <section id="project-gateway" className="project-gateway" aria-labelledby="gateway-title">
      <img className="production-environment gateway-environment" src={gatewayEnvironment} alt="" aria-hidden="true" loading="lazy" />
      <div className="gateway-copy">
        <p><span>05</span> نقطة البدء</p>
        <h2 id="gateway-title">لنبدأ مشروعًا<br />يستحق أن يُبنى جيدًا.</h2>
        <p>شاركنا احتياجك، وسنبدأ من الواقع الذي تريد تغييره. الزر يفتح رسالة بريد منظّمة لتكملها وترسلها بنفسك.</p>
        <a href="mailto:hello@generalsolutions.co?subject=%D8%A8%D8%AF%D8%A1%20%D9%85%D8%B4%D8%B1%D9%88%D8%B9%20%D8%AC%D8%AF%D9%8A%D8%AF&body=%D8%A7%D9%84%D8%A7%D8%AD%D8%AA%D9%8A%D8%A7%D8%AC%3A%0A%0A%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D9%82%3A%0A%0A%D8%A7%D9%84%D9%86%D8%AA%D9%8A%D8%AC%D8%A9%20%D8%A7%D9%84%D9%85%D8%B7%D9%84%D9%88%D8%A8%D8%A9%3A">
          <span>ابدأ مشروعك</span><ArrowLeft aria-hidden="true" />
        </a>
        <a className="gateway-secondary" href="#reference-proof">شاهد الأعمال</a>
        <small>لن يتم إرسال أي بيانات من هذه الصفحة.</small>
      </div>
    </section>
  );
}
