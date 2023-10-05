'use client';
import { memo } from 'react';

import { useSetRecoilState } from 'recoil';
import { characterDrawerAtom, DrawerTab } from '@/store/characterDrawer';

import Button from '@mui/material/Button';

interface HistoryButtonProps {
  disabled?: boolean;
}
function HistoryButton({ disabled }: HistoryButtonProps) {
  const setCharacterDrawer = useSetRecoilState(characterDrawerAtom);

  const handleOpen = () => {
    setCharacterDrawer({
      isOpen: true,
      tab: DrawerTab.Upload,
    });
  };

  return (
    <Button variant="contained" color="primary" onClick={handleOpen} disabled={disabled}>
      上傳紀錄
    </Button>
  );
}

export default memo(HistoryButton);
