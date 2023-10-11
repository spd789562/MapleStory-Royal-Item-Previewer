'use client';
import { atom, selector, DefaultValue } from 'recoil';
import { CharacterAction } from '@/mapping/characterAction';

import { produce } from 'immer';

export const characterHueCanvases = atom<HTMLCanvasElement[]>({
  key: 'characterHueCanvas',
  default: [],
});

export const characterHueUrls = selector<string[]>({
  key: 'characterHueUrls',
  get: ({ get }) => {
    const canvases = get(characterHueCanvases);
    console.log('[Atom Selector] execute characterHueUrls');
    return canvases.map((canvas) => canvas.toDataURL());
  },
  cachePolicy_UNSTABLE: {
    eviction: 'lru',
    maxSize: 10,
  },
});

export interface CharacterHueData {
  count: number;
  isLoading: boolean;
  action: CharacterAction;
}
export const characterHueDataAtom = atom<CharacterHueData>({
  key: 'characterHueData',
  default: {
    count: 16,
    isLoading: false,
    action: CharacterAction.Stand1,
  },
});

export const characterHueCountSelector = selector<number>({
  key: 'characterHueCount',
  get: ({ get }) => get(characterHueDataAtom).count,
  set: ({ set }, newCount) => {
    if (newCount instanceof DefaultValue) {
      return newCount;
    }
    set(characterHueDataAtom, (prev) =>
      produce(prev, (draft) => {
        draft.count = newCount;
      }),
    );
  },
});

export const characterHueLoadingSelector = selector<boolean>({
  key: 'characterHueLoading',
  get: ({ get }) => get(characterHueDataAtom).isLoading,
  set: ({ set }, isLoading) => {
    if (isLoading instanceof DefaultValue) {
      return isLoading;
    }
    set(characterHueDataAtom, (prev) =>
      produce(prev, (draft) => {
        draft.isLoading = isLoading;
      }),
    );
  },
});

export const characterHueActionSelector = selector<CharacterAction>({
  key: 'characterHueAction',
  get: ({ get }) => get(characterHueDataAtom).action,
  set: ({ set }, action) => {
    if (action instanceof DefaultValue) {
      return action;
    }
    set(characterHueDataAtom, (prev) =>
      produce(prev, (draft) => {
        draft.action = action;
      }),
    );
  },
});
