import type { Metadata } from 'next';
import { Cormorant_Garamond } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Kabirul Hassan — Software Engineer',
  description: 'Building elegant solutions with modern web technologies',
  keywords: ['Software Engineer', 'Fullstack Developer', 'React', 'Next.js', 'TypeScript'],
  authors: [{ name: 'Kabirul Hassan' }],
  openGraph: {
    title: 'Kabirul Hassan — Software Engineer',
    description: 'Building elegant solutions with modern web technologies',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cormorant.variable}>{children}</body>
    </html>
  );
}

