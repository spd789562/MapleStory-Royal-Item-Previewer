declare global {
  module 'maplestory/dist/Item/Utilities' {
    export default interface ItemUtilities {
      IsHairId(id: number): boolean;
      IsCapId(id: number): boolean;
    }
  }
}

declare module 'maplestory/dist/bundle' {
  import { MapleStory } from 'maplestory';
  export default MapleStory;
}

declare module 'node-webpmux';
