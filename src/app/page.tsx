import React from 'react';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import Initializer from '@/component/initializer';
import CharacterActionList from '@/component/character/characterActionList';

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
        <Container>
          <Typography variant="h5">角色動作</Typography>
          <Box>
            <CharacterActionList />
          </Box>
          <Typography variant="h5">染色列表</Typography>
        </Container>
      </main>
    </>
  );
}
