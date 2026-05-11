// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansBengali = Noto_Sans_Bengali({ subsets: ['bengali'], variable: '--font-bengali' });

export const metadata: Metadata = {
  title: 'Foylx Note — Digital Notebook',
  description: 'Powerful local-first digital notebook with handwriting, OCR, and Google Drive sync',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Foylx Note" />
        <script dangerouslySetInnerHTML={{__html:`
          if('serviceWorker' in navigator){
            window.addEventListener('load',()=>{
              navigator.serviceWorker.register('/sw.js').catch(()=>{});
            });
          }
        `}} />
      </head>
      <body className={`${inter.variable} ${notoSansBengali.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
