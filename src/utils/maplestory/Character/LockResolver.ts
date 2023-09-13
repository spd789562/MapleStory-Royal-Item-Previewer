import ItemUtilities from '../Item/Utilities';
import { NodeItemPair } from './NodeItemPair';
import RenderPiece from './RenderPiece';

export interface LockResults {
  locks: Record<string, NodeItemPair>;
  lockedPieces: Record<string, RenderPiece[]>;
}

function BuildEquipExclusiveLocks(
  zmap: string[],
  allPieces: Record<string, RenderPiece[]>,
): Record<string, NodeItemPair> {
  // Priority off of the zmap and build a dictionary of which items have which locks
  const locks = zmap.reduce((total, current) => {
    const pieces = allPieces[current];
    if (!pieces || !pieces.length) return total;

    pieces.forEach((piece) => piece.item.islot.forEach((demandLock) => (total[demandLock] = piece.item)));
    return total;
  }, {} as Record<string, NodeItemPair>);

  // If any item didn't get all of its demanded locks, remove extraneous / failed locks
  zmap.forEach((zmapLine) => {
    const pieces = allPieces[zmapLine];
    if (!pieces || !pieces.length) return;

    pieces.forEach((piece) => {
      const requiredLocks = piece.item.islot;
      const hasAllLocks = requiredLocks.every((exclusiveLock) => locks[exclusiveLock] == piece.item);

      // Item can't be rendered as it doesn't have its required locks
      if (!hasAllLocks) {
        requiredLocks.forEach((exclusiveLock) => {
          if (locks[exclusiveLock] == piece.item) delete locks[exclusiveLock];
        });
      }
    });
  });

  return locks;
}

export async function ComputeLocks(
  allPieces: Record<string, RenderPiece[]>,
  zmap: string[],
  smap: Record<string, string[]>,
): Promise<LockResults> {
  const body = allPieces.body || allPieces.backBody;
  const faceProperty = await body[0].item.node.resolve('face'); // There should really only ever be one body tbh
  // Can have a face if we don't have a face property, or the value isn't 0
  const hasFace = faceProperty !== null && faceProperty.value != 0;

  let allowedPieces = { ...allPieces };

  // If the body explicitly removes the face, remove face + any accessories
  if (!hasFace) {
    Object.keys(allowedPieces).map((pieceName) => {
      const pieces = allowedPieces[pieceName];
      allowedPieces[pieceName] = pieces.filter((piece) => {
        const isFaceRelated = ItemUtilities.prototype.IsFaceOrAccessoryId(piece.item.item.id);
        return !isFaceRelated;
      });
    });
    // allowedPieces = allowedPieces;
  }

  // Stage 1: Determine locked in high-level equips
  // This is so EquipA can completely lock out EquipB (probably for Cash items?)
  const lockedInItems = BuildEquipExclusiveLocks(zmap, allowedPieces);

  const locks = zmap.reduce((total, zmapLine) => {
    const piece = lockedInItems[zmapLine];
    if (!piece) return total;

    piece.vslot.forEach((slot) => (total[slot] = piece));
    return total;
  }, {} as Record<string, NodeItemPair>);

  const lockedPieces = {} as Record<string, RenderPiece[]>;
  let capType = 0;

  /* logic from https://github.com/Elem8100/MapleStory-GM-Client/blob/master/Src/MapleCharacter.pas */
  if (locks.Cp) {
    const vslot = (locks.Cp.vslot || []).join('');
    if (vslot === 'Cp' || vslot === 'CpH5') {
      capType = 0;
    } else if (vslot === 'CpH1H5') {
      capType = 1;
    } else if (vslot.length > 12) {
      if (vslot.startsWith('CpH1H3')) {
        capType = 2;
      } else {
        capType = 3;
      }
    }

    if (capType === 1 || capType === 2) {
      allowedPieces.hairOverHead &&
        (allowedPieces.hairOverHead = allowedPieces.hairOverHead.filter(
          (piece) => !ItemUtilities.prototype.IsHairId(piece.item.item.id),
        ));
      allowedPieces.backHair &&
        (allowedPieces.backHair = allowedPieces.backHair.filter(
          (piece) => !ItemUtilities.prototype.IsHairId(piece.item.item.id),
        ));
    }

    if (capType === 2) {
      allowedPieces.hairBelowBody &&
        (allowedPieces.hairBelowBody = allowedPieces.hairBelowBody.filter(
          (piece) => !ItemUtilities.prototype.IsHairId(piece.item.item.id),
        ));
      allowedPieces.backHairBelowCap &&
        (allowedPieces.backHairBelowCap = allowedPieces.backHairBelowCap.filter(
          (piece) => !ItemUtilities.prototype.IsHairId(piece.item.item.id),
        ));
    }
    if (capType === 3) {
      Object.keys(allowedPieces).forEach((pieceName) => {
        const pieces = allowedPieces[pieceName];
        allowedPieces[pieceName] = pieces.filter((piece) => !ItemUtilities.prototype.IsHairId(piece.item.item.id));
      });
    }
  }

  // Determine if the individual pieces have required locks
  Object.keys(allowedPieces).forEach((pieceName) => {
    const pieces = allowedPieces[pieceName];
    lockedPieces[pieceName] = pieces.filter((piece) => {
      // Check Pants/Shoes if this gets changed, as the opposite coalescance causes pants to disappear with shoes...
      // forcing use vslot for hat here
      let pieceRequiredLock = ItemUtilities.prototype.IsCapId(piece.item.item.id)
        ? piece.item.vslot
        : smap[piece.slot] || piece.item.vslot;

      // Should we just check the pieceName?
      if (piece.slot === 'pants') {
        // Thanks Nexon
        pieceRequiredLock = ['Pn'];
      }
      if (piece.slot === 'mailArm') {
        // weird
        pieceRequiredLock = ['Ma'];
      }

      const pieceHasLocks = pieceRequiredLock?.every((requiredLock) => {
        const hasLock = locks[requiredLock] === piece.item || !locks[requiredLock];

        if (
          !hasLock &&
          piece.item.allowConflictingLocksWith &&
          locks[requiredLock] === piece.item.allowConflictingLocksWith
        ) {
          // Override, to allow for dyed hair
          return true;
        } else if (!hasLock && locks[requiredLock].allowConflictingLocksWith === piece.item) {
          // Inverse relationship because we can't guarantee ordering
          return true;
        } else if (piece.canvas.name === 'head') {
          // Ignored head pieces, some coverd head will not correct ancher to head
          // piece.item.item.visible = false;
          return true;
        }

        return hasLock;
      });
      // Item piece has no locks, can just continue

      piece.lockBlame = pieceRequiredLock?.map((requiredLock) => locks[requiredLock]);
      piece.hasLock = !pieceRequiredLock || pieceHasLocks;

      return !pieceRequiredLock || pieceHasLocks;
    });
  });

  return {
    locks,
    lockedPieces,
  };
}
