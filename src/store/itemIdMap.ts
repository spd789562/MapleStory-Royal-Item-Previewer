'use client';
import { atom } from 'recoil';

export const itemIdMapAtom = atom<Record<string, string>>({
  key: 'itemIdMap',
  default: {},
});
