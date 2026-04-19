import { Cormorant_Garamond, Raleway } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { fetchRestaurantInfo } from '@/lib/fetchData'
import CustomCursor from '@/components/CustomCursor'
import PalaceGate from '@/components/PalaceGate'

import CartProviderWrapper from '@/components/CartProviderWrapper'
import { ModalProvider } from '@/context/ModalContext'
import CartDrawer from '@/components/CartDrawer'
import ItemModal from '@/components/ItemModal'
import NavigationProgressBar from '@/components/ProgressBar'
import CookieBanner from '@/components/CookieBanner'
import TouchRipple from '@/components/TouchRipple'
import MobileBottomNav from '@/components/MobileBottomNav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const body = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#C9A84C',
}

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Qasr Afghan',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const info = await fetchRestaurantInfo()

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} data-scroll-behavior="smooth">
      <body>
        <CustomCursor />
        <PalaceGate />
        <NavigationProgressBar />
        <CartProviderWrapper openingHours={info?.openingHours ?? []}>
          <ModalProvider>
            <MobileBottomNav />
            <TouchRipple />
            {children}
            <CartDrawer />
            <ItemModal />
          </ModalProvider>
        </CartProviderWrapper>
        <CookieBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
