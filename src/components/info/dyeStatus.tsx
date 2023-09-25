import Image from 'next/image';

interface DyeStatusProps {
  isDyeable: boolean;
}
function DyeStatus({ isDyeable }: DyeStatusProps) {
  return (
    <Image
      src={`/images/item_dye.png`}
      alt={isDyeable ? '可染色' : ''}
      width={18}
      height={18}
      style={{ filter: isDyeable ? 'none' : 'grayscale(100%)' }}
    />
  );
}

export default DyeStatus;
