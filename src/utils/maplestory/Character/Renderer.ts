import ItemUtilities from 'maplestory/dist/Item/Utilities';
import PKG1Factory from 'maplestory/dist/PKG1/Factory';
import type { IProperty } from 'maplestory/dist/PKG1/IProperty';
import { type IItemEntry, InternalType } from './IItemEntry';
import type { IRenderRequest } from './IRenderRequest';
import RenderPiece from './RenderPiece';
import { NodeItemPair } from './NodeItemPair';
import { RenderPlan } from './RenderPlan';
import type { IRenderPlanOverrides } from './IRenderPlanOverrides';
import { AnimatedRenderPlan } from './AnimatedRenderPlan';
import type { IGenerateRenderPlans } from './IGenerateRenderPlans';
import type { IGenerateMaxFrames } from './ICalculateMaxFrames';

export default class CharacterRenderer implements IGenerateRenderPlans, IGenerateMaxFrames {
  private itemUtility: ItemUtilities;
  dataFactory: PKG1Factory;
  cachedPlans: Record<string, RenderPlan>;

  constructor(itemUtility: ItemUtilities, dataFactory: PKG1Factory) {
    this.itemUtility = itemUtility;
    this.dataFactory = dataFactory;
    this.cachedPlans = {};
  }

  HashRenderPlanRequest(request: IRenderRequest) {
    const hashPieces = [
      request.type,
      request.action,
      request.emotion,
      request.skin,
      request.frame,
      request.mercEars,
      request.illiumEars,
    ];

    if (request.hairDye) {
      hashPieces.push(request.hairDye.colorId);
    }

    hashPieces.push.apply(
      hashPieces,
      Object.keys(request.selectedItems).map((itemName) => {
        const item = request.selectedItems[itemName];
        return [item.id, item.frame, item.action, item.version, item.region].join(',');
      }),
    );

    return hashPieces.join(',');
  }

  async GenerateAnimatedRenderPlan(
    request: IRenderRequest,
    equipOverrides?: Record<string, RenderPiece>,
  ): Promise<AnimatedRenderPlan> {
    const plan = new AnimatedRenderPlan(this, this, request, equipOverrides);
    await plan.Prepare();
    return plan;
  }

  async GenerateRenderPlan(request: IRenderRequest, equipOverrides?: Record<string, RenderPiece>): Promise<RenderPlan> {
    const hash = this.HashRenderPlanRequest(request);

    if (this.cachedPlans[hash]) {
      const cached = this.cachedPlans[hash];

      return new RenderPlan(request, undefined, cached);
    }

    const maxBodyFrame = await this.GetMaxFrames(request);
    const maxFaceFrame = await this.GetMaxFaceFrames(request);

    const framePairs = await this.GetFrameNodes(request, maxBodyFrame, maxFaceFrame);

    const renderPlan = new RenderPlan(request, framePairs);
    await renderPlan.Initialize({
      slots: {
        lefEar: { visible: false } as RenderPiece,
        highlefEar: { visible: false } as RenderPiece,
        ear: { visible: false } as RenderPiece,
      },
    } as IRenderPlanOverrides);

    this.cachedPlans[hash] = renderPlan;
    return renderPlan;
  }

  async GetMaxFaceFrames(request: IRenderRequest, action?: string): Promise<number> {
    return this.GetMaxFrames(request, request.emotion, true);
  }

  async GetMaxFrames(request: IRenderRequest, action?: string, faceFrames?: boolean): Promise<number> {
    const maxFrames = await Promise.all(
      Object.values(request.selectedItems).map(async (item) => {
        const isFace = this.itemUtility.IsFaceOrAccessoryId(item.id);
        if ((isFace && !faceFrames) || (!isFace && faceFrames)) return 0;

        const animationNode = await this.GetAnimationNode(request, item, action);
        if (!animationNode) return 0;
        if (animationNode.children.find((child) => child.type === 'canvas')) return 0;

        const frameIndexes = animationNode.children
          .map((child) => Number(child.name))
          .filter((frameNumber) => !Number.isNaN(frameNumber));

        return Math.max.apply(null, frameIndexes);
      }),
    );

    return Math.max.apply(null, maxFrames);
  }

