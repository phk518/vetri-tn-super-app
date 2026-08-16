// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { LanguageProvider } from '@/layers/4_StateManagement/LanguageProvider';
import './globals.css';

// In Next.js 15+, viewport MUST be a separate named export — not inside metadata
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Vetri Tamil Nadu Super App',
  description: 'E-governance prototype with real-time SLA tracking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}