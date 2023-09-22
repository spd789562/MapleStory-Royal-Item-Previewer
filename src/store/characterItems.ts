'use client';
import { atom, selector, DefaultValue } from 'recoil';
import { itemIdMapAtom } from './itemIdMap';
import { produce } from 'immer';

export interface CharacterItem {
  id: number;
  isDyeable: boolean;
  name: string;
  icon?: string;
}

export interface CharacterItems {
  isLoaded: boolean;
  items: CharacterItem[];
}

export const characterItemsAtom = atom<CharacterItems>({
  key: 'characterItem',
  default: {
    isLoaded: false,
    items: [],
  },
});

export const isCharacterItemsLoadedSelector = selector<boolean>({
  key: 'isCharacterItemsLoaded',
  get: ({ get }) => get(characterItemsAtom).isLoaded,
  set: ({ set, get }, newValue) => {
    set(
      characterItemsAtom,
      newValue instanceof DefaultValue
        ? newValue
        : produce(get(characterItemsAtom), (draft) => {
            draft.isLoaded = newValue;
          }),
    );
  },
});

export const hasCharacterItemsSelector = selector<boolean>({
  key: 'hasCharacterItems',
  get: ({ get }) => get(characterItemsAtom).items.length > 0,
});

export const characterItemsSelector = selector<CharacterItem[]>({
  key: 'characterItems',
  get: ({ get }) => get(characterItemsAtom).items,
  set: ({ set, get }, newValue) => {
    const itemIdMap = get(itemIdMapAtom);
    set(
      characterItemsAtom,
      newValue instanceof DefaultValue
        ? newValue
        : (prev) =>
            produce(prev, (draft) => {
              draft.items = newValue.map((item) => {
                return {
                  id: item.id,
                  isDyeable: item.isDyeable,
                  name: itemIdMap[item.id] || item.name,
                  icon: item.icon,
                };
              });
              draft.isLoaded = true;
            }),
    );
  },
});
