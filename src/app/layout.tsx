import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/Sidebar"
import RegisterSW from "@/components/RegisterSW"
import { Toaster } from "react-hot-toast"

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.variable} antialiased bg-[#0a0a0f] text-slate-100 flex flex-col md:flex-row min-h-screen`}>
        <RegisterSW />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#111116',
              color: '#f8fafc',
              border: '1px solid #1e1e28',
              fontSize: '14px',
              fontFamily: 'var(--font-inter), sans-serif'
            },
          }}
        />
        <Sidebar />
        <main className="flex-1 overflow-y-auto h-screen md:h-auto pb-16 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  )
}
