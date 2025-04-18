import type { Metadata } from 'next';
import { Quantico } from 'next/font/google';
import './globals.css';

import { AppSidebar } from '@/components/app/sidebar';

import { Header } from '@/components/app/header';

import { BaseApi } from '@ph-blockchain/api';
import { generateToken } from '@/lib/server/generate-tokens';
import { headers } from 'next/headers';
import { Providers } from '@/components/provider';
import { Config } from '@/constants/config';
import { createSiteUrl } from '@/lib/create-site-url';

BaseApi.init(Config.serverApiBaseUrl)
  .setGetToken(generateToken)
  .headers.setUserAgent(Config.userAgent);

const quantico = Quantico({
  weight: '400',
  variable: '--quantico',
  subsets: ['latin'],
});

const url = createSiteUrl(undefined, true);

const title = 'FiliXChain | Blockchain';
const description =
  'FiliXChain is a blockchain system for the Philippines, enabling secure and scalable apps built by and for Filipinos.';

export const metadata: Metadata = {
  metadataBase: url,
  title,
  description,
  openGraph: {
    url,
    title,
    description,
    siteName: title,
  },
  icons: {
    icon: [
      {
        url: '/icon-16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/icon-32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/icon-48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        url: '/icon-64.png',
        sizes: '64x64',
        type: 'image/png',
      },
      {
        url: '/icon-96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        url: '/icon-128.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        url: '/icon-156.png',
        sizes: '156x156',
        type: 'image/png',
      },
      {
        url: '/icon-180.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/icon-180.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: [
      {
        url: '/favicon.ico',
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get('x-nonce');

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${quantico.variable} antialiased w-full flex flex-col`}>
        <Providers nonce={nonce}>
          <AppSidebar />
          <main className="flex flex-col w-full">
            <Header />
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
