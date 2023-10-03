'use client';
import { atom, selector, AtomEffect, DefaultValue } from 'recoil';
import type { CharacterData } from '@/utils/maplestory';

const localStorageKey = 'maplestory:characterHistory';

interface HistoryCharacterData extends CharacterData {
  timestamp: number;
}
type UploadCharacterHistory = HistoryCharacterData[];

const localStorageEffect: AtomEffect<UploadCharacterHistory> = ({ setSelf, onSet }) => {
  const savedValue = localStorage.getItem(localStorageKey);
  if (savedValue != null) {
    setSelf(JSON.parse(savedValue) as HistoryCharacterData[]);
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
    set(
      uploadCharacterHistoryAtom,
      newValue instanceof DefaultValue ? newValue : [...get(uploadCharacterHistoryAtom), newValue],
    );
  },
});

export const removeUploadCharacterHistory = selector<HistoryCharacterData>({
  key: 'removeUploadCharacterHistory',
  get: ({ get }) => ({}) as HistoryCharacterData,
  set: ({ set, get }, newValue) => {
    set(
      uploadCharacterHistoryAtom,
      newValue instanceof DefaultValue
        ? newValue
        : get(uploadCharacterHistoryAtom).filter((character) => character.timestamp !== newValue.timestamp),
    );
  },
});

export const clearUploadCharacterHistory = selector<HistoryCharacterData>({
  key: 'clearUploadCharacterHistory',
  get: ({ get }) => ({}) as HistoryCharacterData,
  set: ({ set }) => {
    set(uploadCharacterHistoryAtom, []);
  },
});
