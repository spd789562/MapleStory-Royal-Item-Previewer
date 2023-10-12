import type { IItemEntry } from './Character/IItemEntry';
import type { IRenderRequest } from 'maplestory';

export function isValidItem(item: IItemEntry) {
  return item && item.id && item.region && item.version;
}

export function isValidCharacter(character: IRenderRequest) {
  return character && character.selectedItems && Object.values(character.selectedItems).every(isValidItem);
}
