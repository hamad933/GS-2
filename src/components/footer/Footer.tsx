import React from 'react';
import { MailIcon } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-navy-800 bg-navy-950 py-12 text-white">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          
          {/* Logo & Intro Column (Col 4) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bronze-500 font-bold text-white shadow-md">
                GS
              </div>
              <div>
                <span className="font-kufi text-base font-bold text-white block leading-tight">General Solutions</span>
                <span className="text-[10px] text-bronze-300 font-semibold">حلول رقمية تُبنى بإتقان</span>
              </div>
            </div>
            <p className="text-xs text-mineral-200/70 max-w-sm leading-relaxed">
              نصمم ونطوّر حلولاً وتجارب رقمية تتشكل حول احتياجات الأعمال.
            </p>
          </div>

          {/* Quick Nav Links (Col 5) */}
          <div className="lg:col-span-5 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-mineral-200/80">
            <a href="#hero" className="hover:text-bronze-300 transition-colors">الرئيسية</a>
            <a href="#families" className="hover:text-bronze-300 transition-colors">الحلول</a>
            <a href="#models" className="hover:text-bronze-300 transition-colors">النماذج</a>
            <a href="#process" className="hover:text-bronze-300 transition-colors">كيف نعمل</a>
            <a href="#quality" className="hover:text-bronze-300 transition-colors">من نحن</a>
            <a href="#cta" className="hover:text-bronze-300 transition-colors">تواصل معنا</a>
          </div>

          {/* Contact & Support (Col 3) */}
          <div className="lg:col-span-3 lg:text-left space-y-2">
            <a
              href="mailto:hello@generalsolutions.co"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/10 transition-colors">
              <MailIcon className="h-4 w-4 text-bronze-400" />
              <span>hello@generalsolutions.co</span>
            </a>
            <div className="flex gap-4 text-[10px] text-mineral-200/50 justify-start lg:justify-end">
              <a href="#" className="hover:underline">الخصوصية</a>
              <a href="#" className="hover:underline">الشروط والأحكام</a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center text-[11px] text-mineral-200/50">
          © 2026 General Solutions. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
