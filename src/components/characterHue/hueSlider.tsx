'use client';
import { useCallback, useState, memo } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { characterHueLoadingSelector, characterHueCountSelector } from '@/store/characterHue';

import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';

import { debounce } from '@mui/material';

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

function CharacterHueSlider() {
  const [hueCount, setHueCount] = useState(16);
  const setDebounceHueCount = useSetRecoilState(characterHueCountSelector);
  const isLoading = useRecoilValue(characterHueLoadingSelector);

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

  return (
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
  );
}

export default memo(CharacterHueSlider);
