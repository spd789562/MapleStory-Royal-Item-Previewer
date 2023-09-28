'use client';
import { useRecoilValue } from 'recoil';

import { characterDataAtom } from '@/store/character';

import dynamic from 'next/dynamic';

const CharacterImage = dynamic(() => import('@/components/characterImage'), { ssr: false });

function CurrentCharacter() {
  const characterData = useRecoilValue(characterDataAtom);
  return (
    <div className="w-full h-full flex justify-center items-center">
      <CharacterImage data={characterData} />
    </div>
  );
}

export default CurrentCharacter;
