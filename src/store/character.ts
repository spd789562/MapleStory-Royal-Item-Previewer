'use client';
import { atom, selector } from 'recoil';
import type { CharacterData } from '@/utils/maplestory';
import { CharacterAction } from '@/mapping/characterAction';

import { produce } from 'immer';

import { canLoadCharacterSelector } from './selector';

export const characterDataAtom = atom<CharacterData | undefined>({
  key: 'characterData',
  default: undefined,
  effects: [
    ({ onSet }) => {
      onSet((newCharacterData) => {
        if (!newCharacterData) {
          return newCharacterData;
        }
        return produce(newCharacterData, (draft) => {
          draft.action = CharacterAction.Stand1;
          draft.emotion = 'default';
        });
      });
    },
  ],
});

const createCharacterDataOtherActionSelector = (action: CharacterAction) =>
  selector({
    key: `characterData${action}`,
    get: ({ get }) => {
      const canLoadCharacter = get(canLoadCharacterSelector);
      const characterData = get(characterDataAtom);
      if (!characterData || !canLoadCharacter) {
        return undefined;
      }
      return {
        ...characterData,
        action,
      };
    },
    cachePolicy_UNSTABLE: {
      eviction: 'most-recent',
    },
  });

export const characterDataStand1Selector = createCharacterDataOtherActionSelector(CharacterAction.Stand1);
export const characterDataStand2Selector = createCharacterDataOtherActionSelector(CharacterAction.Stand2);

export const characterDataWalk1Selector = createCharacterDataOtherActionSelector(CharacterAction.Walk1);
export const characterDataWalk2Selector = createCharacterDataOtherActionSelector(CharacterAction.Walk2);

export const characterDataAlertSelector = createCharacterDataOtherActionSelector(CharacterAction.Alert);
export const characterDataJumpSelector = createCharacterDataOtherActionSelector(CharacterAction.Jump);
export const characterDataLadderSelector = createCharacterDataOtherActionSelector(CharacterAction.Ladder);
export const characterDataFlySelector = createCharacterDataOtherActionSelector(CharacterAction.Fly);

export const characterDataProneStabSelector = createCharacterDataOtherActionSelector(CharacterAction.ProneStab);

export const characterDataShoot1Selector = createCharacterDataOtherActionSelector(CharacterAction.Shoot1);
export const characterDataShoot2Selector = createCharacterDataOtherActionSelector(CharacterAction.Shoot2);
export const characterDataShootFSelector = createCharacterDataOtherActionSelector(CharacterAction.ShootF);

export const characterDataStab1Selector = createCharacterDataOtherActionSelector(CharacterAction.StabO1);
export const characterDataStab2Selector = createCharacterDataOtherActionSelector(CharacterAction.StabO2);
export const characterDataStabFSelector = createCharacterDataOtherActionSelector(CharacterAction.StabOF);

export const characterDataStabT1Selector = createCharacterDataOtherActionSelector(CharacterAction.StabT1);
export const characterDataStabT2Selector = createCharacterDataOtherActionSelector(CharacterAction.StabT2);
export const characterDataStabTFSelector = createCharacterDataOtherActionSelector(CharacterAction.StabTF);

export const characterDataSwing1Selector = createCharacterDataOtherActionSelector(CharacterAction.SwingO1);
export const characterDataSwing2Selector = createCharacterDataOtherActionSelector(CharacterAction.SwingO2);
export const characterDataSwing3Selector = createCharacterDataOtherActionSelector(CharacterAction.SwingO3);
export const characterDataSwingOFSelector = createCharacterDataOtherActionSelector(CharacterAction.SwingOF);

export const characterDataSwingP1Selector = createCharacterDataOtherActionSelector(CharacterAction.SwingP1);
export const characterDataSwingP2Selector = createCharacterDataOtherActionSelector(CharacterAction.SwingP2);
export const characterDataSwingPFSelector = createCharacterDataOtherActionSelector(CharacterAction.SwingPF);

export const characterDataSwingT1Selector = createCharacterDataOtherActionSelector(CharacterAction.SwingT1);
export const characterDataSwingT2Selector = createCharacterDataOtherActionSelector(CharacterAction.SwingT2);
export const characterDataSwingT3Selector = createCharacterDataOtherActionSelector(CharacterAction.SwingT3);
export const characterDataSwingTFSelector = createCharacterDataOtherActionSelector(CharacterAction.SwingTF);

export const characterDataOtherActionSelectors = {
  [CharacterAction.Stand1]: characterDataStand1Selector,
  [CharacterAction.Stand2]: characterDataStand2Selector,

  [CharacterAction.Walk1]: characterDataWalk1Selector,
  [CharacterAction.Walk2]: characterDataWalk2Selector,

  [CharacterAction.Alert]: characterDataAlertSelector,
  [CharacterAction.Jump]: characterDataJumpSelector,
  [CharacterAction.Ladder]: characterDataLadderSelector,
  [CharacterAction.Fly]: characterDataFlySelector,

  [CharacterAction.ProneStab]: characterDataProneStabSelector,
  [CharacterAction.Shoot1]: characterDataShoot1Selector,
  [CharacterAction.Shoot2]: characterDataShoot2Selector,
  [CharacterAction.ShootF]: characterDataShootFSelector,

  [CharacterAction.StabO1]: characterDataStab1Selector,
  [CharacterAction.StabO2]: characterDataStab2Selector,
  [CharacterAction.StabOF]: characterDataStabFSelector,

  [CharacterAction.StabT1]: characterDataStabT1Selector,
  [CharacterAction.StabT2]: characterDataStabT2Selector,
  [CharacterAction.StabTF]: characterDataStabTFSelector,

  [CharacterAction.SwingO1]: characterDataSwing1Selector,
  [CharacterAction.SwingO2]: characterDataSwing2Selector,
  [CharacterAction.SwingO3]: characterDataSwing3Selector,
  [CharacterAction.SwingOF]: characterDataSwingOFSelector,

  [CharacterAction.SwingP1]: characterDataSwingP1Selector,
  [CharacterAction.SwingP2]: characterDataSwingP2Selector,
  [CharacterAction.SwingPF]: characterDataSwingPFSelector,

  [CharacterAction.SwingT1]: characterDataSwingT1Selector,
  [CharacterAction.SwingT2]: characterDataSwingT2Selector,
  [CharacterAction.SwingT3]: characterDataSwingT3Selector,
  [CharacterAction.SwingTF]: characterDataSwingTFSelector,
};
