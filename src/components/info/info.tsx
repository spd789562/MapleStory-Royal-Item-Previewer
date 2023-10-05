'use client';
import { useRecoilValue } from 'recoil';
import { isCharacterItemsLoadedSelector, hasCharacterItemsSelector } from '@/store/characterItems';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import CharacterUpload from '@/components/characterUpload';
import ItemInfoList from '@/components/info/itemInfoList';
import CurrentCharacter from '@/components/character/currentCharacter';
import ResetCharacterButton from '@/components/info/resetCharacterButton';

function CharacterInfo() {
  const isLoaded = useRecoilValue(isCharacterItemsLoadedSelector);
  const hasItems = useRecoilValue(hasCharacterItemsSelector);

  return (
    <Grid container spacing={2} ml={0} mb={2} width="100%">
      {!hasItems && <CharacterUpload />}
      {hasItems && (
        <Grid item xs={12} md={4}>
          <Paper>
            <Box
              minHeight="200px"
              maxHeight={{ xs: '200px', md: 'unset' }}
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{
                aspectRatio: '1 / 1',
              }}
            >
              <CurrentCharacter />
            </Box>
          </Paper>
          <Box mt={2}>
            <ResetCharacterButton />
          </Box>
        </Grid>
      )}
      <Grid item xs={12} md={8}>
        {isLoaded && hasItems && <ItemInfoList />}
      </Grid>
    </Grid>
  );
}

export default CharacterInfo;
