'use client';
import { useCallback, useState, useRef } from 'react';

import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import type { CharacterHueListRef } from '@/components/character/characterHueList';

import { useRecoilValue } from 'recoil';
import { canLoadCharacterSelector } from '@/store/selector';

import { debounce } from '@mui/material';
import dynamic from 'next/dynamic';
import download from 'downloadjs';

const CharacterHueList = dynamic(() => import('@/components/character/characterHueList'), { ssr: false });

const sliderMarks = [
  {
    value: 16,
    label: '16',
  },
  {
    value: 24,
    label: '24',
  },
  {
    value: 32,
    label: '32',
  },
  {
    value: 48,
    label: '48',
  },
  {
    value: 72,
    label: '72',
  },
];

function CharacterHue() {
  const [hueCount, setHueCount] = useState(16);
  const [debounceHueCount, setDebounceHueCount] = useState(16);
  const [isLoading, setIsLoading] = useState(false);
  const hueCanvasListRef = useRef<CharacterHueListRef>(null);
  const isCharacterLoaded = useRecoilValue(canLoadCharacterSelector);
  const isDownloadDisabled = isLoading || !isCharacterLoaded;

  const debouncedSetHueCount = useCallback(
    debounce((hueCount) => {
      setDebounceHueCount(hueCount);
    }, 1000),
    [],
  );

  const handleSliderChange = (event: Event, value: number | number[]) => {
    setHueCount(value as number);
    debouncedSetHueCount(value as number);
  };

  const handleDownloadHueSheet = () => {
    if (isLoading || !hueCanvasListRef.current) return;
    const $canvas = document.createElement('canvas');
    const ctx = $canvas.getContext('2d')!;
    const colCount = hueCount > 32 ? 8 : 4;
    const rowCount = Math.ceil(hueCount / colCount);
    const firstCanvas = hueCanvasListRef.current.canvasList[0];
    $canvas.width = firstCanvas.width * colCount;
    $canvas.height = firstCanvas.height * rowCount;
    for (let i = 0; i < hueCount; i++) {
      const canvas = hueCanvasListRef.current.canvasList[i];
      const col = i % colCount;
      const row = Math.floor(i / colCount);
      const x = col * canvas.width;
      const y = row * canvas.height;
      ctx.drawImage(canvas, x, y);
    }
    $canvas.toBlob((blob) => {
      download(blob!, 'hue.png', 'image/png');
    });
  };

  const handleDownloadSeparateZip = () => {
    if (isLoading || !hueCanvasListRef.current) return;
    setIsLoading(true);
    requestIdleCallback(() => {
      import('jszip')
        .then(({ default: JSZip }) => {
          const zip = new JSZip();
          const canvasList = hueCanvasListRef.current!.canvasList;
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
          return Promise.all(promises).then(() => {
            return zip.generateAsync({ type: 'blob' });
          });
        })
        .then((content) => {
          download(content, 'hue.zip', 'application/zip');
          setIsLoading(false);
        });
    });
  };

  return (
    <div className="mt-2">
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadHueSheet}
          disabled={isDownloadDisabled}
        >
          染色表(合併)
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadSeparateZip}
          disabled={isDownloadDisabled}
        >
          染色表(分開)
        </Button>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Typography id="hue-slider" sx={{ minWidth: '100px' }}>
          染色數量
        </Typography>
        <Slider
          value={hueCount}
          aria-labelledby="hue-slider"
          valueLabelDisplay="auto"
          step={null}
          marks={sliderMarks}
          min={16}
          max={72}
          onChange={handleSliderChange}
          disabled={isLoading}
          sx={{ maxWidth: '300px' }}
        />
      </Stack>
      <CharacterHueList forwardedRef={hueCanvasListRef} onChangeLoad={setIsLoading} hueCount={debounceHueCount} />
    </div>
  );
}

export default CharacterHue;
