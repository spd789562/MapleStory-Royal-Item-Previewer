import { useEffect, memo } from 'react';

import { useSetRecoilState, useRecoilValue } from 'recoil';
import { characterItemsSelector, characterItemsLoadStatusSelector, LoadStatus } from '@/store/characterItems';
import { appendUploadCharacterHistory } from '@/store/uploadCharacterHistory';
import { characterDataAtom } from '@/store/character';

import Maplestory, { CharacterData } from '@/utils/maplestory';
import { requestIdleCallback, asyncRequestIdleCallback } from '@/utils/requestIdleCallback';
import type { IRenderRequest } from 'maplestory';

function getIsDyeableFromInfo(info: any) {
  return !!((info.royalSpecial && info.royalSpecial.value === 1) || (info.colorvar && info.colorvar.value === 1));
}
const InfoResolver = () => {
  const data = useRecoilValue(characterDataAtom);
  const setCharacterItems = useSetRecoilState(characterItemsSelector);
  const setItemsLoadStatusLoaded = useSetRecoilState(characterItemsLoadStatusSelector);
  const appendUploadCharacterHistoryState = useSetRecoilState(appendUploadCharacterHistory);
  useEffect(() => {
    if (data) {
      setItemsLoadStatusLoaded(LoadStatus.Loading);
      setTimeout(() => {
        Maplestory.CharacterRenderer.GenerateRenderPlan(data as unknown as IRenderRequest)
          .then((plan) => {
            const idNeedFiltered = ['Head', 'Body'].map((key) => {
              const item = data.selectedItems[key];
              return item && item.id;
            });
            const pairs = plan.framePairs
              .map(({ item, info }) => ({
                id: item.id,
                name: item.name || '',
                part: info.part,
                isDyeable: getIsDyeableFromInfo(info),
                icon: `https://maplestory.io/api/${item.region}/${item.version}/item/${item.id}/icon`,
              }))
              .filter(({ id }) => !idNeedFiltered.includes(id));
            /* this also set loadstatus to Loaded */
            setCharacterItems(pairs);

            return plan.Render();
          })
          .then((canvas) => {
            requestIdleCallback(() => {
              appendUploadCharacterHistoryState({
                timestamp: Date.now(),
                previewUrl: canvas.toDataURL(),
                ...data,
              });
            });
          });
      }, 0);
    }
  }, [data]);
  return null;
};

export default memo(InfoResolver);
