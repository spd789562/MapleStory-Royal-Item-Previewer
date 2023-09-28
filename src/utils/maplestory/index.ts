'use client';
import MapleStory from 'maplestory/dist/bundle';
import CharacterRenderer from './Character/Renderer';
import ItemUtilities from './Item/Utilities';
import type { RenderPlan } from 'maplestory/dist/Character/RenderPlan';
import type { IVector, IRenderRequest } from 'maplestory';
import type { IItemEntry } from './Character/IItemEntry';

import { Buffer } from 'buffer';
import { produce } from 'immer';
import { asyncRequestIdleCallback } from '@/utils/requestIdleCallback';

const MapleStoryJs = new MapleStory({
  Endpoint: 'https://store.maplestory.io/api',
});

/* override origin CharacterRenderer and ItemUtilities */
/* @ts-ignore */
MapleStoryJs.CharacterRenderer = new CharacterRenderer(MapleStoryJs.ItemUtilities, MapleStoryJs.DataFactory);
/* @ts-ignore */
MapleStoryJs.ItemUtilities = new ItemUtilities(MapleStoryJs.DataFactory);

// MapleStoryJs.Network.RegisterEventMonitor((moniter) => {
//   console.log('moniter create:', moniter.Name, moniter);
//   moniter.RegisterNotifyOnComplete((monitor) => {
//     console.log('moniter complete:', monitor.Name, moniter);
//     return null;
//   });
//   return null;
// });

export interface CharacterFrame {
  canvas: HTMLCanvasElement;
  frame: RenderPlan;
  offset: IVector;
  size: IVector;
  delay?: number;
  buffer?: Buffer;
}

export interface CharacterData extends Omit<IRenderRequest, 'id' | 'skin' | 'selectedItems'> {
  id?: number;
  skin?: number;
  selectedItems: Record<string, IItemEntry>;
}

export async function getWebPFromCharacterData(data: CharacterData) {
  const plan = await MapleStoryJs.CharacterRenderer.GenerateAnimatedRenderPlan(data as unknown as IRenderRequest);
  const allFrames = await Promise.all(
    plan.frames.map((frame) => asyncRequestIdleCallback(async () => await frame.Render())),
  );
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

  return {
    frames: frames.map((frame) => {
      const $canvas = document.createElement('canvas');
      $canvas.width = plan.width;
      $canvas.height = plan.height;
      const ctx = $canvas.getContext('2d', { willReadFrequently: true })!;

      ctx.drawImage(frame.canvas, -frame.offset.x, -frame.offset.y);

      const frameData = ctx.getImageData(0, 0, plan.width, plan.height);

      const frameBuffer = Buffer.from(frameData.data.buffer);

      return {
        ...frame,
        buffer: frameBuffer,
      };
    }) as (CharacterFrame & { buffer: Buffer })[],
    size: {
      width: plan.width,
      height: plan.height,
    },
  };
}

const defaultHueFilterParts = ['Body', 'Head', 'Hair', 'Face'];

export async function getHueCharacterCanvasList(data: CharacterData, count: number, filterIds: number[] = []) {
  const list: CharacterData[] = [];
  const iter = Math.floor(360 / count);
  for (let i = 0; i < count; i++) {
    list.push(
      produce(data, (draft) => {
        draft.frame = 0;
        Object.keys(draft.selectedItems).forEach((part) => {
          if (defaultHueFilterParts.includes(part)) return;
          if (filterIds.includes(draft.selectedItems[part]!.id)) return;
          draft.selectedItems[part].hue = i * iter;
        });
      }),
    );
  }
  const plans = await Promise.all(
    list.map((data) =>
      asyncRequestIdleCallback(
        async () => await MapleStoryJs.CharacterRenderer.GenerateRenderPlan(data as unknown as IRenderRequest),
      ),
    ),
  );
  return Promise.all(plans.map((plan) => asyncRequestIdleCallback(async () => await plan.Render())));
}

export default MapleStoryJs;
