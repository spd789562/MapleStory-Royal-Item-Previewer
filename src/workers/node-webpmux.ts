import { Buffer } from 'buffer';

import type { CharacterFrame } from '@/utils/maplestory';
import { MessageType } from './const';

interface ISize {
  width: number;
  height: number;
}

export interface WorkerCharacterFrame extends Omit<CharacterFrame, 'canvas' | 'frame' | 'buffer'> {
  buffer: Buffer;
}

let WebP: any = null;

let isInit = false;

async function getImageFromBuffer(buff: Buffer, { width, height }: ISize) {
  const image = await WebP.Image.getEmptyImage();
  await image.setImageData(buff, { width, height });
  return image;
}

async function _getWebPFromSingleFrame(frame: CharacterFrame): Promise<string> {
  const { x: width, y: height } = frame.size;
  const image = await getImageFromBuffer(frame.buffer!, { width, height });

  const resultArrBuff = await image.save(null);

  return `data:image/webp;base64,${resultArrBuff.toString('base64')}`;
}

async function _getWebPFromFrames(frames: CharacterFrame[], { width, height }: ISize): Promise<string> {
  /* generate all frames */
  const webPImages = await Promise.all(frames.map((frame) => getImageFromBuffer(frame.buffer!, { width, height })));
  const webPFrames = await Promise.all(
    frames.map((frame, index) =>
      WebP.Image.generateFrame({ img: webPImages[index], delay: frame.delay, x: 0, y: 0, dispose: true }),
    ),
  );

  // create empty animate image
  // const aniImg = await WebP.Image.getEmptyImage();
  // aniImg.convertToAnim();

  // aniImg.frames.push(...webPFrames);

  const resultArrBuff = await WebP.Image.save(null, { frames: webPFrames, width, height });

  return `data:image/webp;base64,${resultArrBuff.toString('base64')}`;
}

self.onmessage = async (event: MessageEvent<{ type: MessageType; data: any; _id: string }>) => {
  const { type, data, _id } = event.data;
  switch (type) {
    case MessageType.Init: {
      if (!isInit) {
        /* @ts-ignore */
        self.window = {};
        /* this module need dynamic import with empty window, prevent import io error */
        WebP = await import('node-webpmux');
        await WebP.Image.initLib();
        isInit = true;
      }
      postMessage({ type, data: { success: true } });
      break;
    }
    case MessageType.GetWebPFromFrames: {
      const { frames, size } = data;
      let result = '';
      if (frames.length === 1) {
        result = await _getWebPFromSingleFrame(frames[0]);
      } else {
        result = await _getWebPFromFrames(frames, size);
      }
      postMessage({ type, _id, data: { result } });
      break;
    }
    default:
      break;
  }
};
