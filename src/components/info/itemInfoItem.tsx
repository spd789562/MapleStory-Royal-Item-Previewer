'use client';
import { memo } from 'react';

import { CharacterItem } from '@/store/characterItems';

import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { styled } from '@mui/material/styles';

import DyeStatus from '@/components/info/dyeStatus';

const ItemContainer = styled(Paper)(({ theme }) => ({
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  '&:not(:last-child)': {
    marginBottom: theme.spacing(1),
  },
}));

interface ItemInfoItemProps extends CharacterItem {}
function ItemInfoItem({ id, name, icon, isDyeable }: ItemInfoItemProps) {
  return (
    <ItemContainer>
      <Avatar
        src={icon}
        variant="square"
        alt={name}
        sx={{ p: icon ? '4px' : 0 }}
        imgProps={{ sx: { objectFit: 'contain' } }}
      >
        <CategoryOutlinedIcon />
      </Avatar>
      <Typography>{name}</Typography>
      <Box ml="auto">
        <DyeStatus isDyeable={isDyeable} />
      </Box>
    </ItemContainer>
  );
}

export default memo(ItemInfoItem);
