'use client';
import { useRecoilValue } from 'recoil';

import { characterDataAtom } from '@/store/character';

import CharacterImage from '@/components/characterImage';

function CurrentCharacter() {
  const characterData = useRecoilValue(characterDataAtom);

  return <CharacterImage data={characterData} />;
}

export default CurrentCharacter;