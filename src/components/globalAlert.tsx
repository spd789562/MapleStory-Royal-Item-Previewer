'use client';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import {
  globalAlertIsOpenSelector,
  globalAlertCurrentAlertSelector,
  cloaseGlobalAlertSelector,
} from '@/store/globalAlert';

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

function GlobalAlert() {
  const isOpen = useRecoilValue(globalAlertIsOpenSelector);
  const currentAlert = useRecoilValue(globalAlertCurrentAlertSelector);
  const closeAlert = useSetRecoilState(cloaseGlobalAlertSelector);

  const handleClose = () => {
    closeAlert(undefined);
  };

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={currentAlert?.closeDelay || 4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      key={currentAlert?.key}
    >
      {currentAlert && (
        <Alert severity={currentAlert.type} variant="standard" onClose={handleClose} sx={{ width: '100%' }}>
          {currentAlert.title && <AlertTitle>{currentAlert.title}</AlertTitle>}
          {currentAlert.message}
        </Alert>
      )}
    </Snackbar>
  );
}

export default GlobalAlert;
