'use client';
import { atom, selector, DefaultValue } from 'recoil';
import { CharacterAction } from '@/mapping/characterAction';

import { produce } from 'immer';

export const characterDataAtom = atom<any>({
  key: 'json_characterData',
  default: undefined,
});

export const updateCharacterDataSelector = selector<any>({
  key: 'json_updateCharacterData',
  get: ({ get }) => undefined,
  set: ({ set }, newCharacterData) => {
    if (!newCharacterData || newCharacterData instanceof DefaultValue) {
      return;
    }
    set(
      characterDataAtom,
      produce(newCharacterData, (draft: any) => {
        draft.action = CharacterAction.Stand1;
        draft.emotion = 'default';
        draft.zoom = 1;
        draft.frame = 0;
        draft.id = new Date().getTime();
        Object.keys(draft.selectedItems).forEach((key) => {
          if (draft.selectedItems[key]) {
            Object.keys(draft.selectedItems[key]).forEach((itemKey) => {
              if (['id', 'region', 'version', 'name'].includes(itemKey)) {
                return;
              }
              delete draft.selectedItems[key][itemKey];
            });
          }
        });
        delete draft.position;
        delete draft.fhSnap;
      }),
    );
  },
});

export const characterDataIdSelector = selector<string | undefined>({
  key: 'json_characterDataId',
  get: ({ get }) => {
    const characterData = get(characterDataAtom);
    if (!characterData) {
      return undefined;
    }
    return characterData.id;
  },
  set: ({ set }, newCharacterDataId) => {
    if (!newCharacterDataId || newCharacterDataId instanceof DefaultValue) {
      return;
    }
    set(
      characterDataAtom,
      produce((draft: any) => {
        draft.id = +newCharacterDataId;
      }),
    );
  },
});

export const characterDataNameSelector = selector<string | undefined>({
  key: 'json_characterDataName',
  get: ({ get }) => {
    const characterData = get(characterDataAtom);
    if (!characterData) {
      return undefined;
    }
    return characterData.name;
  },
  set: ({ set }, newCharacterDataName) => {
    if (!newCharacterDataName || newCharacterDataName instanceof DefaultValue) {
      return;
    }
    set(
      characterDataAtom,
      produce((draft: any) => {
        draft.name = newCharacterDataName;
      }),
    );
  },
});

export const characterDataDescSelector = selector<string | undefined>({
  key: 'json_characterDataDesc',
  get: ({ get }) => {
    const characterData = get(characterDataAtom);
    if (!characterData) {
      return undefined;
    }
    return characterData.description;
  },
  set: ({ set }, newCharacterDataDesc) => {
    if (!newCharacterDataDesc || newCharacterDataDesc instanceof DefaultValue) {
      return;
    }
    set(
      characterDataAtom,
      produce((draft: any) => {
        draft.description = newCharacterDataDesc;
      }),
    );
  },
});
