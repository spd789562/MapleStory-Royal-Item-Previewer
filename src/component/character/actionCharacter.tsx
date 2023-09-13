'use client';
import { useRecoilValue } from 'recoil';

import { characterDataOtherActionSelectors } from '@/store/character';

import CharacterImage from '@/component/characterImage';

import { CharacterAction } from '@/mapping/characterAction';

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
