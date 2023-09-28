'use client';
import { memo } from 'react';
import { useRecoilValue } from 'recoil';

import { characterDataOtherActionSelectors } from '@/store/character';

import Skeleton from '@mui/material/Skeleton';
import { CharacterAction } from '@/mapping/characterAction';
import type { CharacterImageRef } from '@/components/characterImage';
import dynamic from 'next/dynamic';

const CharacterImage = dynamic(() => import('@/components/characterImage'), {
  ssr: false,
  loading: () => <Skeleton variant="rectangular" sx={{ height: 100, minWidth: '100%' }} animation={false} />,
});

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
