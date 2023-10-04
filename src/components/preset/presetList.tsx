'use client';
import { memo } from 'react';

import { useRecoilValueLoadable } from 'recoil';
import { characterPresetListAtom } from '@/store/characterPresetList';

import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PresetItem from '@/components/preset/presetItem';

function PresetList() {
  const presetList = useRecoilValueLoadable(characterPresetListAtom);

  return (
    <Grid container spacing={2} p={2}>
      {presetList.state === 'hasValue' && (
        <>
          <Grid item xs={12}>
            <Button
              component="a"
              variant="outlined"
              href={presetList.contents.url}
              target="_blank"
              rel="noopener noreferrer"
              fullWidth
            >
              檔案存放位置 <OpenInNewIcon fontSize="small" />
            </Button>
            <Typography variant="caption" color="text.secondary" textAlign="center">
              最後更新時間: {presetList.contents.updateAt.split('T')[0]}
            </Typography>
          </Grid>
          {presetList.contents.characters.map((preset, index) => (
            <Grid item xs={12} key={`${preset.id}-${index}`}>
              <PresetItem data={preset} />
            </Grid>
          ))}
        </>
      )}
      {presetList.state === 'loading' && (
        <>
          <Grid item xs={12}>
            <Skeleton variant="rounded" height={40} />
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
          <Grid item xs={12}>
            <Skeleton variant="rounded" height={110} />
          </Grid>
        </>
      )}
    </Grid>
  );
}

export default memo(PresetList);
