'use client';
import { RecoilRoot } from 'recoil';

export function RecoidContextProvider({ children }: { children: React.ReactNode }) {
  return <RecoilRoot>{children}</RecoilRoot>;
}
