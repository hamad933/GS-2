import { ArrowLeft } from 'lucide-react';

export function ProjectGateway() {
  return (
    <section id="project-gateway" className="project-gateway" aria-labelledby="gateway-title">
      <div className="gateway-lines" aria-hidden="true"><i /><i /><i /><i /><i /><span /></div>
      <div className="gateway-copy">
        <p><span>05</span> نقطة البدء</p>
        <h2 id="gateway-title">حين تتضح المنظومة،<br />تبدأ الخطوة الأولى بهدوء.</h2>
        <p>ابدأ بوصف الاحتياج الذي تريد أن يتحول إلى نظام. بوابة المشروع تفتح رسالة بريد منظّمة لتكملها وترسلها بنفسك.</p>
        <a href="mailto:hello@generalsolutions.co?subject=%D8%A8%D8%AF%D8%A1%20%D9%85%D8%B4%D8%B1%D9%88%D8%B9%20%D8%AC%D8%AF%D9%8A%D8%AF&body=%D8%A7%D9%84%D8%A7%D8%AD%D8%AA%D9%8A%D8%A7%D8%AC%3A%0A%0A%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D9%82%3A%0A%0A%D8%A7%D9%84%D9%86%D8%AA%D9%8A%D8%AC%D8%A9%20%D8%A7%D9%84%D9%85%D8%B7%D9%84%D9%88%D8%A8%D8%A9%3A">
          <span>ابدأ مشروعك</span><ArrowLeft aria-hidden="true" />
        </a>
        <small>لن يتم إرسال أي بيانات من هذه الصفحة.</small>
      </div>
    </section>
  );
}
