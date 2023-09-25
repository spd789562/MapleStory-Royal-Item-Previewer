import { useEffect, memo } from 'react';

import { useSetRecoilState } from 'recoil';
import { characterItemsSelector, characterItemsLoadStatusSelector, LoadStatus } from '@/store/characterItems';
import { characterDataAtom } from '@/store/character';

import Maplestory, { CharacterData } from '@/utils/maplestory';
import type { IRenderRequest } from 'maplestory';

interface InfoResolverProps {
  data: CharacterData | null;
}
const InfoResolver = ({ data }: InfoResolverProps) => {
  const setCharacterItems = useSetRecoilState(characterItemsSelector);
  const setItemsLoadStatusLoaded = useSetRecoilState(characterItemsLoadStatusSelector);
  const setCharacterData = useSetRecoilState(characterDataAtom);
  useEffect(() => {
    if (data) {
      setItemsLoadStatusLoaded(LoadStatus.Loading);
      setTimeout(() => {
        Maplestory.CharacterRenderer.GenerateRenderPlan(data as unknown as IRenderRequest).then((plan) => {
          const idNeedFiltered = ['Head', 'Body'].map((key) => {
            const item = data.selectedItems[key];
            return item && item.id;
          });
          const pairs = plan.framePairs
            .map(({ item, info }) => ({
              id: item.id,
              name: item.name || '',
              part: info.part,
              isDyeable: !!(info.royalSpecial && info.royalSpecial.value === 1),
              icon: `https://maplestory.io/api/${item.region}/${item.version}/item/${item.id}/icon`,
            }))
            .filter(({ id }) => !idNeedFiltered.includes(id));
          setCharacterItems(pairs);
          setCharacterData(data);
        });
      }, 0);
    }
  }, [data]);
  return null;
};

export default memo(InfoResolver);
