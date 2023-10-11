'use client';
import { useCallback, memo } from 'react';

import { useRecoilValue, useRecoilState } from 'recoil';
import { characterHueLoadingSelector, characterHueActionSelector } from '@/store/characterHue';

import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { CharacterAction } from '@/mapping/characterAction';

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

function CharacterHueActionSelect() {
  const [action, setAction] = useRecoilState(characterHueActionSelector);
  const isLoading = useRecoilValue(characterHueLoadingSelector);

  const handleChange = useCallback((event: SelectChangeEvent) => {
    setAction(event.target.value as unknown as CharacterAction);
  }, []);

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
      <Typography id="hue-slider" sx={{ minWidth: '100px' }}>
        動作
      </Typography>
      <Select value={action} onChange={handleChange} sx={{ minWidth: '200px' }} size="small" disabled={isLoading}>
        {actions.map((action) => (
          <MenuItem key={action} value={action}>
            {action}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
}

export default memo(CharacterHueActionSelect);
