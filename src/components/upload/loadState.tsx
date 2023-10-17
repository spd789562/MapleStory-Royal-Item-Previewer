import { memo } from 'react';

import { useRecoilValue } from 'recoil';
import { loadStateAtom } from '@/store/loadState';

const LoadState = () => {
  const { name, progress } = useRecoilValue(loadStateAtom);

  return (
    <div className="text-xs flex items-center">
      正在載入{name || '資源'} {progress && `...${Math.floor(progress * 100)}%`}
    </div>
  );
};

export default memo(LoadState);
