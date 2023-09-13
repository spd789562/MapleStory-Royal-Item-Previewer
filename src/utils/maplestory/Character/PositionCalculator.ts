import IVector from 'maplestory/dist/PKG1/IVector';
import { RenderableBounds } from '../Utilities/RenderableBounds';
import { AnchorResults } from './AnchorMapBuilder';
import type { IRenderRequest } from './IRenderRequest';
import { LockResults } from './LockResolver';

export function CalcFeetCenterPosition(
  request: IRenderRequest,
  bounds: RenderableBounds,
  anchors: AnchorResults,
): IVector {
  const calculatedOffset = anchors.calculatedOffsets.body || anchors.calculatedOffsets.backBody;

  if (!calculatedOffset) {
    console.warn("Couldn't find the body???");
  }

  const position = {
    x: calculatedOffset.x - bounds.left,
    y: calculatedOffset.y - bounds.top,
  } as IVector;

  position.x *= request.zoom;
  position.y *= request.zoom;

  if (request.flipX) position.x = bounds.size.x - position.x;

  return position;
}

export function CalcBounds(request: IRenderRequest, anchors: AnchorResults, locks: LockResults): RenderableBounds {
  const lefts = [] as Array<number>;
  const rights = [] as Array<number>;
  const tops = [] as Array<number>;
  const bottoms = [] as Array<number>;

  Object.keys(locks.lockedPieces).forEach((lockName) => {
    const lockedPieces = locks.lockedPieces[lockName];
    lockedPieces.forEach((piece) => {
      const offset = anchors.calculatedOffsets[piece.slot || piece.z];
      if (!offset) return;

      const left = offset.x - (piece.origin || { x: 0 }).x;
      const right = left + piece.canvas.width;
      const top = offset.y - (piece.origin || { y: 0 }).y;
      const bottom = top + piece.canvas.height;

      lefts.push(left);
      rights.push(right);
      tops.push(top);
      bottoms.push(bottom);
    });
  });

  const bounds = new RenderableBounds(lefts, rights, tops, bottoms, request.zoom);
  return bounds;
}
