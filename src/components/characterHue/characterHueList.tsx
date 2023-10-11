'use client';
import { useState, useEffect, useRef } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { getUndyeableIdsSelector } from '@/store/characterItems';
import { characterHueCanvases, characterHueLoadingSelector, characterHueCountSelector } from '@/store/characterHue';
import { hueChatacterSelector } from '@/store/selector';

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
  paddingBottom: theme.spacing(4),
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
  align-self: center;
`;

export interface CharacterHueListRef {
  canvasList: HTMLCanvasElement[];
}
export interface CharacterHueListProps {}
function CharacterHueList({}: CharacterHueListProps) {
  const [characterUrlList, setCharacterUrlList] = useState<string[]>([]);
  const hueCount = useRecoilValue(characterHueCountSelector);
  const setCharacterHueCanvases = useSetRecoilState(characterHueCanvases);
  const setIsLoading = useSetRecoilState(characterHueLoadingSelector);
  const [imgWidth, setImgWidth] = useState(100);
  const characterData = useRecoilValue(hueChatacterSelector);
  const undyeableIds = useRecoilValue(getUndyeableIdsSelector);

  useEffect(() => {
    let abortId = new Date().getTime();
    if (characterData) {
      setIsLoading(true);
      getHueCharacterCanvasList(characterData, hueCount, undyeableIds)
        .then((list) => {
          if (!abortId) return Promise.reject('cancel load');
          setCharacterHueCanvases(list);
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
          setCharacterUrlList(urls);
        })
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
    }
    if (!characterData) {
      setCharacterUrlList([]);
    }
    return () => {
      abortId = 0;
      setCharacterHueCanvases([]);
    };
  }, [characterData, undyeableIds, hueCount]);

  return (
    <HueGrid colWidth={imgWidth}>
      {characterUrlList.map((url, index) => (
        <HueGridItem key={index}>
          <img className="max-w-full" src={url} />
        </HueGridItem>
      ))}
      {characterUrlList.length === 0 &&
        new Array(hueCount).fill(0).map((_, index) => (
          <HueGridItem key={index}>
            <Skeleton variant="rectangular" width={100} height={110} animation={false} />
          </HueGridItem>
        ))}
    </HueGrid>
  );
}

export default CharacterHueList;
