'use client';
import { memo } from 'react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { characterHueCanvases, characterHueLoadingSelector } from '@/store/characterHue';
import { isDownloadHueDisabledSelector } from '@/store/selector';

import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';

import download from 'downloadjs';
import { requestIdleCallback } from '@/utils/requestIdleCallback';

function DownloadHueSheetButton() {
  const isDownloadDisabled = useRecoilValue(isDownloadHueDisabledSelector);
  const setCharacterHueLoading = useSetRecoilState(characterHueLoadingSelector);
  const handleDownloadHueZip = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const canvasList = await snapshot.getPromise(characterHueCanvases);
        if (!canvasList.length) return;
        setCharacterHueLoading(true);
        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();
        const promises = canvasList.map((canvas, index) => {
          return new Promise<Blob>((resolve) => {
            requestIdleCallback(() => {
              canvas.toBlob((blob) => {
                resolve(blob!);
              });
            });
          }).then((blob) => {
            zip.file(`hue_${index}.png`, blob);
          });
        });
        await Promise.all(promises);
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        download(zipBlob, 'hue.zip', 'application/zip');
        setCharacterHueLoading(false);
      },
    [],
  );

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<DownloadIcon />}
      onClick={handleDownloadHueZip}
      disabled={isDownloadDisabled}
    >
      染色表(分開)
    </Button>
  );
}

export default memo(DownloadHueSheetButton);
