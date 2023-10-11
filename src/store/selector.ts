import { selector } from 'recoil';

import { libReadyAtom } from './libReady';
import {
  isCharacterItemsLoadedSelector,
  isCharacterItemsLoadingSelector,
  hasAnyDyeableSelector,
} from './characterItems';
import { characterDataAtom } from './character';
import { characterHueActionSelector, characterHueLoadingSelector } from './characterHue';

import { produce } from 'immer';

import type { CharacterData } from '@/utils/maplestory';

export const canLoadCharacterSelector = selector<boolean>({
  key: 'canLoadCharacter',
  get: ({ get }) => get(libReadyAtom) && get(isCharacterItemsLoadedSelector),
});

export const canUploadCharacterSelector = selector<boolean>({
  key: 'canUploadCharacter',
  get: ({ get }) => {
    const isCharacterItemsLoading = get(isCharacterItemsLoadingSelector);
    const libReady = get(libReadyAtom);
    return libReady && !isCharacterItemsLoading;
  },
});

export const hueChatacterSelector = selector<CharacterData | undefined>({
  key: 'hueChatacter',
  get: ({ get }) => {
    const character = get(characterDataAtom);
    if (!character) {
      return character;
    }
    const action = get(characterHueActionSelector);
    return produce(character, (draft) => {
      draft.action = action;
    });
  },
});

export const isDownloadHueDisabledSelector = selector<boolean>({
  key: 'isDownloadHueDisabled',
  get: ({ get }) => {
    const hasAnyDyeable = get(hasAnyDyeableSelector);
    const isCharacterLoaded = get(canLoadCharacterSelector);
    const isLoading = get(characterHueLoadingSelector);

    return !hasAnyDyeable || !isCharacterLoaded || isLoading;
  },
});
