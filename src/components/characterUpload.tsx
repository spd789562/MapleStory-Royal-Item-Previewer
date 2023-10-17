'use client';
import { useCallback, useState } from 'react';
import { styled } from '@mui/material/styles';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { characterDataAtom } from '@/store/character';
import { appendGlobalAlertSelector } from '@/store/globalAlert';
import { canUploadCharacterSelector } from '@/store/selector';

import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import CircleProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import PresetButton from '@/components/preset/presetButton';
import HistoryButton from '@/components/history/historyButton';
import CharacterDrawer from '@/components/drawer/characterDrawer';
import LoadState from '@/components/upload/loadState';

import { isValidCharacter } from '@/utils/maplestory/validCharacter';

import useDropable from '@/utils/hooks/useDropable';
import dynamic from 'next/dynamic';

const InfoResolver = dynamic(() => import('@/components/info/infoResolver'), { ssr: false });

const MapleStudioUrl = 'https://maplestory.studio/';

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

interface UploadBoxExtraProps {
  isDragging: boolean;
  disabled: boolean;
}
const UploadBox = styled('label', {
  shouldForwardProp: (prop) => prop !== 'isDragging' && prop !== 'disabled',
})<UploadBoxExtraProps>(({ theme, isDragging, disabled }) => ({
  position: 'relative',
  width: '100%',
  height: '200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  borderStyle: 'dashed',
  borderWidth: 2,
  borderRadius: 4,
  borderColor: isDragging ? 'white' : theme.palette.grey[400],
  backgroundColor: isDragging ? theme.palette.primary.light : theme.palette.grey[100],
  opacity: isDragging ? 0.8 : disabled ? 0.5 : 1,
  color: isDragging ? 'white' : theme.palette.grey[600],
  cursor: disabled ? 'not-allowed' : 'pointer',
}));

const TopLeftStatus = styled(Stack)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  color: theme.palette.grey[600],
}));

const BottomRightActions = styled(Stack)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
}));

function CharacterUpload() {
  const setCharacterData = useSetRecoilState(characterDataAtom);
  const canUpload = useRecoilValue(canUploadCharacterSelector);
  const appendGlobalAlert = useSetRecoilState(appendGlobalAlertSelector);

  const onDrop = useCallback(
    (files: FileList) => {
      const file = files[0];
      if (!file || !canUpload) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (!result) return;
        const data = JSON.parse(result as string);
        if (!data.name) {
          data.name = file.name.replace(/\.json$/, '');
        }
        if (!isValidCharacter(data)) {
          return appendGlobalAlert({
            title: '載入失敗',
            message: '角色檔案格式錯誤',
            type: 'error',
          });
        }
        setCharacterData(data);
      };
      reader.readAsText(file);
    },
    [canUpload],
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
      <UploadBox {...dropableProps} isDragging={isDragging} disabled={!canUpload}>
        <FileUploadOutlinedIcon />
        <HiddenInput type="file" accept="application/json" onChange={onFileChange} disabled={!canUpload} />
        <span>點擊上傳或拖曳角色檔案至此</span>
        <Link href={MapleStudioUrl} target="_blank" rel="noopener noreferrer" variant="body2">
          或至 MapleStory Studio 建立角色檔案並上傳
        </Link>
        {!canUpload && (
          <TopLeftStatus direction="row" spacing={1}>
            <CircleProgress size={32} color="inherit" />
            <LoadState />
          </TopLeftStatus>
        )}
        <BottomRightActions direction="row" spacing={1}>
          <PresetButton disabled={!canUpload} />
          <HistoryButton disabled={!canUpload} />
        </BottomRightActions>
      </UploadBox>
      <CharacterDrawer />
      <InfoResolver />
    </>
  );
}

export default CharacterUpload;
