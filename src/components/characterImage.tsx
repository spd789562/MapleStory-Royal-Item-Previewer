'use client';
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';

import Skeleton from '@mui/material/Skeleton';

import { getWebPFromCharacterData, CharacterData, CharacterFrame } from '@/utils/maplestory';
import { useWorker } from '@/workers/workerContext';
import { MessageType } from '@/workers/const';

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
  getWebp: () => Promise<string>;
}
const CharacterImage = ({ data: characterData, name, forwardedRef }: CharacterImageProps) => {
  const abortIdRef = useRef<number | null>(null);
  const parsedDataRef = useRef<ParsedData | null>(null);
  const [isLoaded, setIsLoaded] = useState(true);
  const [webp, setWebp] = useState<string | null>(null);
  const wepWorker = useWorker('node-webpmux');

  useEffect(() => {
    if (characterData && wepWorker) {
      setIsLoaded(false);
      const abortId = new Date().getTime();
      abortIdRef.current = abortId;
      parsedDataRef.current = null;
      getWebPFromCharacterData(characterData)
        .then((data) => {
          if (abortIdRef.current !== abortId) return;

          return new Promise((resolve) => {
            const _id = Math.random().toString(36).substr(2, 9);
            const completeWepEvent = (e: MessageEvent) => {
              if (e.data.type === MessageType.GetWebPFromFrames && e.data._id === _id) {
                resolve({
                  ...data,
                  url: e.data.data.result,
                });
                wepWorker.removeEventListener('message', completeWepEvent);
              }
            };
            wepWorker.addEventListener('message', completeWepEvent);
            wepWorker.postMessage({ type: MessageType.GetWebPFromFrames, data, _id });
          });
        })
        .then((data: any) => {
          parsedDataRef.current = data;
          setWebp(data.url);
          setIsLoaded(true);
        });
    }
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
      async getWebp() {
        if (!parsedDataRef.current) return '';
        return parsedDataRef.current.url;
      },
    }),
    [isLoaded],
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

export default CharacterImage;
