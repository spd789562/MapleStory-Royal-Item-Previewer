'use client';
import { useRecoilState, useRecoilValue } from 'recoil';
import { characterDrawerOpenSelector, characterDrawerTabSelector, DrawerTab } from '@/store/characterDrawer';

import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import CharacterDrawerTab from '@/components/drawer/characterDrawerTab';

import dynamic from 'next/dynamic';

const PresetList = dynamic(() => import('@/components/preset/presetList'), {
  ssr: false,
  loading: () => (
    <Stack spacing={2} p={2}>
      <Skeleton variant="rounded" height={40} />
      <Skeleton variant="rounded" height={110} />
      <Skeleton variant="rounded" height={110} />
      <Skeleton variant="rounded" height={110} />
      <Skeleton variant="rounded" height={110} />
      <Skeleton variant="rounded" height={110} />
    </Stack>
  ),
});
const HistoryList = dynamic(() => import('@/components/history/historyList'), {
  ssr: false,
  loading: () => (
    <Stack spacing={2} p={2}>
      <Skeleton variant="rounded" height={32} />
      <Skeleton variant="rounded" height={110} />
      <Skeleton variant="rounded" height={110} />
      <Skeleton variant="rounded" height={110} />
      <Skeleton variant="rounded" height={110} />
      <Skeleton variant="rounded" height={110} />
    </Stack>
  ),
});

function CharaterDrawer() {
  const [isDrawerOpen, setDrawerOpen] = useRecoilState(characterDrawerOpenSelector);
  const drawerTab = useRecoilValue(characterDrawerTabSelector);

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <Drawer anchor="right" open={isDrawerOpen} onClose={handleDrawerClose}>
      <CharacterDrawerTab />
      <Box sx={{ width: '70vw', maxWidth: 345 }}>
        {drawerTab === DrawerTab.Preset && <PresetList />}
        {drawerTab === DrawerTab.Upload && <HistoryList />}
      </Box>
    </Drawer>
  );
}

export default CharaterDrawer;
