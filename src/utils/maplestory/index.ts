'use client';
import MapleStory from 'maplestory/dist/bundle';
import CharacterRenderer from './Character/Renderer';
import ItemUtilities from './Item/Utilities';
import type { RenderPlan } from 'maplestory/dist/Character/RenderPlan';
import type { IVector, IRenderRequest } from 'maplestory';
import type { IItemEntry } from './Character/IItemEntry';

import { generateWebPFromFrames } from './generateWebPFromFrames';

const MapleStoryJs = new MapleStory({
  Endpoint: 'https://store.maplestory.io/api',
});

/* override origin CharacterRenderer and ItemUtilities */
/* @ts-ignore */
MapleStoryJs.CharacterRenderer = new CharacterRenderer(MapleStoryJs.ItemUtilities, MapleStoryJs.DataFactory);
/* @ts-ignore */
MapleStoryJs.ItemUtilities = new ItemUtilities(MapleStoryJs.DataFactory);

export interface CharacterFrame {
  canvas: HTMLCanvasElement;
  frame: RenderPlan;
  offset: IVector;
  size: IVector;
  delay?: number;
}

export interface CharacterData extends Omit<IRenderRequest, 'id' | 'skin' | 'selectedItems'> {
  id?: number;
  skin?: number;
  selectedItems: Record<string, IItemEntry>;
}

export async function getWebPFromCharacterData(data: CharacterData) {
  const plan = await MapleStoryJs.CharacterRenderer.GenerateAnimatedRenderPlan(data as unknown as IRenderRequest);
  const allFrames = await Promise.all(plan.frames.map((frame) => frame.Render()));
  const frames: CharacterFrame[] = allFrames.map((frame, index) => ({
    canvas: frame,
    delay: plan.frames[index]!.minimumDelay,
    frame: plan.frames[index]!,
    offset: {
      x: plan.frames[index]!.feetCenter.x - plan.MaxFeetPosition.x || 0,
      y: plan.frames[index]!.feetCenter.y - plan.MaxFeetPosition.y || 0,
    },
    size: {
      x: plan.frames[index]!.bounds.size.x,
      y: plan.frames[index]!.bounds.size.y,
    },
  }));

  return generateWebPFromFrames(frames, {
    width: plan.width,
    height: plan.height,
  });
}

export default MapleStoryJs;
