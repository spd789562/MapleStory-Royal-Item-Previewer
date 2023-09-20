import type IVector from 'maplestory/dist/PKG1/IVector';
import type { IItemEntry } from './IItemEntry';
export interface IHairDyeOptions {
  colorId: number;
  percentile: number;
}
export interface IRenderRequest {
  type: string;
  action: string;
  emotion: string;
  skin: number;
  zoom: number;
  mercEars?: boolean;
  illiumEars?: boolean;
  highFloraEars?: boolean;
  selectedItems: Record<string, IItemEntry>;
  visible: boolean;
  position: IVector;
  fhSnap: boolean;
  flipX: boolean;
  name: string;
  includeBackground: boolean;
  id: number;
  timeOffset?: number;
  frame?: number;
  hairDye?: IHairDyeOptions;
  animating?: boolean;
}
