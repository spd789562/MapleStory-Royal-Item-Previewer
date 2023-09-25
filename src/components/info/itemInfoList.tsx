'use client';
import { memo } from 'react';

import { useRecoilValue } from 'recoil';
import { characterItemsSelector } from '@/store/characterItems';

import Grid from '@mui/material/Grid';
import ItemInfoItem from '@/components/info/itemInfoItem';

function ItemInfoList() {
  const items = useRecoilValue(characterItemsSelector);
  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid item xs={12} md={6} key={item.id}>
          <ItemInfoItem {...item} />
        </Grid>
      ))}
    </Grid>
  );
}

export default memo(ItemInfoList);
