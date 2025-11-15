import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TRIONFET LIVE',
  description: 'Segnapunti live per Trionfet',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-gradient-to-br from-green-900 to-black text-white">
        {children}
      </body>
    </html>
  );
}