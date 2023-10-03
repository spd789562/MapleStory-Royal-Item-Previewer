'use client';
import { useRecoilState } from 'recoil';
import { characterDrawerOpenSelector } from '@/store/characterDrawer';

import Drawer from '@mui/material/Drawer';

import CharacterDrawerTab from '@/components/drawer/characterDrawerTab';

import dynamic from 'next/dynamic';

const PresetList = dynamic(() => import('@/components/preset/presetList'), { ssr: false });

function CharaterDrawer() {
  const [isDrawerOpen, setDrawerOpen] = useRecoilState(characterDrawerOpenSelector);

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <Drawer anchor="right" open={isDrawerOpen} onClose={handleDrawerClose}>
      <CharacterDrawerTab />
      <PresetList />
    </Drawer>
  );
}

export default CharaterDrawer;
