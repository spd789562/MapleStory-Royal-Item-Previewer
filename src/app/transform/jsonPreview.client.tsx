'use client';
import { useCallback } from 'react';
import { styled } from '@mui/material/styles';

import { useRecoilValue } from 'recoil';
import { characterDataAtom } from './json.store';

import IconButton from '@mui/material/IconButton';
import CopyIcon from '@mui/icons-material/FileCopyOutlined';

/* preview json content */
const PreviewBox = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'auto',
  minHeight: 150,
  whiteSpace: 'pre-wrap',
}));

const CopyButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
}));

const JsonPreview = () => {
  const characterData = useRecoilValue(characterDataAtom);

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(characterData, null, 2));
  }, [characterData]);

  return (
    <PreviewBox>
      <CopyButton onClick={onCopy}>
        <CopyIcon />
      </CopyButton>
      {/* this may have performance issue, but just ignore this */}
      {JSON.stringify(characterData, null, 2)}
    </PreviewBox>
  );
};

export default JsonPreview;
