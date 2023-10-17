'use client';
import { atom, selector, DefaultValue } from 'recoil';

import { produce } from 'immer';

export interface LoadState {
  name: string;
  progress?: number;
}

export const loadStateAtom = atom<LoadState>({
  key: 'loadState',
  default: {
    name: '網頁資料',
  },
  effects: [
    ({ onSet }) => {
      onSet((newValue, oldValue) => {
        /* handle reset */
        if (oldValue instanceof DefaultValue || newValue instanceof DefaultValue) {
          return newValue;
        }
        /* if multiple load happened and old one not done, skip update */
        if (oldValue.progress && oldValue.progress !== 1 && newValue.name !== oldValue.name) {
          return oldValue;
        }
        return newValue;
      });
    },
  ],
});

export const loadProgressSelector = selector<number | undefined>({
  key: 'loadProgress',
  get: ({ get }) => get(loadStateAtom).progress,
  set: ({ set }, newValue) => {
    if (newValue instanceof DefaultValue) {
      return;
    }
    set(loadStateAtom, (prev) =>
      produce(prev, (draft) => {
        draft.progress = newValue;
      }),
    );
  },
});
