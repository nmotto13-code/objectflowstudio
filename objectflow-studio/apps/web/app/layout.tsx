import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ObjectFlow Studio',
  description: 'Enterprise process automation built on schema-on-write with AI inference.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  );
}
