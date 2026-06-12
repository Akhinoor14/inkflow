// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Foylx Note — Digital Notebook',
  description: 'Foylx Note is a local-first digital notebook for handwriting, OCR, audio-linked notes, and Google Drive sync.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2d6be4',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DM Sans: warmer body; Sora: display; Caveat: brand mark only; JetBrains Mono: code/labels; Noto Sans Bengali */}
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,400&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Bengali:wght@400;600&family=Sora:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#2d6be4" />
        <meta name="mobile-web-app-capable" content="yes" />
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
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
