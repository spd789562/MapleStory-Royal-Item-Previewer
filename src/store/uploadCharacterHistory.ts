'use client';
import { atom, selector, AtomEffect, DefaultValue } from 'recoil';
import { characterPresetIdListSelector } from './characterPresetList';
import type { CharacterData } from '@/utils/maplestory';

const localStorageKey = 'maplestory:characterHistory';

export interface HistoryCharacterData extends CharacterData {
  timestamp: number;
  previewUrl: string;
}
type UploadCharacterHistory = HistoryCharacterData[];

const localStorageEffect: AtomEffect<UploadCharacterHistory> = ({ setSelf, onSet }) => {
  const savedValue = localStorage.getItem(localStorageKey);
  if (savedValue) {
    try {
      const data = JSON.parse(savedValue) as HistoryCharacterData[];
      setSelf(data);
    } catch (e) {
      /* data broken */
    }
  }

  onSet((newValue) => {
    localStorage.setItem(localStorageKey, JSON.stringify(newValue));
  });
};

export const uploadCharacterHistoryAtom = atom<UploadCharacterHistory>({
  key: 'uploadCharacterHistory',
  default: [],
  effects: [localStorageEffect],
});

export const appendUploadCharacterHistory = selector<HistoryCharacterData>({
  key: 'appendUploadCharacterHistory',
  get: ({ get }) => ({}) as HistoryCharacterData,
  set: ({ set, get }, newValue) => {
    if (newValue instanceof DefaultValue) {
      set(uploadCharacterHistoryAtom, newValue);
      return;
    }
    const presetIds = get(characterPresetIdListSelector);
    set(uploadCharacterHistoryAtom, (prevValue) => {
      if (newValue.id && presetIds.includes(newValue.id)) {
        return prevValue;
      }
      if (newValue.timestamp && prevValue.some((character) => character.timestamp === newValue.timestamp)) {
        return prevValue;
      }
      return [...prevValue, newValue];
    });
  },
});

export const removeUploadCharacterHistory = selector<number>({
  key: 'removeUploadCharacterHistory',
  get: ({ get }) => 0,
  set: ({ set, get }, newValue) => {
    set(
      uploadCharacterHistoryAtom,
      newValue instanceof DefaultValue
        ? newValue
        : (prevValue) => prevValue.filter((character) => character.timestamp !== newValue),
    );
  },
});

export const clearUploadCharacterHistory = selector<null>({
  key: 'clearUploadCharacterHistory',
  get: ({ get }) => null,
  set: ({ set }) => {
    set(uploadCharacterHistoryAtom, []);
  },
});
