import type IVector from 'maplestory/dist/PKG1/IVector';
export interface IPieceInfo {
  z: string;
  origin: IVector;
  map: Record<string, IVector>;
  group: string;
  visible: boolean;
}
