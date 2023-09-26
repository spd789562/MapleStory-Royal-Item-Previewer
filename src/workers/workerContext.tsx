'use client';
import { createContext, useRef, useContext } from 'react';

export interface WorkerItem {
  worker: Worker;
  isReady: boolean;
}

export interface WorkerContextType {
  workers: Record<string, WorkerItem>;
}

export const WorkerContext = createContext<WorkerContextType>({
  workers: {},
});

export const WorkerContextProvider = ({ children }: { children: React.ReactNode }) => {
  const workersRef = useRef<Record<string, WorkerItem>>({});
  const workers = workersRef.current;
  return (
    <WorkerContext.Provider
      value={{
        workers,
      }}
    >
      {children}
    </WorkerContext.Provider>
  );
};

export const useWorkerContext = () => {
  const { workers } = useContext(WorkerContext);
  return workers;
};

export const useWorker = (name: string) => {
  const { workers } = useContext(WorkerContext);
  const workerItem = workers[name];
  return workerItem && workerItem.worker;
};
