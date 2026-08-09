import React, { Fragment } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftIcon } from 'lucide-react';
import { STAGE_COPY, CTA_PRIMARY, CTA_SECONDARY } from '../../data/heroContent';
import type { StageId } from '../../types/hero';

interface HeroCopyProps {
  stage: StageId;
  reducedMotion: boolean;
  onNextStage?: () => void;
  onPrevStage?: () => void;
  stageIndex: number;
}

export function HeroCopy({ stage, reducedMotion, onNextStage, onPrevStage, stageIndex }: HeroCopyProps) {
  const copy = STAGE_COPY[stage];

  return (
    <div className="flex flex-col gap-7 px-6 sm:px-8 lg:px-0">
      <div className="min-h-[210px] sm:min-h-[190px] lg:min-h-[240px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-5">
            
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-bronze-500/30 bg-bronze-50 px-3 py-1 text-xs font-medium tracking-wide text-bronze-700">
                {copy.eyebrow}
              </span>
              <span className="font-mono text-xs font-bold text-navy-900/40">
                {stageIndex + 1} / 4
              </span>
            </div>

            <h1 className="font-kufi text-[1.9rem] leading-[1.3] text-navy-900 sm:text-4xl lg:text-[2.65rem]">
              {copy.headline.map((segment, i) =>
                segment.highlight ? (
                  <span key={i} className="relative whitespace-nowrap text-bronze-600">
                    <span className="absolute inset-x-0 bottom-1 -z-10 h-2.5 bg-bronze-100" />
                    {segment.text}
                  </span>
                ) : (
                  <Fragment key={i}>{segment.text}</Fragment>
                )
              )}
            </h1>

            <p className="max-w-md text-[15px] leading-7 text-navy-900/60">{copy.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Primary Action Buttons & Step Navigation */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#cta"
            className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-medium text-mineral-50 transition-colors hover:bg-navy-700 shadow-sm">
            {CTA_PRIMARY}
            <ArrowLeftIcon className="h-4 w-4" />
          </a>
          <a
            href="#families"
            className="inline-flex items-center gap-2 rounded-full border border-navy-900/15 px-6 py-3 text-sm font-medium text-navy-900 transition-colors hover:border-navy-900/30 hover:bg-navy-900/5">
            {CTA_SECONDARY}
            <ArrowLeftIcon className="h-4 w-4" />
          </a>
        </div>

        {/* Quick Interactive Step Buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-mineral-200/60 max-w-md">
          {onPrevStage && (
            <button
              type="button"
              onClick={onPrevStage}
              disabled={stageIndex === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-mineral-300 bg-white px-3 py-1.5 text-xs font-semibold text-navy-900 transition-colors hover:bg-mineral-100 disabled:opacity-40 disabled:cursor-not-allowed">
              <span>المرحلة السابقة</span>
            </button>
          )}

          {onNextStage && (
            <button
              type="button"
              onClick={onNextStage}
              disabled={stageIndex === 3}
              className="inline-flex items-center gap-1 rounded-lg border border-bronze-300 bg-bronze-50 px-3 py-1.5 text-xs font-bold text-bronze-800 transition-colors hover:bg-bronze-100 disabled:opacity-40 disabled:cursor-not-allowed">
              <span>المرحلة التالية</span>
              <ArrowLeftIcon className="h-3.5 w-3.5" />
            </button>
          )}

          <span className="mr-auto text-[10px] text-navy-900/50 font-medium">
            تفاعل مع الشاشة لمعاينة التفاصيل
          </span>
        </div>
      </div>
    </div>
  );
}