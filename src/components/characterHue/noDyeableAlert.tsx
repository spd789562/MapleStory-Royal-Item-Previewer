import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

export default function NoDyeableAlert() {
  return (
    <Alert severity="warning" sx={{ marginTop: 4, marginBottom: 4 }}>
      <AlertTitle>警告</AlertTitle>
      尚未上傳檔案或上傳的角色未裝備可染色時裝
    </Alert>
  );
}
