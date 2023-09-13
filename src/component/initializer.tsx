'use client';
import { useEffect } from 'react';

import { useSetRecoilState } from 'recoil';
import { libReadyAtom } from '@/store/libReady';

import WebP from 'node-webpmux';

export default function Initializer() {
  const setLibReady = useSetRecoilState(libReadyAtom);

  useEffect(() => {
    WebP.Image.initLib().then(() => {
      setLibReady(true);
    });
  }, [setLibReady]);

  return null;
}
