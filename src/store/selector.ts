import { selector } from 'recoil';

import { libReadyAtom } from './libReady';
import { isCharacterItemsLoadedSelector } from './characterItems';

export const canLoadCharacterSelector = selector<boolean>({
  key: 'canLoadCharacter',
  get: ({ get }) => get(libReadyAtom) && get(isCharacterItemsLoadedSelector),
});
