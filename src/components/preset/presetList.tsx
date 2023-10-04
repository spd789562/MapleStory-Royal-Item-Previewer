'use client';
import { memo } from 'react';

import { useRecoilValueLoadable } from 'recoil';
import { characterPresetListAtom } from '@/store/characterPresetList';

import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import PresetItem from '@/components/preset/presetItem';

function PresetList() {
  const presetList = useRecoilValueLoadable(characterPresetListAtom);

  return (
    <Grid container spacing={2} p={2}>
      {presetList.state === 'hasValue' &&
        presetList.contents.map((preset, index) => (
          <Grid item xs={12} key={`${preset.id}-${index}`}>
            <PresetItem data={preset} />
          </Grid>
        ))}
      {presetList.state === 'loading' && (
        <>
          <Grid item xs={12}>
            <Skeleton variant="rounded" height={110} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rounded" height={110} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rounded" height={110} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rounded" height={110} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rounded" height={110} />
          </Grid>
        </>
      )}
    </Grid>
  );
}

export default memo(PresetList);
