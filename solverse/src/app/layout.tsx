import './globals.css'
import { CivicAuthProvider } from "@civic/auth/nextjs";
import { WalletProvider } from '../contexts/WalletProvider'
import { Audiowide, Montserrat } from 'next/font/google'

import AppLayout from "@/components/layout/AppLayout";
const audiowide = Audiowide({ subsets: ['latin'], weight: '400', variable: '--font-audiowide' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${audiowide.variable} ${montserrat.variable}`}>
      <body className="font-sans bg-background text-text-primary">
        <CivicAuthProvider>
          <WalletProvider>
            <AppLayout>
            {children}
            </AppLayout>
          </WalletProvider>
        </CivicAuthProvider>
      </body>
    </html>
  )
}