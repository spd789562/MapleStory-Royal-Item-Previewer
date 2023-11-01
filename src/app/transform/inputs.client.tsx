'use client';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { characterDataIdSelector, characterDataNameSelector, characterDataDescSelector } from './json.store';

import { TextField } from '@mui/material';

export const CharacterIdInput = () => {
  const [id, setId] = useRecoilState(characterDataIdSelector);
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  }, []);
  return <TextField label="Id(用於排序)" value={id || ''} onChange={onChange} fullWidth />;
};

export const CharacterNameInput = () => {
  const [name, setName] = useRecoilState(characterDataNameSelector);
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);
  return <TextField label="名稱" value={name || ''} onChange={onChange} fullWidth />;
};

export const CharacterDescInput = () => {
  const [desc, setDesc] = useRecoilState(characterDataDescSelector);
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDesc(e.target.value);
  }, []);
  return <TextField label="描述" value={desc || ''} onChange={onChange} fullWidth />;
};
