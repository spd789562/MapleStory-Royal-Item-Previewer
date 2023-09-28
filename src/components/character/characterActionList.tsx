'use client';
import { createRef, useRef, useCallback, useState } from 'react';

import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';

import ActionCharacter from './actionCharacter';
import type { CharacterImageRef } from '@/components/characterImage';

import { CharacterAction } from '@/mapping/characterAction';

import { requestIdleCallback } from '@/utils/requestIdleCallback';
import download from 'downloadjs';

const actions = [
  CharacterAction.Stand1,
  CharacterAction.Stand2,
  CharacterAction.Walk1,
  CharacterAction.Walk2,
  CharacterAction.Alert,
  CharacterAction.Jump,
  CharacterAction.Ladder,
  CharacterAction.Fly,
  CharacterAction.ProneStab,

  CharacterAction.Shoot1,
  CharacterAction.Shoot2,
  CharacterAction.ShootF,

  CharacterAction.StabO1,
  CharacterAction.StabO2,
  CharacterAction.StabOF,

  CharacterAction.StabT1,
  CharacterAction.StabT2,
  CharacterAction.StabTF,

  CharacterAction.SwingO1,
  CharacterAction.SwingO2,
  CharacterAction.SwingO3,
  CharacterAction.SwingOF,

  CharacterAction.SwingP1,
  CharacterAction.SwingP2,
  CharacterAction.SwingPF,

  CharacterAction.SwingT1,
  CharacterAction.SwingT2,
  CharacterAction.SwingT3,
  CharacterAction.SwingTF,
];

const actionRefs = actions.map(() => createRef<CharacterImageRef>());

function CharacterActionList() {
  const actionImageRefs = useRef(actionRefs);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadWebps = useCallback(() => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    import('jszip').then(({ default: JSZip }) => {
      const zip = new JSZip();
      actionImageRefs.current.forEach((ref: React.RefObject<CharacterImageRef>, index: number) => {
        if (ref.current) {
          const webp = ref.current.getWebp();
          const base64 = webp.split(',')[1];
          zip.file(`${ref.current.name || `action-${index}`}.webp`, base64, {
            base64: true,
          });
        }
      });
      zip.generateAsync({ type: 'blob' }).then((blob) => {
        setIsLoading(false);
        download(blob, 'maplestory-webp.zip', 'application/zip');
      });
    });
  }, [isLoading]);

  const handleDownloadGifs = useCallback(() => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    import('jszip').then(({ default: JSZip }) => {
      const zip = new JSZip();
      const gifPromises = actionImageRefs.current.map((ref: React.RefObject<CharacterImageRef>) =>
        ref.current ? ref.current.getGif() : null,
      );

      Promise.all(gifPromises)
        .then((gifs) => {
          gifs.forEach((gif, index) => {
            if (gif) {
              zip.file(`${actionImageRefs.current[index].current!.name || `action-${index}`}.gif`, gif);
            }
          });
          return zip.generateAsync({ type: 'blob' });
        })
        .then((blob) => {
          setIsLoading(false);
          download(blob, 'maplestory-gif.zip', 'application/zip');
        });
    });
  }, [isLoading]);

  return (
    <div>
      <Stack direction="row" spacing={2} mb={2}>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownloadWebps} disabled={isLoading}>
          Webp
        </Button>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownloadGifs} disabled={isLoading}>
          Gif
        </Button>
      </Stack>
      <Grid container spacing={2} alignItems="stretch">
        {actions.map((action, index) => (
          <Grid key={action} item xs={12} sm={6} md={4} lg={3} p={2}>
            <Paper>
              <Typography variant="h6" px={1}>
                {action}
              </Typography>
              <ActionCharacter forwardedRef={actionImageRefs.current[index]} action={action} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default CharacterActionList;
