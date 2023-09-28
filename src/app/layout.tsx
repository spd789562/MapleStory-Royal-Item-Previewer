import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { Inter } from 'next/font/google';

import { RecoidContextProvider } from '@/store';
import { WorkerContextProvider } from '@/workers/workerContext';
import CssBaseline from '@mui/material/CssBaseline';

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
      <body id="__next" className={inter.className}>
        <CssBaseline />
        <WorkerContextProvider>
          <RecoidContextProvider>{children}</RecoidContextProvider>
        </WorkerContextProvider>
        <Analytics />
      </body>
    </html>
  );
}
