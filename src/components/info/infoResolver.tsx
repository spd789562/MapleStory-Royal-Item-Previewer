import { useEffect, memo } from 'react';

import { useSetRecoilState, useRecoilValue } from 'recoil';
import { characterItemsSelector, characterItemsLoadStatusSelector, LoadStatus } from '@/store/characterItems';
import { appendUploadCharacterHistory } from '@/store/uploadCharacterHistory';
import { characterDataAtom } from '@/store/character';
import { loadStateAtom } from '@/store/loadState';

import Maplestory, { CharacterData } from '@/utils/maplestory';
import { requestIdleCallback, asyncRequestIdleCallback } from '@/utils/requestIdleCallback';
import type { IRenderRequest, IProperty } from 'maplestory';

function getIsDyeableFromInfo(info: Record<string, IProperty>) {
  const hasRoyalSpecial = info.royalSpecial && info.royalSpecial.value === 1;
  const hasColorVar = info.colorvar && info.colorvar.value === 1
  return !!hasColorVar;
}
async function getIconInInfo(info: Record<string, IProperty>, node: IProperty) {
  let iconData: ImageData | null = null;
  try {
    if (!info || !info.icon) {
      const firstChild = node.children[0];
      const resolved = await firstChild.resolve();
      if (resolved.type === 'canvas') {
        iconData = await resolved.GetValue();
      }
    } else {
      iconData = await info.icon.GetValue();
    }
  } catch (e) {}
  if (!iconData) {
    console.info('[InfoResolver] no icon data');
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = iconData.width;
  canvas.height = iconData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(iconData, 0, 0);

  return canvas.toDataURL();
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

      setTimeout(async () => {
        const plan = await Maplestory.CharacterRenderer.GenerateRenderPlan(data as unknown as IRenderRequest);
        const idNeedFiltered = ['Head', 'Body'].map((key) => {
          const item = data.selectedItems[key];
          return item && item.id;
        });
        const filteredPairs = plan.framePairs.filter(({ item }) => !idNeedFiltered.includes(item.id));
        const icons = await Promise.all(filteredPairs.map(({ node, info }) => getIconInInfo(info, node)));
        const pairs = filteredPairs.map(({ item, info }, index) => ({
          id: item.id,
          name: item.name || '',
          part: info.part,
          isDyeable: getIsDyeableFromInfo(info),
          icon: icons[index] || `https://maplestory.io/api/${item.region}/${item.version}/item/${item.id}/icon`,
        }));
        /* this also set loadstatus to Loaded */
        setCharacterItems(pairs);
        Maplestory.Network.ProgressMonitorCallback = [];

        const previewCanvas = await plan.Render();
        requestIdleCallback(() => {
          appendUploadCharacterHistoryState({
            timestamp: Date.now(),
            previewUrl: previewCanvas.toDataURL(),
            ...data,
          });
        });
      }, 0);
    }
  }, [data]);
  return null;
};

export default memo(InfoResolver);
