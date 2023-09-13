import type IVector from '../PKG1/IVector';
export interface IPieceInfo {
  z: string;
  origin: IVector;
  map: Record<string, IVector>;
  group: string;
  visible: boolean;
}
