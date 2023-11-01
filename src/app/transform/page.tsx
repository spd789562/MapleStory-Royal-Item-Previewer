import React from 'react';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import JsonUploadBox from '@/app/transform/upload.client';
import { CharacterIdInput, CharacterNameInput, CharacterDescInput } from '@/app/transform/inputs.client';
import JsonPreview from '@/app/transform/jsonPreview.client';

export default function Home() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5">時裝動作及染色預覽 - 轉換檔案</Typography>
        </Toolbar>
      </AppBar>
      <main className="p-2 pt-4">
        <Container maxWidth="lg">
          <Typography variant="h5" mt={2}>
            上傳檔案
          </Typography>
          <div className="mt-4">
            <JsonUploadBox />
          </div>
          <Typography variant="h5" mt={2}>
            角色資料
          </Typography>
          <div className="mt-4">
            <Stack spacing={2}>
              <CharacterIdInput />
              <CharacterNameInput />
              <CharacterDescInput />
            </Stack>
          </div>
          <Typography variant="h5" mt={2}>
            轉換結果
          </Typography>
          <div className="mt-4">
            <JsonPreview />
          </div>
        </Container>
      </main>
    </>
  );
}
