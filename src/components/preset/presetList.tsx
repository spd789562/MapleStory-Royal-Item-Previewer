'use client';
import { memo } from 'react';

import { useRecoilValueLoadable } from 'recoil';
import { characterPresetListAtom } from '@/store/characterPresetList';

import Grid from '@mui/material/Grid';

function PresetList() {
  const presetList = useRecoilValueLoadable(characterPresetListAtom);

  return (
    <Grid container spacing={2}>
      {presetList.state === 'hasValue' &&
        presetList.contents.map((preset, index) => (
          <Grid item xs={12} key={`${preset.id}-${index}`}>
            {preset.name}
          </Grid>
        ))}
    </Grid>
  );
}

export default memo(PresetList);
