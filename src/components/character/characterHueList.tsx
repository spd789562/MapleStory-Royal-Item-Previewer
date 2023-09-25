'use client';
import { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { characterDataAtom } from '@/store/character';
import { canLoadCharacterSelector } from '@/store/selector';

import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

import { getHueCharacterCanvasList } from '@/utils/maplestory';

export interface CharacterHueListRef {
  canvasList: HTMLCanvasElement[];
}
export interface CharacterHueListProps {
  onChangeLoad: (isLoading: boolean) => void;
  hueCount: number;
  forwardedRef?: React.Ref<CharacterHueListRef>;
}
function CharacterHueList({ onChangeLoad, hueCount }: CharacterHueListProps) {
  const [characterCanvasList, setCharacterCanvasList] = useState<HTMLCanvasElement[]>([]);
  const characterData = useRecoilValue(characterDataAtom);
  const canLoadCharacter = useRecoilValue(canLoadCharacterSelector);

  useEffect(() => {
    if (characterData && canLoadCharacter) {
      onChangeLoad(true);
      getHueCharacterCanvasList(characterData, hueCount).then((list) => {
        setCharacterCanvasList(list);
        onChangeLoad(false);
      });
    }
  }, [characterData, canLoadCharacter, onChangeLoad, hueCount]);

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
      {characterCanvasList.map((canvas, index) => (
        <Grid key={index} item display="flex" justifyContent="center" alignItems="center">
          <img src={canvas.toDataURL()} />
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
