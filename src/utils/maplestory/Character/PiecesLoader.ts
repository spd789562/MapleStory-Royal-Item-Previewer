import type { IProperty } from 'maplestory/dist/PKG1/IProperty';
import type { IRenderPlanOverrides } from './IRenderPlanOverrides';
import { NodeItemPair } from './NodeItemPair';
import RenderPiece from './RenderPiece';

type CanvasPieces = { child: IProperty; item: NodeItemPair };

export interface ILoadedPieces {
  pieces: Record<string, RenderPiece[]>;
  delays: Record<string, number>;
  minDelay: number;
}
export async function LoadPieces(
  framePairs: NodeItemPair[],
  pieceOverrides: IRenderPlanOverrides,
): Promise<ILoadedPieces> {
  // Reduce down to the individual frame components (Body frame -> `Body`, `Arm`)
  const canvasPieces = framePairs.reduce((total, current) => {
    total.push.apply(
      total,
      current.node.children.map((child) => ({ child, item: current })),
    );

    return total;
  }, [] as CanvasPieces[]);

  // Handle any UOLs / InLinks / OutLinks and pair with the original
  const resolvedCanvasPieces = (await Promise.all(
    canvasPieces.map(async (canvasPiece) => {
      let resolved = null;
      let nextResolved = await canvasPiece.child.resolve();

      do {
        resolved = nextResolved;
        nextResolved = await resolved.resolve();
      } while (nextResolved != resolved);

      return {
        ...canvasPiece,
        resolved,
      };
    }),
  )) as (CanvasPieces & { resolved: IProperty })[];

  let delays = {} as Record<string, number>;

  // Make our render piece meta objects and build a dictionary
  const pieces = resolvedCanvasPieces
    .filter((resolvedPiece) => {
      if (resolvedPiece.child.name === 'delay') delays[resolvedPiece.item.item.id] = resolvedPiece.child.value;
      return resolvedPiece.child.type === 'canvas' || resolvedPiece.resolved.type === 'canvas';
    })
    .map((resolvedPiece) => new RenderPiece(resolvedPiece.item, resolvedPiece.child, resolvedPiece.resolved))
    .reduce((total, current) => {
      let piece = current;

      if (pieceOverrides && pieceOverrides.slots) {
        const overrides = pieceOverrides.slots[current.slot];
        if (overrides) {
          piece = Object.assign(current, overrides);
        }
      }

      if (!current.visible) return total;

      // TODO: Should this be .z or .slot?
      // Seems like .z, but I feel like .slot factors in here some-how.
      const name = current.z || current.slot;
      if (total[name]) total[name].push(piece);
      else total[name] = [piece];
      return total;
    }, {} as Record<string, RenderPiece[]>);

  return {
    pieces,
    delays,
    minDelay: Math.min(...Object.values(delays)),
  };
}
