'use client';
import { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { useRecoilValue } from 'recoil';

import { characterDataAtom } from '@/store/character';
import { canLoadCharacterSelector } from '@/store/selector';

import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

import { getHueCharacterCanvasList } from '@/utils/maplestory';
import { requestIdleCallback } from '@/utils/requestIdleCallback';

export interface CharacterHueListRef {
  canvasList: HTMLCanvasElement[];
}
export interface CharacterHueListProps {
  onChangeLoad: (isLoading: boolean) => void;
  hueCount: number;
  forwardedRef?: React.Ref<CharacterHueListRef>;
}
function CharacterHueList({ onChangeLoad, hueCount, forwardedRef }: CharacterHueListProps) {
  const [characterCanvasList, setCharacterCanvasList] = useState<string[]>([]);
  const canvasListRef = useRef<HTMLCanvasElement[]>([]);
  const characterData = useRecoilValue(characterDataAtom);
  const canLoadCharacter = useRecoilValue(canLoadCharacterSelector);

  useEffect(() => {
    let abortId = new Date().getTime();
    if (characterData && canLoadCharacter) {
      onChangeLoad(true);
      getHueCharacterCanvasList(characterData, hueCount)
        .then((list) => {
          if (!abortId) return Promise.reject('cancel load');
          canvasListRef.current = list;
          return Promise.all(
            list.map(
              (canvas) =>
                new Promise<string>((resolve) => {
                  requestIdleCallback(() => {
                    canvas.toBlob((blob) => {
                      resolve(URL.createObjectURL(blob!));
                    });
                  });
                }),
            ),
          );
        })
        .then((urls) => {
          if (!abortId) return Promise.reject('cancel load');
          setCharacterCanvasList(urls);
        })
        .catch(() => {})
        .finally(() => {
          onChangeLoad(false);
        });
    }
    if (!characterData) {
      setCharacterCanvasList([]);
    }
    return () => {
      abortId = 0;
      canvasListRef.current = [];
    };
  }, [characterData, canLoadCharacter, onChangeLoad, hueCount]);

  useImperativeHandle(
    forwardedRef,
    () => ({
      canvasList: canvasListRef.current,
    }),
    [characterCanvasList],
  );

  return (
    <Grid
      container
      spacing={1}
      display="grid"
      gap={1}
      gridTemplateColumns={{
        xs: 'repeat(2, auto)',
        sm: 'repeat(4, auto)',
        md: 'repeat(6, auto)',
        lg: hueCount > 40 ? 'repeat(8, auto)' : 'repeat(6, auto)',
      }}
      className="mt-2"
      justifyContent="center"
    >
      {characterCanvasList.map((url, index) => (
        <Grid key={index} item display="flex" justifyContent="center" alignItems="center">
          <img src={url} />
        </Grid>
      ))}
      {characterCanvasList.length === 0 &&
        new Array(hueCount).fill(0).map((_, index) => (
          <Grid key={index} item>
            <Skeleton variant="rectangular" width={80} height={110} animation={false} />
          </Grid>
        ))}
    </Grid>
  );
}

export default CharacterHueList;
