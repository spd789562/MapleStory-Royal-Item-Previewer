'use client';
import { memo } from 'react';

import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DeleteItemButton from '@/components/history/deleteItemButton';

import useDrawerItem from '@/components/drawer/useDrawerItem';

import type { HistoryCharacterData } from '@/store/uploadCharacterHistory';

const CenterdCardMedia = styled(CardMedia)({
  height: 110,
  backgroundSize: 'contain',
  backgroundPosition: 'center center',
});

interface HistoryItemProps {
  data: HistoryCharacterData;
}
function HistoryItem({ data }: HistoryItemProps) {
  const { updateCharaterData } = useDrawerItem();

  const handleUpdate = () => {
    updateCharaterData(data);
  };

  return (
    <Card>
      <CenterdCardMedia image={data.previewUrl} title={data.name} />
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {data.name}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={handleUpdate}>
          套用
        </Button>
        <DeleteItemButton timestamp={data.timestamp} />
      </CardActions>
    </Card>
  );
}

export default memo(HistoryItem);
