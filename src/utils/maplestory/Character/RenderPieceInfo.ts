import type { IProperty } from 'maplestory/dist/PKG1/IProperty';
import type IVector from 'maplestory/dist/PKG1/IVector';
import type { IPieceInfo } from './IPieceInfo';

export class RenderPieceInfo implements IPieceInfo {
  z: string;
  origin: IVector;
  map: Record<string, IVector> = {};
  group: string;
  slot?: string;
  public get visible(): boolean {
    // TODO: is it possible to override this from WZ?
    return true;
  }

  constructor(piece: IProperty) {
    this.slot = piece.parent?.name; // TODO: Improve this.

    const infoComputed = piece.children.reduce((total, current) => {
      total[current.name] = current;
      return total;
    }, {} as Record<string, IProperty>);

    this.z = infoComputed.z?.value;
    this.origin = infoComputed.origin?.value;
    this.group = infoComputed.group?.value;

    if (infoComputed.map) {
      this.map = infoComputed.map.children.reduce((total, current) => {
        total[current.name] = current.value;
        return total;
      }, {} as Record<string, IVector>);
    }
  }
}
