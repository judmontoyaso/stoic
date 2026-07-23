import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/Sidebar"
import MobileTabBar from "@/components/MobileTabBar"
import PageTransition from "@/components/PageTransition"
import RegisterSW from "@/components/RegisterSW"
import { Toaster } from "react-hot-toast"

import { headers } from "next/headers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "StoiComunicación - Hábitos y Habilidades de Comunicación",
  description: "Entrena tus habilidades de comunicación y forma hábitos estoicos para liderar y conectar mejor. App instalable (PWA) con base de datos sincronizada.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StoiCom",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  }
}

export const viewport: Viewport = {
  themeColor: "#c9a84c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover"
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  // Pantallas sin sidebar: autenticación y páginas públicas
  const isLoginPage =
    pathname === '/login' ||
    pathname.startsWith('/auth/') ||
    pathname === '/landing' ||
    pathname === '/terms' ||
    pathname === '/privacy'

  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const saved = localStorage.getItem('theme');
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = saved === 'dark' || (!saved && systemDark);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })()
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased bg-[var(--background)] text-[var(--foreground)] flex flex-col md:flex-row min-h-screen transition-colors duration-200`}>
        <RegisterSW />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--card-bg)',
              color: 'var(--foreground)',
              border: '1px solid var(--border-color)',
              fontSize: '14px',
              fontFamily: 'var(--font-inter), sans-serif'
            },
          }}
        />
        {!isLoginPage && <Sidebar />}
        <main
          className={`flex-1 overflow-y-auto h-screen md:h-auto ${isLoginPage ? '' : 'pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0'}`}
        >
          <PageTransition>{children}</PageTransition>
        </main>
        {!isLoginPage && <MobileTabBar />}
      </body>
    </html>
  )
}
