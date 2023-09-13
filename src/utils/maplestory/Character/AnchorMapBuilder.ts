import IVector from 'maplestory/dist/PKG1/IVector';
import type { IRenderRequest } from './IRenderRequest';
import RenderPiece from './RenderPiece';

export interface AnchorResults {
  anchors: Record<string, IVector>;
  calculatedOffsets: Record<string, IVector>;
}

export function BuildAnchors(request: IRenderRequest, lockedPieces: Record<string, RenderPiece[]>): AnchorResults {
  let allPieces = Object.values(lockedPieces)
    .reduce((total, current) => {
      return [...total, ...current];
    }, [])
    .filter((piece) => Object.keys(piece.map).length > 0)
    .reverse();

  const anchors = {
    navel: { x: 0, y: 0 },
  } as Record<string, IVector>;

  if (request.action.startsWith('alert') || request.action.startsWith('heal')) {
    switch (Number(request.frame)) {
      case 0:
        anchors['handMove'] = { x: -8, y: -2 };
        break;
      case 1:
        anchors['handMove'] = { x: -10, y: 0 };
        break;
      case 2:
        anchors['handMove'] = { x: -12, y: 3 };
        break;
    }
  }

  // Keep iterating until there's no more missing offsets
  let advanced = true;
  const calculatedOffsets = {} as Record<string, IVector>;
  while (allPieces.length > 0) {
    if (!advanced) break;

    advanced = false;
    // Search for an offset that works
    for (let i = 0; i < allPieces.length; ++i) {
      const piece = allPieces[i];
      const { map } = piece;
      const anchoredOffsetName = Object.keys(map).find((anchorName) => anchors[anchorName]);
      const anchoredOffset = anchoredOffsetName && map[anchoredOffsetName];

      // If this offset doesn't have an anchor, continue searching
      if (!anchoredOffset) continue;

      const anchoredTo = anchors[anchoredOffsetName];
      const computedOffset = {
        x: anchoredTo.x - anchoredOffset.x,
        y: anchoredTo.y - anchoredOffset.y,
        basedOffAnchor: anchoredTo,
        anchorDistance: anchoredOffset,
        anchorName: anchoredOffsetName,
      };

      calculatedOffsets[piece.slot || piece.z] = computedOffset;

      // Push any new offsets to the established anchors
      Object.keys(map)
        .filter((offset) => offset != anchoredOffsetName)
        .forEach((childOffsetName) => {
          const childOffset = map[childOffsetName];
          const computedNewAnchor = {
            x: computedOffset.x + childOffset.x,
            y: computedOffset.y + childOffset.y,
          };

          const existingAnchor = anchors[childOffsetName];
          if (!existingAnchor) anchors[childOffsetName] = computedNewAnchor;
          // else console.warn("Anchor offset chain doesn't seem valid");
        });

      allPieces = allPieces.filter((c) => c != piece);
      advanced = true;
    }
  }

  return {
    calculatedOffsets,
    anchors,
  };
}
