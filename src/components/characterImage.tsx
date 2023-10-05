'use client';
import { useEffect, useState, useRef, useImperativeHandle, memo } from 'react';

import Skeleton from '@mui/material/Skeleton';

import { getWebPFromCharacterData, CharacterData, CharacterFrame } from '@/utils/maplestory';
import { useWorker } from '@/workers/workerContext';
import { MessageType } from '@/workers/const';
import type { WorkerCharacterFrame } from '@/workers/node-webpmux';

import { encode } from 'modern-gif';

interface ParsedData {
  url: string; // dataurl
  size: {
    width: number;
    height: number;
  };
  frames: CharacterFrame[];
}

export interface CharacterImageProps {
  data?: CharacterData;
  name?: string;
  forwardedRef?: React.Ref<CharacterImageRef>;
}
export interface CharacterImageRef {
  getGif: () => Promise<Uint8Array | null>;
  getWebp: () => string;
  getIsLoading: () => boolean;
  name?: string;
}
const CharacterImage = ({ data: characterData, name, forwardedRef }: CharacterImageProps) => {
  const parsedDataRef = useRef<ParsedData | null>(null);
  const [isLoaded, setIsLoaded] = useState(true);
  const [webp, setWebp] = useState<string | null>(null);
  const wepWorker = useWorker('node-webpmux');

  useEffect(() => {
    let abortId = new Date().getTime();
    if (characterData && wepWorker) {
      setIsLoaded(false);
      parsedDataRef.current = null;
      getWebPFromCharacterData(characterData)
        .then((data) => {
          if (!abortId) return Promise.reject('cancel load');

          return new Promise((resolve, reject) => {
            const _id = Math.random().toString(36).substr(2, 9);
            const workerNeedFrames: WorkerCharacterFrame[] = data.frames.map((frame) => ({
              buffer: frame.buffer,
              size: frame.size,
              offset: frame.offset,
              delay: frame.delay,
            }));
            const completeWepEvent = (e: MessageEvent) => {
              if (e.data.type === MessageType.GetWebPFromFrames && e.data._id === _id) {
                if (!abortId) return reject('cancel load');
                resolve({
                  ...data,
                  url: e.data.data.result,
                });
                wepWorker.removeEventListener('message', completeWepEvent);
              }
            };
            wepWorker.addEventListener('message', completeWepEvent);
            wepWorker.postMessage({
              type: MessageType.GetWebPFromFrames,
              data: {
                frames: workerNeedFrames,
                size: data.size,
              },
              _id,
            });
          });
        })
        .then((data: any) => {
          if (!abortId) return Promise.reject('cancel load');
          parsedDataRef.current = data;
          setWebp(data.url);
        })
        .catch((e) => {})
        .finally(() => {
          setIsLoaded(true);
        });
    }
    if (!characterData) {
      setWebp(null);
    }
    return () => {
      abortId = 0;
      if (parsedDataRef.current) {
        parsedDataRef.current = null;
      }
    };
  }, [characterData]);

  useImperativeHandle(
    forwardedRef,
    () => ({
      async getGif() {
        if (!parsedDataRef.current) return null;
        const { frames, size } = parsedDataRef.current;
        const gif = await encode({
          width: size.width,
          height: size.height,
          looped: true,
          frames: frames.map((frame) => ({
            imageData: frame.canvas,
            delay: frame.delay,
            left: -frame.offset.x,
            top: -frame.offset.y,
            width: frame.size.x,
            height: frame.size.y,
            disposal: 2,
          })),
        });
        return gif;
      },
      getWebp() {
        if (!parsedDataRef.current) return '';
        return parsedDataRef.current.url;
      },
      getIsLoading: () => isLoaded && Boolean(parsedDataRef.current?.url),
      name,
    }),
    [isLoaded, name],
  );

  return (
    <div className="w-full h-full flex justify-center items-center" style={{ minHeight: 100 }}>
      {isLoaded && webp ? (
        <img src={webp} alt={name || 'character image'} />
      ) : (
        <Skeleton variant="rectangular" sx={{ height: 100, minWidth: '100%' }} animation={isLoaded ? false : 'wave'} />
      )}
    </div>
  );
};

export default memo(CharacterImage);
