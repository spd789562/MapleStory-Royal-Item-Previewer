import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { RecoidContextProvider } from '@/store';
import { WorkerContextProvider } from '@/workers/workerContext';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '時裝動作及染色預覽',
  description: '預覽時裝動作及染色效果',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WorkerContextProvider>
          <RecoidContextProvider>{children}</RecoidContextProvider>
        </WorkerContextProvider>
      </body>
    </html>
  );
}
