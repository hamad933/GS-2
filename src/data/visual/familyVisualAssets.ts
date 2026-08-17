export type FamilyAssetFamily = 'FAM-01' | 'FAM-02' | 'FAM-03' | 'FAM-04' | 'FAM-05' | 'FAM-06';
export type FamilyAssetRole = 'MASTER' | 'DIRECTION' | 'CONTEXTUAL_CUSTOMER' | 'CONTEXTUAL_OPERATIONS';
export type FamilyAssetStatus = 'APPROVED_BOUND';

export interface FamilyVisualAsset {
  id: string;
  family: FamilyAssetFamily;
  role: FamilyAssetRole;
  status: FamilyAssetStatus;
  runtimeUrl: string | null;
  canonicalPath: string | null;
}

const runtimeAssets: Record<string, string> = {
  'FAM-01-MSC-01': new URL('../../assets/gs-public-v1/families/FAM-01/MASTER/FAM-01-MSC-01.webp', import.meta.url).href,
  'FAM-01-DIR-01': new URL('../../assets/gs-public-v1/families/FAM-01/DIRECTIONS/FAM-01-DIR-01.webp', import.meta.url).href,
  'FAM-01-DIR-02': new URL('../../assets/gs-public-v1/families/FAM-01/DIRECTIONS/FAM-01-DIR-02.webp', import.meta.url).href,
  'FAM-01-DIR-03': new URL('../../assets/gs-public-v1/families/FAM-01/DIRECTIONS/FAM-01-DIR-03.webp', import.meta.url).href,
  'FAM-01-CTX-01': new URL('../../assets/gs-public-v1/families/FAM-01/CONTEXTUAL/FAM-01-CTX-01.webp', import.meta.url).href,
  'FAM-01-CTX-02': new URL('../../assets/gs-public-v1/families/FAM-01/CONTEXTUAL/FAM-01-CTX-02.webp', import.meta.url).href,
  'FAM-02-MSC-01': new URL('../../assets/gs-public-v1/families/FAM-02/MASTER/FAM-02-MSC-01.webp', import.meta.url).href,
  'FAM-02-DIR-01': new URL('../../assets/gs-public-v1/families/FAM-02/DIRECTIONS/FAM-02-DIR-01.webp', import.meta.url).href,
  'FAM-02-DIR-02': new URL('../../assets/gs-public-v1/families/FAM-02/DIRECTIONS/FAM-02-DIR-02.webp', import.meta.url).href,
  'FAM-02-DIR-03': new URL('../../assets/gs-public-v1/families/FAM-02/DIRECTIONS/FAM-02-DIR-03.webp', import.meta.url).href,
  'FAM-02-CTX-01': new URL('../../assets/gs-public-v1/families/FAM-02/CONTEXTUAL/FAM-02-CTX-01.webp', import.meta.url).href,
  'FAM-02-CTX-02': new URL('../../assets/gs-public-v1/families/FAM-02/CONTEXTUAL/FAM-02-CTX-02.webp', import.meta.url).href,
  'FAM-03-MSC-01': new URL('../../assets/gs-public-v1/families/FAM-03/MASTER/FAM-03-MSC-01.webp', import.meta.url).href,
  'FAM-03-DIR-01': new URL('../../assets/gs-public-v1/families/FAM-03/DIRECTIONS/FAM-03-DIR-01.webp', import.meta.url).href,
  'FAM-03-DIR-02': new URL('../../assets/gs-public-v1/families/FAM-03/DIRECTIONS/FAM-03-DIR-02.webp', import.meta.url).href,
  'FAM-03-DIR-03': new URL('../../assets/gs-public-v1/families/FAM-03/DIRECTIONS/FAM-03-DIR-03.webp', import.meta.url).href,
  'FAM-03-CTX-01': new URL('../../assets/gs-public-v1/families/FAM-03/CONTEXTUAL/FAM-03-CTX-01.webp', import.meta.url).href,
  'FAM-03-CTX-02': new URL('../../assets/gs-public-v1/families/FAM-03/CONTEXTUAL/FAM-03-CTX-02.webp', import.meta.url).href,
  'FAM-04-MSC-01': new URL('../../assets/gs-public-v1/families/FAM-04/MASTER/FAM-04-MSC-01.webp', import.meta.url).href,
  'FAM-04-DIR-01': new URL('../../assets/gs-public-v1/families/FAM-04/DIRECTIONS/FAM-04-DIR-01.webp', import.meta.url).href,
  'FAM-04-DIR-02': new URL('../../assets/gs-public-v1/families/FAM-04/DIRECTIONS/FAM-04-DIR-02.webp', import.meta.url).href,
  'FAM-04-DIR-03': new URL('../../assets/gs-public-v1/families/FAM-04/DIRECTIONS/FAM-04-DIR-03.webp', import.meta.url).href,
  'FAM-04-CTX-01': new URL('../../assets/gs-public-v1/families/FAM-04/CONTEXTUAL/FAM-04-CTX-01.webp', import.meta.url).href,
  'FAM-04-CTX-02': new URL('../../assets/gs-public-v1/families/FAM-04/CONTEXTUAL/FAM-04-CTX-02.webp', import.meta.url).href,
  'FAM-05-MSC-01': new URL('../../assets/gs-public-v1/families/FAM-05/MASTER/FAM-05-MSC-01.webp', import.meta.url).href,
  'FAM-05-DIR-01': new URL('../../assets/gs-public-v1/families/FAM-05/DIRECTIONS/FAM-05-DIR-01.webp', import.meta.url).href,
  'FAM-05-DIR-02': new URL('../../assets/gs-public-v1/families/FAM-05/DIRECTIONS/FAM-05-DIR-02.webp', import.meta.url).href,
  'FAM-05-DIR-03': new URL('../../assets/gs-public-v1/families/FAM-05/DIRECTIONS/FAM-05-DIR-03.webp', import.meta.url).href,
  'FAM-05-CTX-01': new URL('../../assets/gs-public-v1/families/FAM-05/CONTEXTUAL/FAM-05-CTX-01.webp', import.meta.url).href,
  'FAM-05-CTX-02': new URL('../../assets/gs-public-v1/families/FAM-05/CONTEXTUAL/FAM-05-CTX-02.webp', import.meta.url).href,
  'FAM-06-MSC-01': new URL('../../assets/gs-public-v1/families/FAM-06/MASTER/FAM-06-MSC-01.webp', import.meta.url).href,
  'FAM-06-DIR-01': new URL('../../assets/gs-public-v1/families/FAM-06/DIRECTIONS/FAM-06-DIR-01.webp', import.meta.url).href,
  'FAM-06-DIR-02': new URL('../../assets/gs-public-v1/families/FAM-06/DIRECTIONS/FAM-06-DIR-02.webp', import.meta.url).href,
  'FAM-06-DIR-03': new URL('../../assets/gs-public-v1/families/FAM-06/DIRECTIONS/FAM-06-DIR-03.webp', import.meta.url).href,
  'FAM-06-CTX-01': new URL('../../assets/gs-public-v1/families/FAM-06/CONTEXTUAL/FAM-06-CTX-01.webp', import.meta.url).href,
  'FAM-06-CTX-02': new URL('../../assets/gs-public-v1/families/FAM-06/CONTEXTUAL/FAM-06-CTX-02.webp', import.meta.url).href,
};

