'use client';
import { memo } from 'react';

import { useRecoilValue } from 'recoil';
import { uploadCharacterHistoryAtom } from '@/store/uploadCharacterHistory';

import Grid from '@mui/material/Grid';
import ClearHistoryButton from '@/components/history/clearHistoryButton';
import HistoryItem from '@/components/history/historyItem';

function HistoryList() {
  const historyList = useRecoilValue(uploadCharacterHistoryAtom);

  return (
    <Grid container spacing={2} p={2}>
      <Grid item xs={12}>
        <ClearHistoryButton />
      </Grid>
      {historyList.map((history, index) => (
        <Grid item xs={12} key={`${history.id}-${index}`}>
          <HistoryItem data={history} />
        </Grid>
      ))}
    </Grid>
  );
}

export default memo(HistoryList);
