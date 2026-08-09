import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { StageId } from '../../types/hero';
import { Pedestal } from './Pedestal';
import { NeedStage } from './stages/NeedStage';
import { DirectionStage } from './stages/DirectionStage';
import { BuildStage } from './stages/BuildStage';
import { LaunchStage } from './stages/LaunchStage';

interface VisualStageProps {
  stage: StageId;
  reducedMotion: boolean;
}

const STAGES: Record<StageId, React.ComponentType> = {
  need: NeedStage,
  direction: DirectionStage,
  build: BuildStage,
  launch: LaunchStage
};

export function VisualStage({ stage, reducedMotion }: VisualStageProps) {
  const StageComponent = STAGES[stage];

  return (
    <div className="relative flex min-h-[340px] items-center justify-center lg:min-h-[510px]">
      <Pedestal />
      <div className="architectural-grid absolute inset-0 z-0 opacity-40" />
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -12, scale: 0.985 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 10, scale: 0.99 }}
          transition={{ duration: reducedMotion ? 0.15 : 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full px-3 sm:px-6 lg:px-0">
          
          <StageComponent />
        </motion.div>
      </AnimatePresence>
    </div>);

}