import type {Metadata} from 'next';
import { Figtree } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { InactivityGuard } from '@/components/InactivityGuard';

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
});

export const metadata: Metadata = {
  title: 'Prisma - Neurodiversidade e Autoconhecimento',
  description: 'Transformando desafios em clareza e conexão.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={figtree.variable}>
      <body suppressHydrationWarning className="antialiased">
        <AuthProvider>
          {children}
          <InactivityGuard />
        </AuthProvider>
      </body>
    </html>
  );
}
