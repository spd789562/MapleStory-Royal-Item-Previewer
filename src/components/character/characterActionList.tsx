import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import ActionCharacter from './actionCharacter';

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

function CharacterActionList() {
  return (
    <Grid container spacing={2} alignItems="stretch">
      {actions.map((action) => (
        <Grid key={action} item xs={12} sm={6} md={4} lg={3} p={2}>
          <Paper>
            <Typography variant="h6" px={1}>
              {action}
            </Typography>
            <ActionCharacter action={action} />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default CharacterActionList;
