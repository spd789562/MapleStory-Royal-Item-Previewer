'use client';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';

import { useSetRecoilState } from 'recoil';
import { clearUploadCharacterHistory } from '@/store/uploadCharacterHistory';

function ClearHistoryButton() {
  const clearUploadCharacterHistoryState = useSetRecoilState(clearUploadCharacterHistory);

  const handleClick = () => {
    clearUploadCharacterHistoryState(null);
  };

  return (
    <Button variant="contained" color="error" onClick={handleClick} startIcon={<DeleteIcon />} fullWidth>
      清除上傳紀錄
    </Button>
  );
}

export default ClearHistoryButton;
