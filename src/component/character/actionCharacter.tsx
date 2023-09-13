'use client';
import { useRecoilValue } from 'recoil';

import { characterDataOtherActionSelectors } from '@/store/character';

import { CharacterAction } from '@/mapping/characterAction';
import dynamic from 'next/dynamic';

const CharacterImage = dynamic(() => import('@/component/characterImage'), { ssr: false });

interface CharacterProps {
  action: CharacterAction;
}
function ActionCharacter(props: CharacterProps) {
  const characterData = useRecoilValue(
    characterDataOtherActionSelectors[props.action as keyof typeof characterDataOtherActionSelectors],
  );

  return <CharacterImage data={characterData} />;
}

export default ActionCharacter;