  private async GetAnimationNode(
    request: IRenderRequest,
    item: IItemEntry,
    action?: string | null,
  ): Promise<IProperty | null> {
    const imgPath = await this.itemUtility.GetItemImgPath(item.region, item.version, item.id);
    if (!imgPath) return null;

    const img = await this.dataFactory.resolve(item.region, item.version, imgPath);
    const isFace = this.itemUtility.IsFaceOrAccessoryId(item.id);
    const animation = isFace ? action || request.emotion || 'default' : action || item.action || request.action;
    let animationNode = await img.resolve(animation);

    if (!animationNode) {
      // Is this a cash item weapon?
      if (Math.floor((item.id - 1000000) / 10000) === 70) {
        // Some cash items require a weapon type to be defined, without it we can't properly resolve to the correct copy of the weapon
        let weaponType = 30;

        // We need to find weapons, this is a bit complicated as the type info isn't consistent across the board and shouldn't be trusted here.
        // So we need to resolve to the Character.wz folders to determine if an item is truly a weapon or not
        const folderPairs = await Promise.all(
          Object.values(request.selectedItems)
            .filter((item) => item != item) // Skip the current item, because we obviously don't need to check ourselves
            .map(async (item) => {
              const folder = await this.itemUtility.GetFolderForItem(item);
              return { item, folder };
            }),
        );
        const pair = folderPairs.find((pair) => pair.folder === 'Weapon');
        if (pair) {
          const matchedItemId = pair.item.id;
          weaponType = Math.floor((matchedItemId - 1000000) / 10000);
          if (weaponType === 70) weaponType = 30;
        } // Fall-through back to weaponType = 30

        animationNode = await img.resolve(`${weaponType}/${animation}`);
      } else {
        // Not sure what else could be happening here, better throw an error and fail early...
        throw new Error("Couldn't resolve to animation node for item");
      }
    }

    if (!animationNode) throw new Error('Invalid emotion/animation supplied');

    return animationNode;
  }

  private async GetFrameNodes(
    request: IRenderRequest,
    maxBodyFrame: number,
    maxFaceFrame: number,
  ): Promise<NodeItemPair[]> {
    const nodes = await Promise.all(
      Object.values(request.selectedItems).map((item) =>
        this.MapItemToFrameNode(request, maxBodyFrame, maxFaceFrame, item),
      ),
    );

    if (request.hairDye && request.hairDye.percentile) {
      const hair = request.selectedItems.Hair;
      const hairNode = nodes.find((node) => node && node.item == hair);
      const hairId = hair.id;
      const baseHairId = Math.floor(hairId / 10) * 10;
      const mappedHairId = baseHairId + request.hairDye.colorId;

      const mapped = await this.MapItemToFrameNode(request, maxBodyFrame, maxFaceFrame, {
        ...hair,
        id: mappedHairId,
        internal: InternalType.HairDye,
      });

      if (mapped && hairNode) {
        mapped.allowConflictingLocksWith = hairNode;
        nodes.push(mapped);
      }
    }

    // Filter out any broken items / nodes
    return nodes.filter((node) => node) as NodeItemPair[];
  }

  private async MapItemToFrameNode(
    request: IRenderRequest,
    maxBodyFrame: number,
    maxFaceFrame: number,
    item: IItemEntry,
  ): Promise<NodeItemPair | null> {
    const isFace = this.itemUtility.IsFaceOrAccessoryId(item.id);
    const animationNode = await this.GetAnimationNode(request, item, null);
    if (!animationNode) throw new Error('Invalid action/animation selected');

    const imgPath = await this.itemUtility.GetItemImgPath(item.region, item.version, item.id);
    const infoNode = await this.dataFactory.resolve(item.region, item.version, `${imgPath}/info`);

    const zmap = await this.dataFactory.getZmap(item.region, item.version);
    const smap = await this.dataFactory.getSmap(item.region, item.version);

    if (animationNode.children.find((child) => child.type === 'canvas'))
      return new NodeItemPair(item, animationNode, infoNode, zmap, smap);

    let frame = item.frame !== undefined ? item.frame! : request.frame!;

    // Handle any frame overflow
    if (isFace) frame = frame % (maxFaceFrame + 1);
    else frame = frame % (maxBodyFrame + 1);

    const frameNode = await animationNode.resolve(frame.toString());

    if (!frameNode) {
      return null; // Some items just don't have all frames available sometimes
      throw new Error('Invalid frame selected');
    }
    return new NodeItemPair(item, frameNode, infoNode, zmap, smap);
  }
}
