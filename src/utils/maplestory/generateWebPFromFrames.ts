import WebP from 'node-webpmux';
import { Buffer } from 'buffer';

import type { CharacterFrame } from '.';

interface ISize {
  width: number;
  height: number;
}

async function getImageFromBuffer(buff: Buffer, { width, height }: ISize) {
  const image = await WebP.Image.getEmptyImage();
  await image.setImageData(buff, { width, height });
  return image;
}

async function _getWebPFromSingleFrame(frame: CharacterFrame): Promise<string> {
  const { x: width, y: height } = frame.size;
  const frameCtx = frame.canvas.getContext('2d')!;
  const imageData = frameCtx.getImageData(0, 0, width, height);
  const image = await getImageFromBuffer(Buffer.from(imageData.data.buffer), { width, height });

  const resultArrBuff = await image.save(null);

  return `data:image/webp;base64,${resultArrBuff.toString('base64')}`;
}

async function _getWebPFromFrames(frames: CharacterFrame[], { width, height }: ISize): Promise<string> {
  const _bufferdFrames = frames.map((frame) => {
    const frameCtx = frame.canvas.getContext('2d', { willReadFrequently: true })!;
    const _frameData = frameCtx.getImageData(0, 0, frame.size.x || width, frame.size.y || height);

    frame.canvas.width = width;
    frame.canvas.height = height;

    frameCtx.clearRect(0, 0, width, height);
    frameCtx.putImageData(_frameData, -frame.offset.x, -frame.offset.y);

    const frameData = frameCtx.getImageData(0, 0, width, height);

    const frameBuffer = Buffer.from(frameData.data.buffer);
    return {
      ...frame,
      buffer: frameBuffer,
    };
  });

  /* generate all frames */
  const webPImages = await Promise.all(
    _bufferdFrames.map((frame) => getImageFromBuffer(frame.buffer, { width, height })),
  );
  const webPFrames = await Promise.all(
    _bufferdFrames.map((frame, index) =>
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

export async function generateWebPFromFrames(frames: CharacterFrame[], size?: ISize): Promise<string> {
  await WebP.Image.initLib();

  if (frames.length === 1) {
    return _getWebPFromSingleFrame(frames[0]);
  }

  const firstFrameSize = frames[0].size;
  const { width, height } = size || { width: firstFrameSize.x, height: firstFrameSize.y };

  return _getWebPFromFrames(frames, { width, height });
}
