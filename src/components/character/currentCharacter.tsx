'use client';
import { useRef, forwardRef } from 'react';

import { useRecoilValue } from 'recoil';

import { characterDataAtom } from '@/store/character';

import type { CharacterImageRef, CharacterImageProps } from '@/components/characterImage';

import downalod from 'downloadjs';
import dynamic from 'next/dynamic';

const CharacterImage = dynamic(() => import('@/components/characterImage'), { ssr: false });

function CurrentCharacter() {
  const characterData = useRecoilValue(characterDataAtom);
  const imageRef = useRef<CharacterImageRef>(null);

  const handleClick = () => {
    if (imageRef.current) {
      imageRef.current.getGif().then((u8Arr) => {
        u8Arr && downalod(u8Arr, 'test.gif', 'image/gif');
      });
    }
  };

  return (
    <div className="w-full h-full" onClick={handleClick}>
      <CharacterImage forwardedRef={imageRef} data={characterData} />
    </div>
  );
}

export default CurrentCharacter;
