import React, { useState } from 'react';
import { ArrowLeftIcon, SparklesIcon, SendIcon, XIcon, CheckCircle2Icon } from 'lucide-react';

export function CtaSection() {
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowModal(false);
    }, 2500);
  };

  return (
    <section className="relative bg-navy-950 py-20 text-white overflow-hidden" id="cta">
      {/* Background Decorative Gradient Wave Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-bronze-600/20 via-navy-950 to-navy-900 pointer-events-none" />
      <div className="architectural-grid absolute inset-0 opacity-10 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[1500px] px-4 sm:px-8 lg:px-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-bronze-400/40 bg-bronze-500/10 px-4 py-1.5 text-xs font-semibold text-bronze-300 mb-6">
          <SparklesIcon className="h-3.5 w-3.5 text-bronze-400" />
          ابدأ رحلتك الرقمية معنا
        </div>

        <h2 className="font-kufi text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl max-w-4xl mx-auto">
          لديك فكرة أو تحدٍّ رقمي؟ <br />
          لنحوّله إلى منتج واضح وقابل للبناء
        </h2>

        <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed text-mineral-200/80">
          سواء كنت تبدأ من فكرة، أو تحتاج إلى تطوير تجربة قائمة، نبدأ من احتياج المشروع ونبني الاتجاه المناسب له.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-bronze-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-bronze-500/20 hover:bg-bronze-600 transition-all cursor-pointer">
            <span>ابدأ مشروعك</span>
            <ArrowLeftIcon className="h-4 w-4" />
          </button>

          <a
            href="#families"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-all">
            <span>استكشف الحلول</span>
            <ArrowLeftIcon className="h-4 w-4 text-mineral-300" />
          </a>
        </div>
      </div>

      {/* Project Inquiry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-xs p-4 text-navy-900">
          <div className="relative w-full max-w-md rounded-2xl border border-mineral-300 bg-white p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute left-4 top-4 rounded-full bg-mineral-100 p-2 text-navy-900 hover:bg-mineral-200 cursor-pointer">
              <XIcon className="h-5 w-5" />
            </button>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-right">
                  <h3 className="font-kufi text-xl font-bold text-navy-900">بدء مشروع جديد</h3>
                  <p className="text-xs text-navy-900/60 mt-1">شاركونا تفاصيل مشروعك وسنتواصل معكم فوراً.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    placeholder="عبدالله محمد"
                    className="w-full rounded-lg border border-mineral-300 px-3 py-2 text-xs focus:border-bronze-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="w-full rounded-lg border border-mineral-300 px-3 py-2 text-xs focus:border-bronze-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">نوع الخدمة المطلوب</label>
                  <select className="w-full rounded-lg border border-mineral-300 px-3 py-2 text-xs focus:border-bronze-500 outline-none bg-white">
                    <option>منصة خدمات ونمو</option>
                    <option>متجر وتجارة رقمية</option>
                    <option>منصة حجوزات ومواعيد</option>
                    <option>منصة عقارات وأصول</option>
                    <option>نظام وبوابة تشغيلية</option>
                    <option>احتياج مخصص آخر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">تفاصيل المشروع (اختياري)</label>
                  <textarea
                    rows={3}
                    placeholder="نبذة عن الهدف ونطاق العمل..."
                    className="w-full rounded-lg border border-mineral-300 px-3 py-2 text-xs focus:border-bronze-500 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-bronze-500 py-3 text-xs font-bold text-white hover:bg-bronze-600 transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <SendIcon className="h-4 w-4" />
                  <span>إرسال الطلب الفوري</span>
                </button>
              </form>
            ) : (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2Icon className="mx-auto h-12 w-12 text-emerald-600 animate-bounce" />
                <h3 className="font-kufi text-xl font-bold text-navy-900">تم استلام طلبك بنجاح!</h3>
                <p className="text-xs text-navy-900/70">سيتواصل معك مستشار الحلول خلال 24 ساعة لبحث التفاصيل.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
