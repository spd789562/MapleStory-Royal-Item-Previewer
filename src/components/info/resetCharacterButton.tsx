'use client';
import Button from '@mui/material/Button';

import { useResetRecoilState } from 'recoil';
import { characterDataAtom } from '@/store/character';
import { characterItemsAtom } from '@/store/characterItems';
import { loadStateAtom } from '@/store/loadState';

function ResetCharacterButton() {
  const resetCharacterData = useResetRecoilState(characterDataAtom);
  const resetCharacterItems = useResetRecoilState(characterItemsAtom);
  const resetLoadState = useResetRecoilState(loadStateAtom);

  const handleClick = () => {
    resetCharacterData();
    resetCharacterItems();
    resetLoadState();
  };

  return (
    <Button variant="contained" color="error" onClick={handleClick} fullWidth>
      重置資料
    </Button>
  );
}

export default ResetCharacterButton;
