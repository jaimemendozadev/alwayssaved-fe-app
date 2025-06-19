import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { HeroUIProvider } from '@heroui/react';
import { Toaster } from 'react-hot-toast';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title:
    '🧠 AlwaysSaved - Your Private, Searchable Knowledge Base for Your Info',
  description: 'alwayssaved-fe-app'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Toaster />
          <HeroUIProvider>{children}</HeroUIProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
