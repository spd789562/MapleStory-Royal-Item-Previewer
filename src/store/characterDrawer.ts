'use client';
import { atom, selector, DefaultValue } from 'recoil';
import { produce } from 'immer';

export enum DrawerTab {
  Preset,
  Upload,
}

export interface CharacterDrawer {
  isOpen: boolean;
  tab: DrawerTab;
}

export const characterDrawerAtom = atom<CharacterDrawer>({
  key: 'characterDrawer',
  default: {
    isOpen: false,
    tab: DrawerTab.Preset,
  },
});

export const characterDrawerOpenSelector = selector<boolean>({
  key: 'characterDrawerOpen',
  get: ({ get }) => get(characterDrawerAtom).isOpen,
  set: ({ set }, newValue) => {
    set(
      characterDrawerAtom,
      newValue instanceof DefaultValue
        ? newValue
        : (prev) =>
            produce(prev, (draft) => {
              draft.isOpen = newValue;
            }),
    );
  },
});

export const characterDrawerTabSelector = selector<DrawerTab>({
  key: 'characterDrawerTab',
  get: ({ get }) => get(characterDrawerAtom).tab,
  set: ({ set }, newValue) => {
    set(
      characterDrawerAtom,
      newValue instanceof DefaultValue
        ? newValue
        : (prev) =>
            produce(prev, (draft) => {
              draft.tab = newValue;
            }),
    );
  },
});
