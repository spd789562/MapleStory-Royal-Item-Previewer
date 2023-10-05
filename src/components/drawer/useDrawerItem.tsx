'use client';
import { useCallback } from 'react';

import { useSetRecoilState } from 'recoil';
import { characterDrawerOpenSelector } from '@/store/characterDrawer';
import { characterDataAtom } from '@/store/character';

import type { CharacterData } from '@/utils/maplestory';

const PreventMultiClick = {
  time: 0,
};

export default function useDrawerItem() {
  const setCharacterDrawerOpen = useSetRecoilState(characterDrawerOpenSelector);
  const setCharacterData = useSetRecoilState(characterDataAtom);
  const updateCharaterData: (data: CharacterData) => void = useCallback((data: CharacterData) => {
    const now = Date.now();
    if (now - PreventMultiClick.time < 500) {
      return;
    }
    setCharacterData(data);
    setCharacterDrawerOpen(false);
    PreventMultiClick.time = now;
  }, []);

  return {
    updateCharaterData,
  };
}
