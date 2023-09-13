'use client';
import { atom } from 'recoil';

export const libReadyAtom = atom<boolean>({
  key: 'libReady',
  default: false,
});