const approved = (id: string, family: FamilyAssetFamily, role: FamilyAssetRole, canonicalPath: string): FamilyVisualAsset => ({ id, family, role, status: 'APPROVED_BOUND', runtimeUrl: runtimeAssets[id], canonicalPath });

export const familyVisualAssets: Record<string, FamilyVisualAsset> = {
  'FAM-01-MSC-01': approved('FAM-01-MSC-01', 'FAM-01', 'MASTER', 'src/assets/gs-public-v1/families/FAM-01/MASTER/FAM-01-MSC-01.webp'),
  'FAM-01-DIR-01': approved('FAM-01-DIR-01', 'FAM-01', 'DIRECTION', 'src/assets/gs-public-v1/families/FAM-01/DIRECTIONS/FAM-01-DIR-01.webp'),
  'FAM-01-DIR-02': approved('FAM-01-DIR-02', 'FAM-01', 'DIRECTION', 'src/assets/gs-public-v1/families/FAM-01/DIRECTIONS/FAM-01-DIR-02.webp'),
  'FAM-01-DIR-03': approved('FAM-01-DIR-03', 'FAM-01', 'DIRECTION', 'src/assets/gs-public-v1/families/FAM-01/DIRECTIONS/FAM-01-DIR-03.webp'),
  'FAM-01-CTX-01': approved('FAM-01-CTX-01', 'FAM-01', 'CONTEXTUAL_CUSTOMER', 'src/assets/gs-public-v1/families/FAM-01/CONTEXTUAL/FAM-01-CTX-01.webp'),
  'FAM-01-CTX-02': approved('FAM-01-CTX-02', 'FAM-01', 'CONTEXTUAL_OPERATIONS', 'src/assets/gs-public-v1/families/FAM-01/CONTEXTUAL/FAM-01-CTX-02.webp'),

  'FAM-02-MSC-01': approved('FAM-02-MSC-01', 'FAM-02', 'MASTER', 'src/assets/gs-public-v1/families/FAM-02/MASTER/FAM-02-MSC-01.webp'),
  'FAM-02-DIR-01': approved('FAM-02-DIR-01', 'FAM-02', 'DIRECTION', 'src/assets/gs-public-v1/families/FAM-02/DIRECTIONS/FAM-02-DIR-01.webp'),
  'FAM-02-DIR-02': approved('FAM-02-DIR-02', 'FAM-02', 'DIRECTION', 'src/assets/gs-public-v1/families/FAM-02/DIRECTIONS/FAM-02-DIR-02.webp'),
  'FAM-02-DIR-03': approved('FAM-02-DIR-03', 'FAM-02', 'DIRECTION', 'src/assets/gs-public-v1/families/FAM-02/DIRECTIONS/FAM-02-DIR-03.webp'),
  'FAM-02-CTX-01': approved('FAM-02-CTX-01', 'FAM-02', 'CONTEXTUAL_CUSTOMER', 'src/assets/gs-public-v1/families/FAM-02/CONTEXTUAL/FAM-02-CTX-01.webp'),
  'FAM-02-CTX-02': approved('FAM-02-CTX-02', 'FAM-02', 'CONTEXTUAL_OPERATIONS', 'src/assets/gs-public-v1/families/FAM-02/CONTEXTUAL/FAM-02-CTX-02.webp'),

  'FAM-03-MSC-01': approved('FAM-03-MSC-01', 'FAM-03', 'MASTER', 'src/assets/gs-public-v1/families/FAM-03/MASTER/FAM-03-MSC-01.webp'),
  'FAM-03-DIR-01': approved('FAM-03-DIR-01', 'FAM-03', 'DIRECTION', 'src/assets/gs-public-v1/families/FAM-03/DIRECTIONS/FAM-03-DIR-01.webp'),
  'FAM-03-DIR-02': approved('FAM-03-DIR-02', 'FAM-03', 'DIRECTION', 'src/assets/gs-public-v1/families/FAM-03/DIRECTIONS/FAM-03-DIR-02.webp'),
  'FAM-03-DIR-03': approved('FAM-03-DIR-03', 'FAM-03', 'DIRECTION', 'src/assets/gs-public-v1/families/FAM-03/DIRECTIONS/FAM-03-DIR-03.webp'),
  'FAM-03-CTX-01': approved('FAM-03-CTX-01', 'FAM-03', 'CONTEXTUAL_CUSTOMER', 'src/assets/gs-public-v1/families/FAM-03/CONTEXTUAL/FAM-03-CTX-01.webp'),
  'FAM-03-CTX-02': approved('FAM-03-CTX-02', 'FAM-03', 'CONTEXTUAL_OPERATIONS', 'src/assets/gs-public-v1/families/FAM-03/CONTEXTUAL/FAM-03-CTX-02.webp'),

  'FAM-04-MSC-01': approved('FAM-04-MSC-01', 'FAM-04', 'MASTER', 'src/assets/gs-public-v1/families/FAM-04/MASTER/FAM-04-MSC-01.webp'),
  'FAM-04-DIR-01': approved('FAM-04-DIR-01', 'FAM-04', 'DIRECTION', 'src/assets/gs-public-v1/families/FAM-04/DIRECTIONS/FAM-04-DIR-01.webp'),
  'FAM-04-DIR-02': approved('FAM-04-DIR-02', 'FAM-04', 'DIRECTION', 'src/assets/gs-public-v1/families/FAM-04/DIRECTIONS/FAM-04-DIR-02.webp'),
  'FAM-04-DIR-03': approved('FAM-04-DIR-03', 'FAM-04', 'DIRECTION', 'src/assets/gs-public-v1/families/FAM-04/DIRECTIONS/FAM-04-DIR-03.webp'),
  'FAM-04-CTX-01': approved('FAM-04-CTX-01', 'FAM-04', 'CONTEXTUAL_CUSTOMER', 'src/assets/gs-public-v1/families/FAM-04/CONTEXTUAL/FAM-04-CTX-01.webp'),
  'FAM-04-CTX-02': approved('FAM-04-CTX-02', 'FAM-04', 'CONTEXTUAL_OPERATIONS', 'src/assets/gs-public-v1/families/FAM-04/CONTEXTUAL/FAM-04-CTX-02.webp'),

  'FAM-05-MSC-01': approved('FAM-05-MSC-01', 'FAM-05', 'MASTER', 'src/assets/gs-public-v1/families/FAM-05/MASTER/FAM-05-MSC-01.webp'),
  'FAM-05-DIR-01': approved('FAM-05-DIR-01', 'FAM-05', 'DIRECTION', 'src/assets/gs-public-v1/families/FAM-05/DIRECTIONS/FAM-05-DIR-01.webp'),
  'FAM-05-DIR-02': approved('FAM-05-DIR-02', 'FAM-05', 'DIRECTION', 'src/assets/gs-public-v1/families/FAM-05/DIRECTIONS/FAM-05-DIR-02.webp'),
  'FAM-05-DIR-03': approved('FAM-05-DIR-03', 'FAM-05', 'DIRECTION', 'src/assets/gs-public-v1/families/FAM-05/DIRECTIONS/FAM-05-DIR-03.webp'),
  'FAM-05-CTX-01': approved('FAM-05-CTX-01', 'FAM-05', 'CONTEXTUAL_CUSTOMER', 'src/assets/gs-public-v1/families/FAM-05/CONTEXTUAL/FAM-05-CTX-01.webp'),
  'FAM-05-CTX-02': approved('FAM-05-CTX-02', 'FAM-05', 'CONTEXTUAL_OPERATIONS', 'src/assets/gs-public-v1/families/FAM-05/CONTEXTUAL/FAM-05-CTX-02.webp'),

  'FAM-06-MSC-01': approved('FAM-06-MSC-01', 'FAM-06', 'MASTER', 'src/assets/gs-public-v1/families/FAM-06/MASTER/FAM-06-MSC-01.webp'),
  'FAM-06-DIR-01': approved('FAM-06-DIR-01', 'FAM-06', 'DIRECTION', 'src/assets/gs-public-v1/families/FAM-06/DIRECTIONS/FAM-06-DIR-01.webp'),
  'FAM-06-DIR-02': approved('FAM-06-DIR-02', 'FAM-06', 'DIRECTION', 'src/assets/gs-public-v1/families/FAM-06/DIRECTIONS/FAM-06-DIR-02.webp'),
  'FAM-06-DIR-03': approved('FAM-06-DIR-03', 'FAM-06', 'DIRECTION', 'src/assets/gs-public-v1/families/FAM-06/DIRECTIONS/FAM-06-DIR-03.webp'),
  'FAM-06-CTX-01': approved('FAM-06-CTX-01', 'FAM-06', 'CONTEXTUAL_CUSTOMER', 'src/assets/gs-public-v1/families/FAM-06/CONTEXTUAL/FAM-06-CTX-01.webp'),
  'FAM-06-CTX-02': approved('FAM-06-CTX-02', 'FAM-06', 'CONTEXTUAL_OPERATIONS', 'src/assets/gs-public-v1/families/FAM-06/CONTEXTUAL/FAM-06-CTX-02.webp'),

};

const familyNumbers: Record<string, FamilyAssetFamily> = {
  business: 'FAM-01',
  commerce: 'FAM-02',
  booking: 'FAM-03',
  assets: 'FAM-04',
  portals: 'FAM-05',
  knowledge: 'FAM-06',
};

export function getFamilyAssetId(
  familyId: string,
  role: 'MASTER' | 'DIR-01' | 'DIR-02' | 'DIR-03' | 'CTX-01' | 'CTX-02',
) {
  const family = familyNumbers[familyId];
  if (!family) return undefined;
  if (role === 'MASTER') return `${family}-MSC-01`;
  return `${family}-${role}`;
}

export function getFamilyVisualAsset(assetId: string | undefined) {
  return assetId ? familyVisualAssets[assetId] : undefined;
}
