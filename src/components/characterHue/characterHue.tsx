'use client';
import Stack from '@mui/material/Stack';
import DownloadHueSheetButton from '@/components/characterHue/downloadHueSheetButton';
import DownloadHueZipButton from '@/components/characterHue/downloadHueZipButton';
import HueActionSelect from '@/components/characterHue/hueActionSelect';
import HueSlider from '@/components/characterHue/hueSlider';
import NoDyeableAlert from '@/components/characterHue/noDyeableAlert';

import { useRecoilValue } from 'recoil';
import { hasAnyDyeableSelector } from '@/store/characterItems';

import dynamic from 'next/dynamic';

const CharacterHueList = dynamic(() => import('@/components/characterHue/characterHueList'), { ssr: false });

function CharacterHue() {
  const hasAnyDyeable = useRecoilValue(hasAnyDyeableSelector);

  return (
    <div className="mt-2">
      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <DownloadHueSheetButton />
        <DownloadHueZipButton />
      </Stack>
      <HueActionSelect />
      <HueSlider />
      {hasAnyDyeable ? <CharacterHueList /> : <NoDyeableAlert />}
    </div>
  );
}

export default CharacterHue;
