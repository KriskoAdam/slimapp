import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, DM_Sans } from 'next/font/google'
import Script from 'next/script' // <-- 1. Importuj Script komponent
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'SlimApp – Chudnem každý deň',
  description: 'Sleduj svoje chudnutie deň po dni. Každý gram sa počíta.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SlimApp',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sk" className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <head>
        {/* POZOR: Tu si skontroluj, či máš ikonu na tejto ceste, minule si spomínal app/ikona.png */}
        {/* Ak si ju dal do public/icon-192.png, zmeň href na "/icon-192.png" */}
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="bg-[#0a0a0a] text-white antialiased font-body overflow-x-hidden">
        <div className="min-h-screen max-w-md mx-auto relative">
          {children}
        </div>

        {/* 2. Registrácia Service Workera z public zložky */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/pwabuilder-sw.js').then(
                  function(registration) {
                    console.log('Service Worker zaregistrovaný úspešne: ', registration.scope);
                  },
                  function(err) {
                    console.log('Registrácia Service Workera zlyhala: ', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}
