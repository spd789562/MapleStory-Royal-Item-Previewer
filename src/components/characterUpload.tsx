'use client';
import { useCallback, useState } from 'react';
import { styled } from '@mui/material/styles';

import { useRecoilValue } from 'recoil';
import { libReadyAtom } from '@/store/libReady';

import Box from '@mui/material/Box';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

import ItemInfoList from '@/components/info/itemInfoList';

import useDropable from '@/utils/hooks/useDropable';
import dynamic from 'next/dynamic';

const InfoResolver = dynamic(() => import('@/components/info/infoResolver'), { ssr: false });

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
  const [characterData, setCharacterData] = useState<any>(null);
  const isLibReady = useRecoilValue(libReadyAtom);
  const onDrop = useCallback(
    (files: FileList) => {
      const file = files[0];
      if (!file || !isLibReady) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (!result) return;
        const data = JSON.parse(result as string);
        setCharacterData(data);
      };
      reader.readAsText(file);
    },
    [isLibReady],
  );
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
    <>
      <Box
        component="label"
        width="100%"
        height="200px"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        mt={2}
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
                opacity: 0.8,
              }
            : {
                borderColor: 'grey.400',
                backgroundColor: 'grey.100',
              }),
          ...(!isLibReady && {
            borderColor: 'grey.400',
            backgroundColor: 'grey.100',
            opacity: 0.5,
            cursor: 'not-allowed',
          }),
        }}
      >
        <FileUploadOutlinedIcon />
        <HiddenInput type="file" accept="application/json" onChange={onFileChange} />
        <span>點擊上傳或拖曳角色檔案至此</span>
      </Box>
      <InfoResolver data={characterData} />
      <ItemInfoList />
    </>
  );
}

export default CharacterUpload;
