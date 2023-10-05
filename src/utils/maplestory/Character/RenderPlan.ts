// import { Matrix } from "ts-matrix";
import type { IProperty } from 'maplestory/dist/PKG1/IProperty';
import IVector from 'maplestory/dist/PKG1/IVector';
import { RenderableBounds } from 'maplestory/dist/Utilities/RenderableBounds';
import type { IRenderPlanOverrides } from './IRenderPlanOverrides';
import type { IRenderRequest } from './IRenderRequest';
import { NodeItemPair } from './NodeItemPair';
import RenderPiece from './RenderPiece';
import ItemUtilities from 'maplestory/dist/Item/Utilities';
import { type ILoadedPieces, LoadPieces } from './PiecesLoader';
import { AnchorResults, BuildAnchors } from './AnchorMapBuilder';
import { ComputeLocks, LockResults } from './LockResolver';
import { CalcBounds, CalcFeetCenterPosition } from './PositionCalculator';
import { InternalType } from './IItemEntry';
import { asyncRequestIdleCallback } from '@/utils/requestIdleCallback';

export class RenderPlan {
  framePairs: NodeItemPair[];
  request: IRenderRequest;
  renderedCanvas?: HTMLCanvasElement;
  loadedPieces: ILoadedPieces;
  locks: LockResults;
  anchors: AnchorResults;
  bounds: RenderableBounds;
  feetCenter: IVector;
  minimumDelay: number;

  constructor(request: IRenderRequest, framePairs?: Array<NodeItemPair>, copyFromPlan?: RenderPlan) {
    if (copyFromPlan) {
      this.framePairs = copyFromPlan.framePairs;
      this.loadedPieces = copyFromPlan.loadedPieces;
      this.locks = copyFromPlan.locks;
      this.anchors = copyFromPlan.anchors;
      this.minimumDelay = copyFromPlan.minimumDelay;
      this.request = request;

      this.bounds = CalcBounds(this.request, this.anchors, this.locks);
      this.feetCenter = CalcFeetCenterPosition(this.request, this.bounds, this.anchors);
    } else if (framePairs) {
      this.framePairs = framePairs;
      this.request = request;
    } else throw new Error('Need either a render plan to copy from or a set of framePairs to build off of');
  }

  async Initialize(pieceOverrides: IRenderPlanOverrides) {
    const { zmap, smap } = this.GetMappings();

    this.loadedPieces = await LoadPieces(this.framePairs, pieceOverrides);
    this.locks = await ComputeLocks(this.loadedPieces.pieces, zmap, smap);
    this.anchors = BuildAnchors(this.request, this.locks.lockedPieces);
    this.bounds = CalcBounds(this.request, this.anchors, this.locks);
    this.feetCenter = CalcFeetCenterPosition(this.request, this.bounds, this.anchors);
    this.minimumDelay = Math.min(...Object.values(this.loadedPieces.delays));
  }

  GetMappings() {
    // There isn't a real way to reconcile differences between zmaps, so we load all and use the lowest item ID
    // TODO: Potentially only load for >0 and <20000?
    const firstItem = this.framePairs.sort((a, b) => a.item.id - b.item.id)[0];
    const { zmap, smap } = firstItem;

    return { zmap, smap };
  }

  // Rendering:

  Render(canvas?: HTMLCanvasElement) {
    return this.GenerateImageToCanvas(canvas);
  }

  async GenerateImageToCanvas(canvas?: HTMLCanvasElement): Promise<HTMLCanvasElement> {
    if (this.renderedCanvas) return this.renderedCanvas;

    // console.log("Rendering with bounds...", {...this.Bounds})

    let canvasTarget = canvas;
    if (!canvasTarget) {
      canvasTarget = document.createElement('canvas');
      canvasTarget.style.display = 'none';
    }

    canvasTarget.width = this.bounds.size.x;
    canvasTarget.height = this.bounds.size.y;
    document.body.appendChild(canvasTarget);

    const ctx = canvasTarget.getContext('2d')!;
    ctx.globalCompositeOperation = 'source-over';

    const { zmap } = this.GetMappings();

    if (this.request.flipX) {
      ctx.translate(this.bounds.size.x, 0);
      ctx.scale(-1, 1);
    }
    ctx.scale(this.request.zoom, this.request.zoom);

    ctx.translate(this.bounds.offset.x, this.bounds.offset.y);

    await zmap.reduce(async (total, name) => {
      await total;

      const pieces = this.locks.lockedPieces[name];
      if (!pieces || !pieces.length) return total;

      if (pieces.length > 1) {
        pieces.sort((a, b) => (a.item.item.internal || 0) - (b.item.item.internal || 0));
      }

      await Promise.all(
        pieces.map(async (piece) => {
          const offset = this.anchors.calculatedOffsets[piece.slotName];

          let realRenderLocation = {} as IVector;
          if (piece.origin && offset) {
            realRenderLocation = {
              x: offset.x - (piece.origin.x || 0),
              y: offset.y - (piece.origin.y || 0),
            };
          } else if (offset) {
            realRenderLocation = offset;
          } else if (piece.origin) {
            realRenderLocation = piece.origin;
          }

          const pieceTexture = await asyncRequestIdleCallback(
            async () => await (piece.item.item.hue ? piece.GetHueCanvasTexture() : piece.GetCanvasTexture()),
          );

          ctx.save();
          const originalOptions = piece.item.item;

          if (piece.item.item.internal == InternalType.HairDye && this.request.hairDye) {
            const offsetAlpha =
              this.request.selectedItems.Hair.alpha == null ? 1 : this.request.selectedItems.Hair.alpha;
            ctx.globalAlpha = this.request.hairDye.percentile * offsetAlpha;
          } else if (originalOptions.alpha != null) ctx.globalAlpha = originalOptions.alpha;

          ctx.drawImage(pieceTexture, realRenderLocation.x, realRenderLocation.y);

          ctx.restore();
        }),
      );
    }, Promise.resolve());

    if (!canvas) {
      canvasTarget.remove();
      canvasTarget.style.display = 'block';
    }

    this.renderedCanvas = canvasTarget;
    return canvasTarget;
  }
}
