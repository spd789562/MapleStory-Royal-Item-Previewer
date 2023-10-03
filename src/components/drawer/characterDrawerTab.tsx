'use client';
import { useRecoilState } from 'recoil';
import { characterDrawerTabSelector, DrawerTab } from '@/store/characterDrawer';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

function CharacterDrawerTab() {
  const [drawerTab, setCharacterDrawerTab] = useRecoilState(characterDrawerTabSelector);

  const handleChange = (_: React.SyntheticEvent, newValue: DrawerTab) => {
    setCharacterDrawerTab(newValue);
  };

  return (
    <Tabs value={drawerTab} onChange={handleChange} variant="fullWidth" indicatorColor="primary" textColor="primary">
      <Tab label="預設時裝" value={DrawerTab.Preset} />
      <Tab label="上傳紀錄" value={DrawerTab.Upload} />
    </Tabs>
  );
}

export default CharacterDrawerTab;
