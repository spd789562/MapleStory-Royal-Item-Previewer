import Image from 'next/image';
import Tooltip from '@mui/material/Tooltip';

interface DyeStatusProps {
  isDyeable: boolean;
}
function DyeStatus({ isDyeable }: DyeStatusProps) {
  if (isDyeable) {
    return (
      <Tooltip title="可染色">
        <Image src="/images/item_dye.png" alt="可染色" width={18} height={18} />
      </Tooltip>
    );
  }

  return (
    <Image src="/images/item_dye.png" alt="不可染色" title="不可染色" width={18} height={18} style={{ filter: 'grayscale(100%)' }} />
  );
}

export default DyeStatus;
