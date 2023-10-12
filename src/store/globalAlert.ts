'use client';
import { atom, selector, DefaultValue } from 'recoil';
import { produce } from 'immer';

export interface AlertData {
  title?: string;
  closeDelay?: number;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  key?: any;
}

export interface AlertState {
  alerts: AlertData[];
  isOpen: boolean;
  currentAlert?: AlertData;
}
export const globalAlertAtom = atom<AlertState>({
  key: 'globalAlert',
  default: {
    alerts: [],
    isOpen: false,
  },
});

export const globalAlertIsOpenSelector = selector<boolean>({
  key: 'globalAlertIsOpen',
  get: ({ get }) => get(globalAlertAtom).isOpen,
});

export const globalAlertCurrentAlertSelector = selector<AlertData | undefined>({
  key: 'globalAlertCurrentAlert',
  get: ({ get }) => get(globalAlertAtom).currentAlert,
});

export const appendGlobalAlertSelector = selector<AlertData>({
  key: 'appendGlobalAlert',
  get: () => {
    return {} as AlertData;
  },
  set: ({ set }, newValue) => {
    if (newValue instanceof DefaultValue) {
      return newValue;
    }
    set(globalAlertAtom, (prevState) => {
      return produce(prevState, (draft) => {
        if (draft.isOpen) {
          draft.alerts.push(newValue);
        } else {
          draft.currentAlert = newValue;
          draft.isOpen = true;
        }
      });
    });
  },
});

export const cloaseGlobalAlertSelector = selector<undefined>({
  key: 'cloaseGlobalAlert',
  get: () => undefined,
  set: ({ set }, newValue) => {
    if (newValue instanceof DefaultValue) {
      return newValue;
    }
    set(globalAlertAtom, (prevState) => {
      return produce(prevState, (draft) => {
        if (draft.alerts.length > 0) {
          draft.currentAlert = draft.alerts.shift();
        } else {
          draft.isOpen = false;
          draft.currentAlert = undefined;
        }
      });
    });
  },
});
