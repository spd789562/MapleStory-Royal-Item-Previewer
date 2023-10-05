'use client';
import Button from '@mui/material/Button';

import { useSetRecoilState } from 'recoil';
import { removeUploadCharacterHistory } from '@/store/uploadCharacterHistory';

interface ClearHistoryButtonProps {
  timestamp: number;
}
function ClearHistoryButton(props: ClearHistoryButtonProps) {
  const removeUploadCharacterHistoryState = useSetRecoilState(removeUploadCharacterHistory);

  const handleClick = () => {
    removeUploadCharacterHistoryState(props.timestamp);
  };

  return (
    <Button variant="contained" size="small" color="error" onClick={handleClick}>
      移除
    </Button>
  );
}

export default ClearHistoryButton;
