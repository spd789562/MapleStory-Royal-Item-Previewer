import { selector } from 'recoil';

import { libReadyAtom } from './libReady';
import { isCharacterItemsLoadedSelector, isCharacterItemsLoadingSelector } from './characterItems';

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
