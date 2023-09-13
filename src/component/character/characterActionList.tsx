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
];

function CharacterActionList() {
  return (
    <Grid container spacing={2}>
      {actions.map((action) => (
        <Grid key={action} item xs={12} sm={4} md={3} lg={2}>
          <Paper>
            <ActionCharacter action={action} />
            <Typography variant="h6">{action}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default CharacterActionList;
