import { useEffect, memo } from 'react';

import { useSetRecoilState, useRecoilValue } from 'recoil';
import { characterItemsSelector, characterItemsLoadStatusSelector, LoadStatus } from '@/store/characterItems';
import { appendUploadCharacterHistory } from '@/store/uploadCharacterHistory';
import { characterDataAtom } from '@/store/character';
import { loadStateAtom } from '@/store/loadState';

import Maplestory, { CharacterData } from '@/utils/maplestory';
import { requestIdleCallback, asyncRequestIdleCallback } from '@/utils/requestIdleCallback';
import type { IRenderRequest } from 'maplestory';

function getIsDyeableFromInfo(info: any) {
  return !!((info.royalSpecial && info.royalSpecial.value === 1) || (info.colorvar && info.colorvar.value === 1));
}

function addRandomPresent(num: number) {
  let add = 0.01;
  if (num < 0.4) {
    add = Math.floor(Math.random() * 4 + 3) / 100;
  } else if (num < 0.8) {
    add = Math.floor(Math.random() * 3 + 2) / 100;
  }
  const result = parseFloat((num + add).toPrecision(12));
  return result > 1 ? 1 : parseFloat(result.toPrecision(2));
}

const InfoResolver = () => {
  const data = useRecoilValue(characterDataAtom);
  const setCharacterItems = useSetRecoilState(characterItemsSelector);
  const setItemsLoadStatusLoaded = useSetRecoilState(characterItemsLoadStatusSelector);
  const setLoadState = useSetRecoilState(loadStateAtom);
  const appendUploadCharacterHistoryState = useSetRecoilState(appendUploadCharacterHistory);

  useEffect(() => {
    if (data) {
      setItemsLoadStatusLoaded(LoadStatus.Loading);
      setLoadState({ name: '角色資訊' });
      const addProgress = () => {
        setLoadState((prev) => ({
          name: '角色資訊',
          progress: addRandomPresent(prev.progress || 0),
        }));
      };
      Maplestory.Network.RegisterEventMonitor((moniter) => {
        addProgress();
        moniter.RegisterNotifyOnComplete((_) => {
          addProgress();
          return null;
        });
        return null;
      });

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
            Maplestory.Network.ProgressMonitorCallback = [];
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
