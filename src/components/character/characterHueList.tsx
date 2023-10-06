'use client';
import { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { useRecoilValue } from 'recoil';

import { characterDataAtom } from '@/store/character';
import { canLoadCharacterSelector } from '@/store/selector';

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

import { getHueCharacterCanvasList } from '@/utils/maplestory';
import { requestIdleCallback } from '@/utils/requestIdleCallback';

const HueGrid = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'colWidth',
})<{ colWidth: number }>(({ theme, colWidth }) => ({
  display: 'grid',
  gap: theme.spacing(1),
  gridTemplateColumns: `repeat(auto-fit, minmax(${colWidth}px, 1fr))`,
  marginTop: theme.spacing(4),
  justifyContent: 'center',
  /* make resizable and keep center */
  resize: 'horizontal',
  minWidth: '40%',
  overflow: 'auto',
  marginLeft: 'auto',
  marginRight: 'auto',
}));
const HueGridItem = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: fit-content;
`;

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
  const [imgWidth, setImgWidth] = useState(100);
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
          if (list.length > 0 && list[0].width) {
            setImgWidth(list[0].width);
          }
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
    <HueGrid colWidth={imgWidth}>
      {characterCanvasList.map((url, index) => (
        <HueGridItem key={index}>
          <img className="max-w-full" src={url} />
        </HueGridItem>
      ))}
      {characterCanvasList.length === 0 &&
        new Array(hueCount).fill(0).map((_, index) => (
          <HueGridItem key={index}>
            <Skeleton variant="rectangular" width={100} height={110} animation={false} />
          </HueGridItem>
        ))}
    </HueGrid>
  );
}

export default CharacterHueList;
