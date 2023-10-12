'use client';
import { useEffect } from 'react';

import { useSetRecoilState } from 'recoil';
import { libReadyAtom } from '@/store/libReady';
import { itemIdMapAtom } from '@/store/itemIdMap';

import Maplestory from '@/utils/maplestory';

import { useWorkerContext } from '@/workers/workerContext';

import { MessageType } from '@/workers/const';

interface VersionItem {
  IsReady: boolean;
  MapleVersionId: string;
  MapleVersionSplit: string[];
  Region: string;
  HasImages: boolean;
}

const DefaultVersion = '253';

export default function Initializer() {
  const setLibReady = useSetRecoilState(libReadyAtom);
  const setItemIdMap = useSetRecoilState(itemIdMapAtom);
  const workers = useWorkerContext();

  useEffect(() => {
    const initWorkerPromise = new Promise<void>((resolve) => {
      const worker = new Worker(new URL('@/workers/node-webpmux.ts', import.meta.url));
      workers['node-webpmux'] = {
        worker,
        isReady: false,
      };
      const onWorkerReady = (e: MessageEvent) => {
        if (e.data.type === MessageType.Init) {
          workers['node-webpmux'].isReady = true;
          resolve();
          worker.removeEventListener('message', onWorkerReady);
        }
      };
      worker.addEventListener('message', onWorkerReady);
      worker.postMessage({ type: MessageType.Init });
    });

    const versionCheckPromise = new Promise<string>((resolve) => {
      const version = localStorage.getItem('maplestory:region') || '';
      if (version !== 'TWMS') {
        localStorage.setItem('maplestory:region', 'TWMS');
      }
      const _lastCheck = localStorage.getItem('maplestory:lastCheck') || '';
      const lastCheck = Number(_lastCheck);
      const currentVersion = localStorage.getItem('maplestory:version') || '';

      const ONE_DAY = 1000 * 60 * 60 * 24;
      /* skip when last check within 1 day */
      if (currentVersion && lastCheck > 0 && Date.now() - lastCheck < ONE_DAY) {
        return resolve(currentVersion);
      }

      const versionJsonPath = `${Maplestory.DataFactory.endPoint}/versions.json`;
      fetch(versionJsonPath)
        .then((res) => res.json())
        .then((versionList: VersionItem[]) => {
          const twmsVersions = versionList
            .filter((version) => version.Region === 'TWMS' && version.IsReady)
            .map((version) => version.MapleVersionId)
            .sort();
          const latestVersion = twmsVersions[twmsVersions.length - 1];
          if (latestVersion !== currentVersion) {
            localStorage.setItem('maplestory:version', latestVersion);
          }
          localStorage.setItem('maplestory:lastCheck', Date.now().toString());
          resolve(latestVersion);
        })
        .catch(() => {
          resolve(currentVersion || DefaultVersion);
          localStorage.setItem('maplestory:version', currentVersion || DefaultVersion);
        });
    });

    const stringPromise = versionCheckPromise.then((latestVersion) =>
      Maplestory.DataFactory.resolve('TWMS', latestVersion, 'String/Eqp.img/Eqp'),
    );

    Promise.all([initWorkerPromise, stringPromise]).then(([_, stringData]) => {
      // console.log(stringData);
      const allIdMap = stringData.children
        .flatMap((categoryProp) =>
          categoryProp.children.flatMap((prop) => ({
            id: prop.name,
            category: categoryProp.name,
            name: (prop.children.find((pv) => pv.name === 'name') || { value: '' }).value,
          })),
        )
        .reduce((acc, cur) => {
          acc[cur.id] = cur.name;
          return acc;
        }, {} as Record<string, string>);
      setLibReady(true);
      setItemIdMap(allIdMap);
    });
  }, [setLibReady]);

  return null;
}
