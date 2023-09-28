'use client';
import { memo } from 'react';
import { useRecoilValue } from 'recoil';

import { characterDataOtherActionSelectors } from '@/store/character';

import { CharacterAction } from '@/mapping/characterAction';
import type { CharacterImageRef } from '@/components/characterImage';
import dynamic from 'next/dynamic';

const CharacterImage = dynamic(() => import('@/components/characterImage'), { ssr: false });

interface CharacterProps {
  action: CharacterAction;
  forwardedRef?: React.Ref<CharacterImageRef>;
}
function ActionCharacter(props: CharacterProps) {
  const characterData = useRecoilValue(
    characterDataOtherActionSelectors[props.action as keyof typeof characterDataOtherActionSelectors],
  );

  return (
    <CharacterImage
      forwardedRef={props.forwardedRef}
      data={characterData}
      name={`${(characterData && characterData.name) || 'name'}-${props.action}`}
    />
  );
}

export default memo(ActionCharacter);
