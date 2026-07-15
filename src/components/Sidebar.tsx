'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  BarChart3
} from 'lucide-react'
import PushToggle from '@/components/PushToggle'
import { TABS } from '@/components/MobileTabBar'
import { createClient } from '@/utils/supabase/client'

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetch('/api/admin/me')
      .then(res => res.json())
      .then(data => setIsAdmin(!!data.admin))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = saved || (systemDark ? 'dark' : 'light')
    // Sincroniza con localStorage tras montar: en SSR no hay window
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initialTheme)
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  }

  const handleLogout = async () => {
    try {
      await createClient().auth.signOut()
    } catch { /* sin sesión: ignorar */ }
    window.location.href = '/login'
  }

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: '/icons/time.png' },
    { label: 'Calendario', path: '/calendar', icon: '/icons/earth.png' },
    { label: 'Programa', path: '/habits', icon: '/icons/skull.png' },
    { label: 'Retos', path: '/challenges', icon: '/icons/armour.png' },
    { label: 'Recursos', path: '/resources', icon: '/icons/history-book.png' },
    { label: 'Diario', path: '/journal', icon: '/icons/papyrus.png' },
    { label: 'Evaluación', path: '/evaluation', icon: '/icons/harp.png' },
    { label: 'Preferencias', path: '/settings', icon: '/icons/amphora.png' },
  ]

  const toggleCollapsed = () => setCollapsed(!collapsed)
  const toggleMobile = () => setMobileOpen(!mobileOpen)

  const sidebarVariants = {
    expanded: { width: 240 },
    collapsed: { width: 70 },
  }

  const renderAdminLink = (isMobile: boolean) => {
    if (!isAdmin) return null
    const active = pathname === '/admin'
    return (
      <Link
        href="/admin"
        onClick={() => isMobile && setMobileOpen(false)}
        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
          active
            ? 'bg-[var(--primary-gold)]/10 text-[var(--primary-gold)]'
            : 'text-slate-450 dark:text-slate-400 hover:text-[var(--foreground)] hover:bg-slate-800/10'
        }`}
      >
        <BarChart3 className={`w-5 h-5 flex-shrink-0 ${active ? 'text-[var(--primary-gold)]' : 'opacity-60'}`} />
        {(!collapsed || isMobile) && <span className="truncate">Panel</span>}
      </Link>
    )
  }

  const renderNavItems = (isMobile = false) => {
    // En móvil la barra inferior ya tiene las rutas principales:
    // el drawer solo muestra el resto (Recursos, Evaluación)
    const tabPaths = new Set(TABS.map(t => t.path))
    const items = isMobile ? menuItems.filter(i => !tabPaths.has(i.path)) : menuItems
    return items.map((item) => {
      const active = pathname === item.path
      return (
        <Link
          key={item.path}
          href={item.path}
          onClick={() => isMobile && setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
            active
              ? 'bg-[var(--primary-gold)]/10 text-[var(--primary-gold)]'
              : 'text-slate-450 dark:text-slate-400 hover:text-[var(--foreground)] hover:bg-slate-800/10'
          }`}
        >
          <img
            src={item.icon}
            className={`w-5 h-5 object-contain transition-all duration-200 flex-shrink-0 ${
              active
                ? 'scale-115 filter drop-shadow-[0_0_3px_rgba(201,168,76,0.4)]'
                : 'opacity-60 group-hover:opacity-90 dark:invert dark:opacity-50 dark:group-hover:opacity-80'
            }`}
            alt={item.label}
          />
          {(!collapsed || isMobile) && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="truncate"
            >
              {item.label}
            </motion.span>
          )}
        </Link>
      )
    })
  }

  return (
    <>
      {/* Mobile Header */}
      <div
        className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--sidebar-bg)] border-b border-[var(--border-color)] sticky top-0 z-50"
        style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
      >
        <Link href="/" className="flex items-center gap-2">
          <img src="/sculpture.png" className="w-8 h-8 rounded-full object-cover border border-[#c9a84c]/30" alt="StoiCom Logo" />
          <span className="font-bold text-slate-100 tracking-wider">StoiCom</span>
        </Link>
        <button
          onClick={toggleMobile}
          className="p-1.5 rounded-lg bg-slate-800/50 text-slate-300 hover:text-slate-100"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-[60] flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobile}
              className="fixed inset-0 bg-black"
            />

            {/* Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="relative w-64 max-w-xs bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] h-full flex flex-col p-4 z-50"
            >
              <div className="flex items-center gap-2 mb-8 mt-2">
                <img src="/sculpture.png" className="w-8 h-8 rounded-full object-cover border border-[#c9a84c]/30" alt="StoiCom Logo" />
                <span className="font-bold text-slate-100 tracking-wider">StoiCom</span>
              </div>
              <nav className="flex-1 space-y-2">
                {renderNavItems(true)}
                {renderAdminLink(true)}
              </nav>
              <div className="pt-4 border-t border-[var(--border-color)] flex flex-col gap-3">
                <PushToggle />
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-800/10 dark:bg-slate-800/30 text-[var(--foreground)] hover:text-[var(--primary-gold)] transition-colors w-full"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-[#c9a84c]" />
                      <span className="text-xs font-medium">Modo Claro</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-[#ab841d]" />
                      <span className="text-xs font-medium">Modo Oscuro</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 p-2 rounded-lg bg-red-950/10 dark:bg-red-950/20 text-red-650 dark:text-red-400 hover:bg-red-900/10 transition-colors w-full"
                >
                  <i className="pi pi-sign-out text-sm" />
                  <span className="text-xs font-medium">Cerrar Sesión</span>
                </button>
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Memento Mori</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        animate={collapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
        className="hidden md:flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] h-screen sticky top-0 p-4 flex-shrink-0"
      >
        {/* Logo */}
        <div className="flex items-center justify-between mb-8 mt-2">
          {(!collapsed) ? (
            <Link href="/" className="flex items-center gap-2">
              <img src="/sculpture.png" className="w-8 h-8 rounded-full object-cover border border-[#c9a84c]/30" alt="StoiCom Logo" />
              <span className="font-bold text-slate-100 tracking-wider">StoiCom</span>
            </Link>
          ) : (
            <Link href="/" className="mx-auto">
              <img src="/sculpture.png" className="w-8 h-8 rounded-full object-cover border border-[#c9a84c]/30" alt="StoiCom Logo" />
            </Link>
          )}

          <button
            onClick={toggleCollapsed}
            className="p-1.5 rounded-lg bg-slate-800/20 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {renderNavItems(false)}
          {renderAdminLink(false)}
        </nav>

        {/* Footer */}
        <div className="pt-4 border-t border-[var(--border-color)] flex flex-col gap-2 items-center">
          <PushToggle collapsed={collapsed} />
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-800/10 dark:bg-slate-800/20 text-slate-500 hover:text-[var(--primary-gold)] hover:bg-slate-850/20 transition-colors flex items-center justify-center w-full"
            title="Cambiar tema"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-[#c9a84c]" />
                {!collapsed && <span className="text-xs text-slate-400 ml-2">Modo Claro</span>}
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#ab841d]" />
                {!collapsed && <span className="text-xs text-slate-650 ml-2">Modo Oscuro</span>}
              </>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-red-950/10 dark:bg-red-950/20 text-red-650 dark:text-red-400 hover:bg-red-900/10 transition-colors flex items-center justify-center w-full"
            title="Cerrar sesión"
          >
            <i className="pi pi-sign-out text-sm" />
            {!collapsed && <span className="text-xs ml-2">Cerrar Sesión</span>}
          </button>
          {!collapsed ? (
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Memento Mori</p>
          ) : (
            <span className="text-[10px] text-slate-500 font-bold">M</span>
          )}
        </div>
      </motion.div>
    </>
  )
}
