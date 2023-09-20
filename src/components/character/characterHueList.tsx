'use client';
import { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { characterDataAtom } from '@/store/character';

import Grid from '@mui/material/Grid';

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

  useEffect(() => {
    if (characterData) {
      onChangeLoad(true);
      getHueCharacterCanvasList(characterData, hueCount).then((list) => {
        setCharacterCanvasList(list);
        onChangeLoad(false);
      });
    }
  }, [characterData, onChangeLoad, hueCount]);

  return (
    <Grid container spacing={1} className="mt-2">
      {characterCanvasList.map((canvas, index) => (
        <Grid key={index} item xs={6} sm={4} md={3} lg={2} display="flex" justifyContent="center" alignItems="center">
          <img src={canvas.toDataURL()} />
        </Grid>
      ))}
    </Grid>
  );
}

export default CharacterHueList;
