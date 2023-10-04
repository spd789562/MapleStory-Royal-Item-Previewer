'use client';
import { memo } from 'react';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import useDrawerItem from '@/components/drawer/useDrawerItem';

import type { PresetCharacterData } from '@/store/characterPresetList';

interface PresetItemProps {
  data: PresetCharacterData;
}
function PresetItem({ data }: PresetItemProps) {
  const { updateCharaterData } = useDrawerItem();

  const handleUpdate = () => {
    updateCharaterData(data);
  };

  return (
    <Card>
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {data.name}
        </Typography>
        {data.description && (
          <Typography variant="body2" color="text.secondary">
            {data.description}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Button size="small" onClick={handleUpdate}>
          套用
        </Button>
      </CardActions>
    </Card>
  );
}

export default memo(PresetItem);
