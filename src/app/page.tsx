import React from 'react';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import Initializer from '@/components/initializer';
import Info from '@/components/info/info';
import CharacterActionList from '@/components/character/characterActionList';
import CharacterHue from '@/components/character/characterHue';

export default function Home() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5">時裝動作及染色預覽</Typography>
        </Toolbar>
      </AppBar>
      <main className="p-2 pt-4">
        <Initializer />
        <Container maxWidth="lg">
          <Info />
          <Typography variant="h5">角色動作</Typography>
          <div className="mt-4 pl-4">
            <CharacterActionList />
          </div>
          <Typography variant="h5">染色列表</Typography>
          <div className="px-4">
            <CharacterHue />
          </div>
        </Container>
      </main>
    </>
  );
}
