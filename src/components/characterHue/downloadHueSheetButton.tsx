'use client';
import { memo } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { characterHueCanvases } from '@/store/characterHue';
import { isDownloadHueDisabledSelector } from '@/store/selector';

import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';

import download from 'downloadjs';

function DownloadHueSheetButton() {
  const isDownloadDisabled = useRecoilValue(isDownloadHueDisabledSelector);
  const handleDownloadHueSheet = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const canvasList = await snapshot.getPromise(characterHueCanvases);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx || !canvasList.length) return;
        const { width, height } = canvasList[0];
        const hueCount = canvasList.length;
        const colCount = hueCount > 32 ? 8 : 4;
        const rowCount = Math.ceil(hueCount / colCount);
        canvas.width = width * colCount;
        canvas.height = height * rowCount;
        canvasList.forEach((hueCanvas, index) => {
          const col = index % colCount;
          const row = Math.floor(index / colCount);
          ctx.drawImage(hueCanvas, col * width, row * height);
        });
        canvas.toBlob((blob) => {
          if (!blob) return;
          download(blob, 'hue.png', 'image/png');
        });
      },
    [],
  );

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<DownloadIcon />}
      onClick={handleDownloadHueSheet}
      disabled={isDownloadDisabled}
    >
      染色表(合併)
    </Button>
  );
}

export default memo(DownloadHueSheetButton);
