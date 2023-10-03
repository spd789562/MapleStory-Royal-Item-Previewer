'use client';
import { memo } from 'react';

import { useSetRecoilState } from 'recoil';
import { characterDrawerAtom, DrawerTab } from '@/store/characterDrawer';

import Button from '@mui/material/Button';

interface PresetButtonProps {
  disabled?: boolean;
}
function PresetButton({ disabled }: PresetButtonProps) {
  const setCharacterDrawer = useSetRecoilState(characterDrawerAtom);

  const handleOpen = () => {
    setCharacterDrawer({
      isOpen: true,
      tab: DrawerTab.Preset,
    });
  };

  return (
    <Button variant="contained" color="primary" onClick={handleOpen} disabled={disabled}>
      預設時裝
    </Button>
  );
}

export default memo(PresetButton);
