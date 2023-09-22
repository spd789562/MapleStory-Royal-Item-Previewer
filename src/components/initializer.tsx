'use client';
import dynamic from 'next/dynamic';

const Initializer = dynamic(() => import('@/components/_initializer'), { ssr: false });

export default Initializer;
