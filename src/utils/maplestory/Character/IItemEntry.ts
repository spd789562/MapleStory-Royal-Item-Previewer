import type { ITypeInfo } from './ITypeInfo';

export interface IItemEntry {
  frame?: number;
  action?: string;
  name?: string;
  noIcon?: boolean;
  id: number;
  region: string;
  version: string;
  typeInfo?: ITypeInfo;
  alpha?: number;
  hue?: number;

  saturation?: number;
  contrast?: number;
  brightness?: number;
  islot?: string;
  vslot?: string;
  disableEffect?: boolean;
  equipFrame?: number;
  glow?: boolean;
  grayscale?: boolean;
  invert?: boolean;
  oilPaint?: boolean;
  sepia?: boolean;
  visible?: boolean;

  internal?: InternalType;
}

export enum InternalType {
  None,
  HairDye,
}
