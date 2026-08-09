export type StageId = 'need' | 'direction' | 'build' | 'launch';

export interface HeadlineSegment {
  text: string;
  highlight?: boolean;
}

export interface StageCopy {
  id: StageId;
  eyebrow: string;
  tabLabel: string;
  headline: HeadlineSegment[];
  description: string;
}