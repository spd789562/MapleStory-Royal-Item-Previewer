'use client';
import { useCallback } from 'react';
import { styled } from '@mui/material/styles';

import Box from '@mui/material/Box';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

import useDropable from '@/utils/hooks/useDropable';

const HiddenInput = styled('input')({
  position: 'absolute',
  bottom: 0,
  left: 0,
  height: 1,
  width: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
});

function CharacterUpload() {
  const onDrop = useCallback((files: FileList) => {
    console.log(files);
  }, []);
  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      onDrop(files);
    },
    [onDrop],
  );
  const [dropableProps, isDragging] = useDropable({ onDrop });

  return (
    <Box
      component="label"
      width="100%"
      height="200px"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      {...dropableProps}
      sx={{
        borderStyle: 'dashed',
        borderWidth: 2,
        borderRadius: 4,
        ...(isDragging
          ? {
              borderColor: 'white',
              backgroundColor: 'primary.light',
              color: 'white',
            }
          : {
              borderColor: 'grey.400',
              backgroundColor: 'grey.100',
            }),
      }}
    >
      <FileUploadOutlinedIcon />
      <HiddenInput type="file" accept="application/json" onChange={onFileChange} />
      <span>點擊上傳或拖曳角色檔案至此</span>
    </Box>
  );
}

export default CharacterUpload;
