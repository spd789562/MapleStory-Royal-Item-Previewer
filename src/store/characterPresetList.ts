'use client';
import { atom, selector } from 'recoil';
import type { CharacterData } from '@/utils/maplestory';

const gistUrl = 'https://api.github.com/gists/15b16123b9d980dfd72a1df91313d53f';

export interface PresetCharacterData extends CharacterData {
  description: string;
}

export interface PresetData {
  url: string;
  updateAt: string;
  characters: PresetCharacterData[];
}

const getCharacterPresetList = async () => {
  try {
    const gistData = await fetch(gistUrl).then((response) => response.json());
    const files = Object.values(gistData.files) as any[];
    const jsonFiles = files
      .map((file) => {
        try {
          const parsed = JSON.parse(file.content);
          if (!parsed.name) {
            parsed.name = file.filename;
          }
          return parsed;
        } catch (e) {
          return null;
        }
      })
      .filter((file) => file !== null) as PresetCharacterData[];
    jsonFiles.sort((a, b) => (b.id || 0) - (a.id || 0));
    return {
      url: gistData.html_url,
      updateAt: gistData.updated_at,
      characters: jsonFiles,
    };
  } catch {
    return { url: gistUrl, updateAt: '檔案損毀，暫無法使用', characters: [] };
  }
};

export const characterPresetListAtom = atom<PresetData>({
  key: 'charaterPresetList',
  default: getCharacterPresetList(),
});

export const characterPresetIdListSelector = selector<number[]>({
  key: 'characterPresetIdList',
  get: ({ get }) => {
    const presetList = get(characterPresetListAtom);
    return presetList.characters.map((character) => character.id || 0);
  },
});
