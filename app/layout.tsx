import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ask It Out — Anonymous Thoughts for College',
  description:
    'Say what you really think, anonymously. Ask It Out lets college students share honest, anonymous thoughts with each other.',
  keywords: ['anonymous', 'college', 'opinion', 'thoughts', 'students'],
  openGraph: {
    title: 'Ask It Out',
    description: 'What do they really think about you?',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FAFAFA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#FAFAFA] text-[#1C1C1E] antialiased font-sans">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
