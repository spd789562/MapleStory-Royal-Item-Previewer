'use client';
import { atom, selector, RecoilLoadable, Loadable } from 'recoil';
import type { CharacterData } from '@/utils/maplestory';

const gistUrl = 'https://api.github.com/gists/15b16123b9d980dfd72a1df91313d53f';

const getCharacterPresetList = async () => {
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
    .filter((file) => file !== null) as CharacterData[];
  return jsonFiles;
};

export const characterPresetListAtom = atom<CharacterData[]>({
  key: 'charaterPresetList',
  default: getCharacterPresetList(),
});
