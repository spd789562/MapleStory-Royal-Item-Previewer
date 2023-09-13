'use client';
import { useEffect, useState, useRef } from 'react';

import Skeleton from '@mui/material/Skeleton';

import { getWebPFromCharacterData, CharacterData } from '@/utils/maplestory';

interface CharacterImageProps {
  data?: CharacterData;
  name?: string;
}
function CharacterImage({ data: characterData, name }: CharacterImageProps) {
  const abortIdRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [webp, setWebp] = useState<string | null>(null);

  useEffect(() => {
    if (characterData) {
      setIsLoaded(false);
      const abortId = new Date().getTime();
      abortIdRef.current = abortId;
      getWebPFromCharacterData(characterData).then((base64) => {
        if (abortIdRef.current !== abortId) return;
        setWebp(base64);
        setIsLoaded(true);
      });
    }
  }, [characterData]);

  return (
    <div className="w-full h-full">
      {isLoaded && webp ? (
        <img className="w-full h-full" src={webp} alt={name || 'character image'} />
      ) : (
        <Skeleton variant="rectangular" width="100%" height={100} />
      )}
    </div>
  );
}

export default CharacterImage;
