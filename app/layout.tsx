import type {Metadata} from 'next';
import { Figtree } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
});

export const metadata: Metadata = {
  title: 'NeuroTracker',
  description: 'Acompanhamento de Sintomas e Saúde',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={figtree.variable}>
      <body suppressHydrationWarning className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
