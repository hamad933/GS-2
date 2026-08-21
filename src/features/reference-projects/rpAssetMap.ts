import rp01Emblem from '../../assets/gs-public-v1/reference-projects/RP-01/EMBLEM/RP-01-EMB-01.webp';
import rp01Master from '../../assets/gs-public-v1/reference-projects/RP-01/MASTER/RP-01-MSC-01.webp';
import rp01Mobile from '../../assets/gs-public-v1/reference-projects/RP-01/MOBILE/RP-01-MOB-01.webp';
import rp02Emblem from '../../assets/gs-public-v1/reference-projects/RP-02/EMBLEM/RP-02-EMB-01.webp';
import rp02Master from '../../assets/gs-public-v1/reference-projects/RP-02/MASTER/RP-02-MSC-01.webp';
import rp02Mobile from '../../assets/gs-public-v1/reference-projects/RP-02/MOBILE/RP-02-MOB-01.webp';
import rp03Emblem from '../../assets/gs-public-v1/reference-projects/RP-03/EMBLEM/RP-03-EMB-01.webp';
import rp03Master from '../../assets/gs-public-v1/reference-projects/RP-03/MASTER/RP-03-MSC-01.webp';
import rp03Mobile from '../../assets/gs-public-v1/reference-projects/RP-03/MOBILE/RP-03-MOB-01.webp';
import rp04Emblem from '../../assets/gs-public-v1/reference-projects/RP-04/EMBLEM/RP-04-EMB-01.webp';
import rp04Master from '../../assets/gs-public-v1/reference-projects/RP-04/MASTER/RP-04-MSC-01.webp';
import rp04Mobile from '../../assets/gs-public-v1/reference-projects/RP-04/MOBILE/RP-04-MOB-01.webp';
import type { ReferenceProjectId } from '../../data/reference-projects';

export type RpPresentationAssets = {
  emblem: string;
  master: string;
  mobile: string;
};

export const rpAssetMap: Record<ReferenceProjectId, RpPresentationAssets> = {
  rp01: { emblem: rp01Emblem, master: rp01Master, mobile: rp01Mobile },
  rp02: { emblem: rp02Emblem, master: rp02Master, mobile: rp02Mobile },
  rp03: { emblem: rp03Emblem, master: rp03Master, mobile: rp03Mobile },
  rp04: { emblem: rp04Emblem, master: rp04Master, mobile: rp04Mobile },
};
